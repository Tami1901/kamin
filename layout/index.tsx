import { Box, Flex, Heading, HStack } from "@chakra-ui/layout";
import {
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { Link } from "chakra-next-link";
import useSWR from "swr";
import { useAuthContext } from "components/AuthContext";
import { useState } from "react";

export const DefaultLayout = ({ children }: any) => {
  const { handleLogout } = useAuthContext();
  const { data } = useSWR("/api/auth/me");
  const toast = useToast();

  const [loadings, setLoadings] = useState<string[]>([]);

  const onLambda = (path: string) => async () => {
    console.log(path);
    try {
      setLoadings([...loadings, path]);
      const res = await fetch(`/aws_lambda/${path}`);
      if (res.ok) {
        toast({
          status: "success",
          title: `${
            path === "lockdown"
              ? "All doors are locked"
              : path === "emergency"
              ? "All doors are unlocked"
              : "All locks are reset"
          }`,
        });
      }
    } finally {
      setLoadings((prev) => prev.filter((p) => p !== path));
    }
  };

  const lambdaProps = (path: string) => ({
    onClick: onLambda(path),
    isLoading: loadings.includes(path),
  });

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        backgroundColor="gray.700"
        p="16px 36px"
      >
        <Link
          href="/occupancy"
          color="white"
          _activeLink={{ fontWeight: "bold", color: "blue.200" }}
        >
          <Heading size="lg" color="white" fontFamily="monospace">
            KAMIN
          </Heading>
        </Link>
        <HStack spacing="6">
          <Button {...lambdaProps("lockdown")}>Lock all</Button>
          <Button {...lambdaProps("emergency")}>UnLock all</Button>
          <Button {...lambdaProps("reset")}>Reset locks</Button>

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
