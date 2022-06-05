import { Box, Flex, Heading, Spinner, useToast } from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { DefaultLayout } from "layout";
import { UserForm, UserFormType } from "components/forms/UserForm";
import useSWR from "swr";

const CreateRooms: NextPage = () => {
  const toast = useToast();
  const router = useRouter();
  const userSWR = useSWR(
    router.query.id === undefined
      ? null
      : `/api/userRelations/${router.query.id}/role`
  );

  const onSubmit = async (values: UserFormType) => {
    axios
      .patch(`/api/users/${router.query.id}`, { ...values })
      .then(() => {
        toast({
          status: "success",
          title: "User updated",
        });
        userSWR.mutate((data: any) => {
          if (!data) return data;

          return {
            ...data,
            fullName: values.fullName,
            role: { id: values.role.split("/").at(-1) },
          };
        });
        router.push("/users");
      })
      .catch((error) => {
        toast({
          status: "error",
          title: "Error updating user",
        });
      });
  };

  return (
    <DefaultLayout>
      <Box justifyContent="center">
        <Flex
          justifyContent="center"
          backgroundColor="gray.100"
          py="10px"
          mb="30px"
        >
          <Heading size="lg" color="gray.800">
            Update user
          </Heading>
        </Flex>
        {userSWR.data ? (
          <UserForm
            onSubmit={onSubmit}
            value={{
              ...userSWR.data,
              role: `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/userRoles/${userSWR.data.role.id}`,
            }}
          />
        ) : (
          <Spinner />
        )}
      </Box>
    </DefaultLayout>
  );
};

export default CreateRooms;
