import { Box, Flex, Heading, HStack } from "@chakra-ui/layout";
import { Link } from "chakra-next-link";

export const DefaultLayout = ({ children }: any) => {
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        mb="10px"
        backgroundColor="gray.700"
        p="16px 36px"
      >
        <Heading size="lg" color="white" fontFamily="monospace">
          KAMIN
        </Heading>
        <HStack spacing="6">
          <Link href="/" color="white" _activeLink={{ fontWeight: "bold" }}>
            Groups
          </Link>
          <Link
            href="/students"
            color="white"
            _activeLink={{ fontWeight: "bold" }}
          >
            Students
          </Link>
        </HStack>
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};
