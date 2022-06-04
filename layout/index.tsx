import { Box, Flex, Heading, HStack } from "@chakra-ui/layout";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
} from "@chakra-ui/react";
import { Link } from "chakra-next-link";
import useSWR from "swr";
import { useAuthContext } from "components/AuthContext";

export const DefaultLayout = ({ children }: any) => {
  const { handleLogout } = useAuthContext();
  const { data } = useSWR("/api/auth/me");

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
              {data ? (
                <Avatar name={data.fullName} />
              ) : (
                <Spinner height="48px" width="48px" />
              )}
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      <Box>{children}</Box>
    </Box>
  );
};
