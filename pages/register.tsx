import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";
import { Form, InputField } from "chakra-form";
import { Link } from "chakra-next-link";
import type { NextPage } from "next";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

const Home: NextPage = () => {
  return (
    <Flex h="100vh" justifyContent="center" backgroundColor="gray.200">
      <Box
        width="60%"
        mt="10"
        height="80%"
        borderRadius="5px"
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
          Sign up
        </Heading>
        <Form
          schema={schema}
          onSubmit={(data) => {
            alert({
              title: "Submitted data",
              body: (
                <Code whiteSpace="pre" w="full">
                  {JSON.stringify(data, null, 2)}
                </Code>
              ),
            });
          }}
          initialValues={{
            name: "Foo",
            email: "foo@bar.com",
            password: "password",
          }}
        >
          <VStack w="50%" mt="2" align="flex-start" spacing={6}>
            <InputField name="name" />

            <InputField name="email" />

            <InputField name="password" />

            <Button type="submit" alignSelf="center" colorScheme="blue">
              Submit
            </Button>
          </VStack>
        </Form>
        <Flex pt="10" justifyContent="center">
          <Text color="gray.800" mr="1">
            Already have an account?
          </Text>
          <Link href="/" color="blue">
            Login here
          </Link>
        </Flex>
      </Box>
    </Flex>
  );
};

export default Home;
