import React, { useRef, useState } from "react";
import useSWR from "swr";
import {
  Button,
  Flex,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { Form, FormHandler, ReactSelectField } from "chakra-form";
import { DataTable } from "chakra-data-table";
import { MinusIcon } from "@chakra-ui/icons";

import { useRoomPermissions } from "hooks/useRoomPermissions";
import { UsersList } from "pages/users";
import { z } from "zod";
import { Rerender, RerenderHandle } from "components/Rerender";

type InnerProps = {
  roomId: number;
  roomStuff: ReturnType<typeof useRoomPermissions>;
};

const schema = z.object({ userId: z.string() });

const RoomUsersModalInner: React.FC<InnerProps> = ({ roomId, roomStuff }) => {
  const { data, error } = useSWR<UsersList>("/api/users");
  const [addLoading, setAddLoading] = useState(false);
  const ref = useRef<FormHandler<typeof schema>>(null);
  const rerenderRef = useRef<RerenderHandle>(null);

  if (!roomStuff.byRoom) {
    return (
      <ModalBody>
        <Spinner />
      </ModalBody>
    );
  }

  if (error) {
    return (
      <ModalBody>
        <Heading>Error fetching users</Heading>
      </ModalBody>
    );
  }

  const mapData = data?._embedded.users
    .filter(
      (user) => !roomStuff.byRoom?.[roomId]?.find((e) => e.user.id === user.id)
    )
    .map((user) => ({
      value: String(user.id),
      label: user.fullName,
    }));

  const onAdd = async (formData: z.infer<typeof schema>) => {
    const user = data?._embedded.users.find(
      (u) => u.id === parseInt(formData.userId)
    );
    if (!user) {
      return;
    }

    setAddLoading(true);
    try {
      await roomStuff.onAddUserToRoom(roomId, user.id, user.fullName);
      ref.current?.setValue("userId", undefined as any);
      rerenderRef.current?.rerender();
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <ModalBody>
      <Heading size="md" mb="4">
        Add users
      </Heading>
      <Form onSubmit={onAdd} schema={schema} ref={ref}>
        <Flex w="full" justify="space-between" align="flex-start">
          <Rerender ref={rerenderRef}>
            {mapData ? (
              <ReactSelectField
                isSingle
                name="userId"
                options={mapData}
                noLabel
              />
            ) : (
              <Spinner />
            )}
          </Rerender>

          <Button ml="2" type="submit" isLoading={addLoading}>
            Add
          </Button>
        </Flex>
      </Form>

      <Heading size="md" mt="10" mb="4">
        Users already in group
      </Heading>
      <DataTable
        data={roomStuff.byRoom[roomId] || []}
        keys={["name", "actions"] as const}
        mapper={{
          name: (user) => user.user.fullName,
          actions: (row) => (
            <HStack>
              <Tooltip
                label={
                  row.isViaRole
                    ? "You can't remove users with role permission"
                    : "Remove"
                }
                shouldWrapChildren
              >
                <IconButton
                  aria-label="Remove user from group"
                  colorScheme="red"
                  color="white"
                  size="sm"
                  isDisabled={row.isViaRole}
                  onClick={roomStuff.onRemoveUserFromRoom(roomId, row.user.id)}
                  icon={<MinusIcon color="white" />}
                />
              </Tooltip>
            </HStack>
          ),
        }}
      />
    </ModalBody>
  );
};

type Props = {
  roomId: number | undefined;
  setRoomId: (roomId: number | undefined) => void;
  roomStuff: ReturnType<typeof useRoomPermissions>;
};

export const RoomUsersModal: React.FC<Props> = (props) => {
  const { roomId, setRoomId, roomStuff } = props;
  const onClose = () => setRoomId(undefined);

  return (
    <Modal isOpen={!!roomId} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit users in room</ModalHeader>
        {roomId && (
          <RoomUsersModalInner roomId={roomId} roomStuff={roomStuff} />
        )}

        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
