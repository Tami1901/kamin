import { DeleteIcon } from "@chakra-ui/icons";
import {
  useToast,
  Flex,
  Spinner,
  HStack,
  IconButton,
  Heading,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { RoomForm, RoomFormType } from "../../forms/RoomForm";
import { DefaultLayout } from "../../layout";

const CreateRooms: NextPage = () => {
  const toast = useToast();
  const router = useRouter();
  const onSubmit = async (values: RoomFormType) => {
    axios
      .post("/api/rooms", values)
      .then(() => {
        toast({
          status: "success",
          title: "Room created",
        });
        router.push("/rooms");
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
            Add new group
          </Heading>
        </Flex>
        <RoomForm onSubmit={onSubmit} />
      </Box>
    </DefaultLayout>
  );
};

export default CreateRooms;
