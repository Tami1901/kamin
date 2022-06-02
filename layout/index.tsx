import { Box, Flex, Heading, HStack } from "@chakra-ui/layout";
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Link } from "chakra-next-link";

export const DefaultLayout = ({ children }: any) => {
  return (
    <Box>
      <Flex
        justifyContent="space-between"
        backgroundColor="gray.700"
        p="16px 36px"
      >
        <Heading size="lg" color="white" fontFamily="monospace">
          KAMIN
        </Heading>
        <HStack spacing="6">
          <Link
            href="/users"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Users
          </Link>
          <Link
            href="/roles"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Roles
          </Link>
          <Link
            href="/rooms"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Rooms
          </Link>
          <Link
            href="/tags"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Tags
          </Link>
          <Link
            href="/occupancy"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Occupancy
          </Link>
          <Link
            href="/monitoring"
            color="white"
            _activeLink={{ fontWeight: "bold", color: "blue.200" }}
          >
            Monitoring
          </Link>
          <Menu>
            <MenuButton>
              <Avatar name="Tamara Luzija" />
            </MenuButton>
            <MenuList>
              <MenuItem>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};
