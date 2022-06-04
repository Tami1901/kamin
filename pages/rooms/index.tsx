import React, { useState } from "react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  Tag,
  Text,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useConfirmDelete, usePrompt } from "chakra-confirm";
import { DataTable } from "chakra-data-table";
import { LinkButton, LinkIconButton } from "chakra-next-link";
import type { NextPage } from "next";
import useSWR from "swr";
import { GrUserSettings } from "react-icons/gr";
import { DefaultLayout } from "layout";
import { RoomUsersModal } from "components/forms/Room/RoomUsersModal";
import { useRoomPermissions } from "hooks/useRoomPermissions";
import { RolesList } from "pages/roles";
import { Select } from "chakra-form";

type ListResources<K extends string, V> = {
  _embedded: Record<K, V[]>;
  _links: Record<"self" | "profile", { href: string }>;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
};

export type Room = {
  id: number;
  description: string;
};

export type RoomsList = ListResources<"rooms", Room>;

const Rooms: NextPage = () => {
  const { data, error } = useSWR<RoomsList>("/api/rooms");
  const rolesSWR = useSWR<RolesList>("/api/userRoles");
  const roomStuff = useRoomPermissions();

  const [roomId, setRoomId] = useState<number>();

  const toast = useToast();
  const confirm = useConfirmDelete();
  const handleDelete = async (id: number) => {
    if (await confirm()) {
      try {
        await axios.delete(`/api/rooms/${id}`);
        toast({ status: "success", title: "Room deleted" });
      } catch (error) {
        toast({ status: "error", title: "Error deleting room" });
      }
    }
  };

  return (
    <>
      <RoomUsersModal
        roomId={roomId}
        setRoomId={setRoomId}
        roomStuff={roomStuff}
      />

      <DefaultLayout>
        <Box justifyContent="center">
          <Flex
            justifyContent="center"
            backgroundColor="gray.100"
            py="10px"
            mb="10px"
          >
            <Heading color="gray.800">Rooms</Heading>
            <LinkButton
              href="/rooms/new"
              colorScheme="green"
              size="sm"
              aria-label={"Create group"}
              position="absolute"
              right="40px"
              mt="4px"
            >
              New room
            </LinkButton>
          </Flex>
          {error ? (
            <div>failed to load</div>
          ) : !data ? (
            <Spinner />
          ) : (
            <Flex justifyContent="center">
              <DataTable
                data={data._embedded?.rooms}
                keys={
                  ["id", "description", "users", "roles", "actions"] as const
                }
                labels={{ roles: "Allowed roles" }}
                mapper={{
                  id: true,
                  description: true,
                  users: (row) =>
                    roomStuff.byRoom ? (
                      <Text>
                        {(roomStuff.byRoom[row.id] || [])
                          .map(
                            (entry) =>
                              `${entry.user.fullName}${
                                entry.isViaRole && !entry.isViaHasAccess
                                  ? "*"
                                  : ""
                              }`
                          )
                          .join(", ")}
                      </Text>
                    ) : (
                      <Spinner />
                    ),
                  roles: (row) =>
                    roomStuff.byRoomRoles ? (
                      <>
                        {(roomStuff.byRoomRoles[row.id] || []).map((s) => (
                          <Tag
                            key={s.roleHasAccessId}
                            onClick={roomStuff.onRemoveRoleFromRoom(
                              row.id,
                              s.id
                            )}
                            _hover={{
                              backgroundColor: "red.200",
                              cursor: "pointer",
                            }}
                            mr="1"
                            mb="1"
                          >
                            {s.roleName}
                          </Tag>
                        ))}
                      </>
                    ) : (
                      <Spinner />
                    ),
                  actions: (row) => (
                    <HStack>
                      <Button
                        size="sm"
                        onClick={roomStuff.onAddRoleToRoom(
                          row.id,
                          rolesSWR.data!
                        )}
                        isDisabled={!rolesSWR.data || rolesSWR.error}
                      >
                        Add new role
                      </Button>
                      <IconButton
                        aria-label="Edit users"
                        colorScheme="yellow"
                        color="white"
                        size="sm"
                        onClick={() => setRoomId(row.id)}
                        icon={<GrUserSettings color="white" />}
                      />
                      <LinkIconButton
                        aria-label="Edit"
                        size="sm"
                        colorScheme="blue"
                        icon={<EditIcon />}
                        href={`/rooms/${row.id}/edit`}
                      />
                      <IconButton
                        aria-label="Delete"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(row.id)}
                        icon={<DeleteIcon />}
                      />
                    </HStack>
                  ),
                }}
              />
            </Flex>
          )}
        </Box>
      </DefaultLayout>
    </>
  );
};

export default Rooms;
