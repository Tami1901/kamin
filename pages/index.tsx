import { Box, Flex, Heading, VStack } from "@chakra-ui/react";
import { LinkButton } from "chakra-next-link";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  return (
    <Flex h="100vh" justifyContent="center">
      <VStack
        width="40%"
        h="40%"
        mt="40"
        borderRadius="5px"
        justifyContent="center"
        spacing={40}
      >
        <Heading fontFamily="monospace" color="blue.200" fontSize="60">
          KAMIN
        </Heading>
        <LinkButton
          size="lg"
          fontFamily="monospace"
          p="40px 60px"
          color="blue.800"
          _hover={{ color: "white", backgroundColor: "blue.600" }}
          _active={{ color: "white", backgroundColor: "blue.800" }}
          href="/rooms/"
        >
          Login
        </LinkButton>
      </VStack>
    </Flex>
  );
};

export default Home;
