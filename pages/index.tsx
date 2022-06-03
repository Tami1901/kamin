import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import { Form, InputField } from "chakra-form";
import { Link } from "chakra-next-link";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useSWRConfig } from "swr";
import { z } from "zod";
import { useAuthContext } from "../AuthContext";

const schema = z.object({
  username: z.string(),
  // email: z.string().email(),
  password: z.string().min(6),
});

const Home: NextPage = () => {
  const { handleLoginToken } = useAuthContext();
  const router = useRouter();
  const global = useSWRConfig();

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const res = await axios.post(`/api/auth/login`, data);
      await global.mutate(`/api/auth/me`);
      handleLoginToken(res.data.token);
      router.push("/users");
    } catch (err) {
      // @ts-ignore
      console.log(err.response.data);
    }
  };

  return (
    <Flex h="100vh" justifyContent="center" backgroundColor="gray.200">
      <Box
        width="60%"
        mt="10"
        height="70%"
        // border="1px solid"
        borderRadius="5px"
        // borderColor="gray.800"
        backgroundColor="gray.50"
        shadow="dark-lg"
      >
        <Heading
          fontFamily="monospace"
          color="blue.800"
          fontSize="60"
          textAlign="center"
          pt="10"
        >
          KAMIN
        </Heading>
        <Heading
          fontFamily="monospace"
          color="blue.800"
          fontSize="30"
          textAlign="center"
        >
          Log in
        </Heading>
        <Form
          schema={schema}
          onSubmit={onSubmit}
          initialValues={{
            username: "tamtam",
            // email: "foo@bar.com",
            password: "tamtam",
          }}
        >
          <VStack w="50%" mt="2" align="flex-start" spacing={6}>
            <InputField name="username" />

            {/* <InputField name="email" /> */}

            <InputField name="password" />

            <Button type="submit" alignSelf="center" colorScheme="blue">
              Submit
            </Button>
          </VStack>
        </Form>
        <Flex pt="10" justifyContent="center">
          <Text color="gray.800" mr="1">
            Don{"'"}t have an account?
          </Text>
          <Link href="/register" color="blue">
            Sign up
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Home;
