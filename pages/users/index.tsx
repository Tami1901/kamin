import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
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
import {
  useConfirm,
  useConfirmDelete,
  usePrompt,
  usePromptWithClose,
} from "chakra-confirm";
import { DataTable } from "chakra-data-table";
import { LinkButton, LinkIconButton } from "chakra-next-link";
import type { NextPage } from "next";
import useSWR, { useSWRConfig } from "swr";
import { GetRole } from "../../fetcher/GetRole";
import { GetTags } from "../../fetcher/GetTags";
import { DefaultLayout } from "../../layout";
import { getResourceUrl } from "../_app";

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
    self: {
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

export type TagsList = ListResources<"tags", Tag>;

const Rooms: NextPage = () => {
  const { data, error } = useSWR<UsersList>("/api/users");
  const global = useSWRConfig();

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

  const prompt = usePrompt({ title: "Add new tag for user" });
  const addNewTag = (userId: number, userThingy: string) => async () => {
    const serial = await prompt();
    if (!serial) {
      return;
    }

    try {
      await axios.post("/api/tags", {
        serialCode: serial,
        user: userThingy,
      });

      global.mutate(`/api/userRelations/${userId}/tags`, (tags: any) => [
        ...tags,
        { id: "_newTag", serialCode: serial },
      ]);
      toast({ status: "success", title: "Tag added" });
    } catch (error) {
      toast({ status: "error", title: "Error adding tag" });
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
              keys={["id", "name", "role", "tags", "actions"] as const}
              mapper={{
                id: true,
                name: (user) => user.fullName,
                role: (user) => <GetRole url={user._links.role.href} />,
                tags: (user) => <GetTags id={user.id} />,
                actions: (user) => (
                  <HStack>
                    <Button
                      size="sm"
                      onClick={addNewTag(user.id, user._links.self.href)}
                    >
                      Add new tag
                    </Button>
                    <LinkIconButton
                      aria-label="Edit"
                      size="sm"
                      colorScheme="blue"
                      icon={<EditIcon />}
                      href={`/rooms/${user.id}/edit`}
                    />
                    <IconButton
                      aria-label="Delete"
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
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
