import React, { useState } from "react";
import { DeleteIcon, EditIcon, MinusIcon } from "@chakra-ui/icons";
import {
  Box,
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
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useConfirmDelete } from "chakra-confirm";
import { DataTable } from "chakra-data-table";
import { LinkButton, LinkIconButton } from "chakra-next-link";
import type { NextPage } from "next";
import useSWR from "swr";
import { DefaultLayout } from "../../layout";
import { GrUserSettings } from "react-icons/gr";
import { Form, ReactSelectField } from "chakra-form";
import { User, UsersList } from "../users";

const UsersModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { data, error } = useSWR("/api/users");
  const mapData = data
    ? data._embedded.users.map((user: User) => {
        return {
          value: user.id,
          label: user.fullName,
        };
      })
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit users in room</ModalHeader>
        <ModalBody>
          <Form onSubmit={() => console.log("here")}>
            <Heading size="md" mb="4">
              Add users
            </Heading>
            <ReactSelectField name="users" options={mapData} />

            <Heading size="md" mt="10" mb="4">
              Users already in group
            </Heading>
            <DataTable
              data={data?._embedded?.users}
              keys={["name", "actions"] as const}
              mapper={{
                name: (user: User) => user.fullName,
                actions: (row) => (
                  <HStack>
                    <IconButton
                      aria-label="Remove user from group"
                      colorScheme="red"
                      color="white"
                      size="sm"
                      onClick={() => console.log("Here")}
                      icon={<MinusIcon color="white" />}
                    />
                  </HStack>
                ),
              }}
            />
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={onClose}>
            Close
          </Button>
          <Button colorScheme="blue">Save</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

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

type RoomsList = ListResources<"rooms", Room>;

const Rooms: NextPage = () => {
  const { data, error } = useSWR<RoomsList>("/api/rooms");
  const { data: userData } = useSWR<UsersList>("/api/users");
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  console.log(data);

  return (
    <>
      <UsersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
              New group
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
                  ["id", "description", "admin", "users", "actions"] as const
                }
                mapper={{
                  id: true,
                  description: true,
                  admin: () =>
                    userData ? (
                      userData._embedded.users.map((user) => user.fullName)[0]
                    ) : (
                      <Spinner />
                    ),
                  users: () =>
                    userData ? (
                      userData._embedded.users
                        .map((user) => user.fullName)
                        .join(", ")
                    ) : (
                      <Spinner />
                    ),
                  actions: (row) => (
                    <HStack>
                      <IconButton
                        aria-label="Edit users"
                        colorScheme="yellow"
                        color="white"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
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
