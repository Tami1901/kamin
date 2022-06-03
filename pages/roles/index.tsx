import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
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

export type Role = {
  id: number;
  roleName: string;
  _links: {
    self: {
      href: string;
    };
  };
};

export type RolesList = ListResources<"userRoles", Role>;

const Roles: NextPage = () => {
  const { data, error } = useSWR<RolesList>("/api/userRoles");

  const toast = useToast();
  const confirm = useConfirmDelete();
  const handleDelete = async (id: number) => {
    if (await confirm()) {
      try {
        await axios.delete(`/api/userRoles/${id}`);
        toast({ status: "success", title: "Role deleted" });
      } catch (error) {
        toast({ status: "error", title: "Error deleting role" });
      }
    }
  };

  console.log(data);

  return (
    <DefaultLayout>
      <Box justifyContent="center">
        <Flex
          justifyContent="center"
          backgroundColor="gray.100"
          py="10px"
          mb="10px"
        >
          <Heading color="gray.800">User roles</Heading>
        </Flex>
        {error ? (
          <div>failed to load</div>
        ) : !data ? (
          <Spinner />
        ) : (
          <Flex justifyContent="center">
            <DataTable
              data={data._embedded?.userRoles}
              keys={["id", "roleName"] as const}
              mapper={{
                id: true,
                roleName: true,
              }}
            />
          </Flex>
        )}
      </Box>
    </DefaultLayout>
  );
};

export default Roles;
