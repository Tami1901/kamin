import { useToast, Spinner, Box, Flex, Heading } from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { RoomForm, RoomFormType } from "../../../components/forms/RoomForm";
import { DefaultLayout } from "../../../layout";

const EditRooms: NextPage = () => {
  const router = useRouter();
  const { data, error, mutate } = useSWR(
    router.query.id ? "/api/rooms/" + router.query.id : null
  );
  const toast = useToast();
  if (!data) return <Spinner />;

  const onSubmit = async (values: RoomFormType) => {
    axios
      .put(`/api/rooms/${router.query.id}`, values)
      .then(() => {
        toast({
          status: "success",
          title: "Room updated",
        });
        router.push("/rooms");
        mutate();
        mutate("/api/rooms");
      })
      .catch((error) => {
        toast({
          status: "error",
          title: "Error creating room",
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
            Edit group
          </Heading>
        </Flex>
        <RoomForm onSubmit={onSubmit} value={data} />;
      </Box>
    </DefaultLayout>
  );
};

export default EditRooms;
