import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Editable,
  Flex,
  Heading,
  HStack,
  IconButton,
  Spinner,
  useToast,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useConfirm, useConfirmDelete } from "chakra-confirm";
import { DataTable } from "chakra-data-table";
import { LinkButton, LinkIconButton } from "chakra-next-link";
import type { NextPage } from "next";
import useSWR from "swr";
import { GetRole } from "../../fetchers/GetRole";
import { GetTag } from "../../fetchers/GetTag";
import { DefaultLayout } from "../../layout";

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

export type User = {
  id: number;
  fullName: string;
  _links: {
    role: {
      href: string;
    };
  };
};

export type UsersList = ListResources<"users", User>;

export type Tag = {
  id: number;
  serialCode: string;
  _links: {
    user: {
      href: string;
    };
  };
};

export type TagsList = ListResources<"yags", Tag>;

const Rooms: NextPage = () => {
  const { data, error } = useSWR<UsersList>("/api/users");
  const { data: tagsData, error: tagsError } = useSWR<TagsList>("/api/tags");

  console.log(tagsData);
  const toast = useToast();
  const confirm = useConfirmDelete();
  const handleDelete = async (id: number) => {
    if (await confirm()) {
      try {
        await axios.delete(`/api/users/${id}`);
        toast({ status: "success", title: "User deleted" });
      } catch (error) {
        toast({ status: "error", title: "Error deleting user" });
      }
    }
  };

  return (
    <DefaultLayout>
      <Box justifyContent="center">
        <Flex
          justifyContent="center"
          backgroundColor="gray.100"
          py="10px"
          mb="10px"
        >
          <Heading color="gray.800">Users</Heading>
          <LinkButton
            href="/users/new"
            colorScheme="green"
            size="sm"
            aria-label={"Create user"}
            position="absolute"
            right="40px"
            mt="4px"
          >
            New User
          </LinkButton>
        </Flex>
        {error ? (
          <div>failed to load</div>
        ) : !data ? (
          <Spinner />
        ) : (
          <Flex justifyContent="center">
            <DataTable
              data={data._embedded?.users}
              keys={["id", "name", "role", "tag", "actions"] as const}
              mapper={{
                id: true,
                name: (user: User) => user.fullName,
                role: (user) => <GetRole url={user._links.role.href} />,
                tag: (user) => "01234567",
                actions: (row) => (
                  <HStack>
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
  );
};

export default Rooms;
