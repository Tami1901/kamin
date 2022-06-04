import useSWR from "swr";
import { useMemo } from "react";
import { useConfirmDelete, usePrompt } from "chakra-confirm";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { RolesList } from "pages/roles";
import { Select } from "chakra-form";

type HasRoleAccessEntry = {
  user: { id: number; fullName: string };
  isViaRole: boolean;
} & ({ isViaHasAccess: false } | { isViaHasAccess: true; hasAccessId: number });

export const useRoomPermissions = () => {
  const allAccessSWR = useSWR<{
    hasAccess: {
      id: number;
      user: { id: number; fullName: string };
      room: { id: number };
      note: string;
    }[];
    roleHasAccess: {
      id: number;
      role: { id: number; roleName: string };
      room: { id: number };
    }[];
    users: { id: number; fullName: string; role: { id: number } }[];
  }>("/api/userRelations/allAccessStuff");

  const byRoom = useMemo(() => {
    if (!allAccessSWR.data) {
      return null;
    }

    const { hasAccess, roleHasAccess, users } = allAccessSWR.data;

    const returnObj: Record<number, HasRoleAccessEntry[]> = {};

    hasAccess.forEach((acc) => {
      if (!returnObj[acc.room.id]) {
        returnObj[acc.room.id] = [];
      }

      returnObj[acc.room.id].push({
        isViaRole: false,
        isViaHasAccess: true,
        hasAccessId: acc.id,
        user: acc.user,
      });
    });

    roleHasAccess.forEach((roleHasAccessObj) => {
      if (!returnObj[roleHasAccessObj.room.id]) {
        returnObj[roleHasAccessObj.room.id] = [];
      }

      users
        .filter((user) => user.role.id === roleHasAccessObj.role.id)
        .forEach((user) => {
          const index = returnObj[roleHasAccessObj.room.id].findIndex(
            (obj) => obj.user.id === user.id
          );

          if (index === -1) {
            returnObj[roleHasAccessObj.room.id].push({
              isViaRole: true,
              isViaHasAccess: false,
              user,
            });
          } else {
            returnObj[roleHasAccessObj.room.id][index].isViaRole = true;
          }
        });
    });

    return returnObj;
  }, [allAccessSWR.data]);

  const byRoomRoles = useMemo(() => {
    if (!allAccessSWR.data) {
      return {};
    }

    return allAccessSWR.data.roleHasAccess.reduce<
      Record<
        number,
        { id: number; roleName: string; roleHasAccessId: number }[]
      >
    >((acc, curr) => {
      if (!acc[curr.room.id]) {
        acc[curr.room.id] = [];
      }

      acc[curr.room.id].push({ ...curr.role, roleHasAccessId: curr.id });
      return acc;
    }, {});
  }, [allAccessSWR.data]);

  const toast = useToast();
  const onAddUserToRoom = async (
    roomId: number,
    userId: number,
    fullName: string
  ) => {
    const entry = byRoom?.[roomId]?.find((obj) => obj.user.id === userId);
    if (entry) {
      if (entry.isViaRole) {
        return toast({
          title: "User already has access via role",
          description: `${fullName} already has access via role`,
          status: "error",
          isClosable: true,
          duration: 1000,
        });
      }
      return;
    }

    try {
      const body = {
        user: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/users/${userId}`,
        room: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/rooms/${roomId}`,
      };
      console.log(body);
      await axios.post(`/api/hasAccess`, body);
      toast({
        title: "User added",
        description: `${fullName} added to room`,
        status: "success",
      });
      await allAccessSWR.mutate((data) => {
        if (!data) return data;
        return {
          ...data,
          hasAccess: [
            ...data.hasAccess,
            {
              id: 0,
              user: { id: userId, fullName },
              room: { id: roomId },
              note: "",
            },
          ],
        };
      });
    } catch (e: any) {
      toast({
        title: "Error adding user to room",
        description: e.message,
        status: "error",
      });
    }
  };

  const confirmDelete = useConfirmDelete();
  const onRemoveUserFromRoom = (roomId: number, userId: number) => async () => {
    const entry = byRoom?.[roomId].find((obj) => obj.user.id === userId);
    if (!entry) {
      return;
    }

    if (entry.isViaRole) {
      return toast({
        status: "error",
        title: "Can't remove user from room",
        description: "User is via role and not via has access",
        isClosable: true,
        duration: 1000,
      });
    }

    if (!entry.isViaHasAccess) {
      return;
    }

    if (!(await confirmDelete({ title: "Remove user from room" }))) {
      return;
    }

    try {
      await axios.delete(`/api/hasAccess/${entry.hasAccessId}`);
      toast({
        status: "success",
        title: "User removed from room",
      });

      await allAccessSWR.mutate((data) => {
        if (!data) return data;
        return {
          ...data,
          hasAccess: data.hasAccess.filter(
            (obj) => obj.id !== entry.hasAccessId
          ),
        };
      });
    } catch (err: any) {
      toast({
        status: "error",
        title: "Error removing user from room",
        description: err.message,
      });
    }
  };

  const prompt = usePrompt();
  const onAddRoleToRoom =
    (roomId: number, rolesList: RolesList) => async () => {
      const filteredRoles = rolesList._embedded.userRoles.filter(
        (role) => !byRoomRoles[roomId]?.find((a) => a.id === role.id)
      );
      if (filteredRoles.length === 0) {
        toast({
          status: "error",
          title: "You can't add more roles to this room",
        });
        return;
      }

      const roleId = await prompt({
        defaultState: filteredRoles[0].id.toString(),
        customBody: ({ setState, state }) => (
          <Select
            noLabel
            value={state}
            onChange={(e) => setState(e.target.value)}
          >
            {filteredRoles.map((role) => (
              <option value={role.id} key={role.id}>
                {role.roleName}
              </option>
            ))}
          </Select>
        ),
      });

      if (!roleId) {
        return null;
      }

      try {
        await axios.post(`/api/roleHasAccess`, {
          room: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/rooms/${roomId}`,
          role: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/roles/${roleId}`,
        });
        allAccessSWR.mutate(async (data) => {
          if (!data) return data;
          return {
            ...data,
            roleHasAccess: [
              ...data.roleHasAccess,
              {
                id: 0,
                room: { id: roomId },
                role: {
                  id: Number(roleId),
                  roleName: rolesList._embedded.userRoles.find(
                    (r) => r.id === Number(roleId)
                  )?.roleName!,
                },
              },
            ],
          };
        });

        toast({ status: "success", title: "Role added" });
      } catch (err: any) {
        toast({
          status: "error",
          title: "Error adding role to room",
          description: err.message,
        });
      }
    };

  const onRemoveRoleFromRoom = (roomId: number, roleId: number) => async () => {
    const entry = byRoomRoles?.[roomId].find((obj) => obj.id === roleId);
    if (!entry) {
      return;
    }

    if (!(await confirmDelete({ title: "Remove role from room" }))) {
      return;
    }

    try {
      await axios.delete(`/api/roleHasAccess/${entry.roleHasAccessId}`);
      allAccessSWR.mutate(async (data) => {
        if (!data) return data;
        return {
          ...data,
          roleHasAccess: data.roleHasAccess.filter(
            (obj) => obj.id !== entry.roleHasAccessId
          ),
        };
      });
      toast({ status: "success", title: "Role removed" });
    } catch (err: any) {
      toast({
        status: "error",
        title: "Error removing role from room",
        description: err.message,
      });
    }
  };

  return {
    byRoom,
    byRoomRoles,
    onRemoveUserFromRoom,
    onAddUserToRoom,
    onAddRoleToRoom,
    onRemoveRoleFromRoom,
  };
};
