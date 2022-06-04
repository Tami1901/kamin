import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  SimpleGrid,
  Spinner,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  VStack,
} from "@chakra-ui/react";
import { NextPage } from "next";
import useSWR from "swr";
import { number } from "zod";
import { DefaultLayout } from "../../layout";
import { ListResources } from "../roles";
import { RoomsList } from "../rooms";

const RoomStat: React.FC<{ users: RoomOccupancy | undefined }> = ({
  users,
}) => {
  return (
    <Flex justifyContent="center">
      <Stat>
        <StatLabel>In</StatLabel>
        <StatNumber>345,670</StatNumber>
        <StatHelpText>
          <StatArrow type="increase" />
          23.36%
        </StatHelpText>
      </Stat>

      <Flex>
        {users?.map((u) => (
          <Box key={u.id} mr="4">
            {u.user.fullName}
          </Box>
        ))}
      </Flex>
      <HStack>
        <Button colorScheme="green">Open</Button>
        <Button colorScheme="red">Close</Button>
      </HStack>
    </Flex>
  );
};

type RoomOccupancy = {
  id: number;
  room: {
    id: number;
    description: string;
  };
  user: {
    id: number;
    fullName: string;
    role: {
      id: number;
      roleName: string;
    };
  };
}[];

const Occupancy: NextPage = () => {
  const { data, error } = useSWR<RoomOccupancy>(
    "/api/userRelations/occupancyAll"
  );
  const { data: rooms, error: roomsError } = useSWR<RoomsList>("/api/rooms");
  const { data: userHasAccessData, error: userHasAccessError } = useSWR<
    ListResources<
      "hasAccessDTOes",
      { userId: number; fullName: string; rooms: { id: number }[] }
    >
  >("/api/users/hasAccess");

  const byRoom = userHasAccessData?._embedded.hasAccessDTOes.reduce<
    Record<
      number,
      { id: number; fullName: string; isCurrentlyInRoom: boolean }[]
    >
  >((all, current) => {
    Array.from(new Set([...current.rooms.map((r) => r.id)])).forEach(
      (roomId) => {
        if (!all[roomId]) {
          all[roomId] = [];
        }

        all[roomId].push({
          id: current.userId,
          fullName: current.fullName,
          isCurrentlyInRoom: !!data?.find(
            (a) => a.user.id === current.userId && a.room.id === roomId
          ),
        });
      }
    );

    return all;
  }, {});

  return (
    <DefaultLayout>
      <Box>
        <>
          <Flex
            justifyContent="center"
            backgroundColor="gray.100"
            py="10px"
            mb="10px"
          >
            <Heading color="gray.800">Occupancy</Heading>
          </Flex>
          <VStack align="stretch" px="10" pt="6" spacing="8">
            {roomsError ? (
              <div>failed to load</div>
            ) : !rooms ? (
              <Spinner />
            ) : (
              rooms._embedded.rooms.map((room, _index) => (
                <SimpleGrid
                  key={room.id}
                  backgroundColor="gray.100"
                  p="4"
                  borderRadius="5px"
                  columns={4}
                >
                  <Heading
                    size="md"
                    mb="4"
                    textDecoration="underline"
                    color="gray.800"
                    alignSelf="center"
                    pl="10"
                  >
                    <Link href="rooms">{room.description}</Link>
                  </Heading>
                  <Box>
                    <Stat alignItems="center">
                      <StatLabel>In</StatLabel>
                      <StatNumber>
                        {data?.filter((d) => d.room.id === room.id)?.length}
                      </StatNumber>
                      {/* <StatNumber>{byRoom?.[room.id]?.length}</StatNumber> */}
                      <StatHelpText>
                        <StatArrow type="increase" />
                        {data &&
                          Math.round(
                            byRoom?.[room?.id]
                              ? (data?.filter((d) => d.room.id === room.id)
                                  ?.length /
                                  byRoom?.[room?.id]?.length) *
                                  100
                              : 0
                          )}
                        %
                      </StatHelpText>
                    </Stat>
                  </Box>

                  <Flex alignItems="center">
                    {byRoom?.[room.id]
                      ?.filter((a) => a.isCurrentlyInRoom)
                      .map((a) => a.fullName)
                      .join(", ")}
                  </Flex>
                  <HStack justifyContent="flex-end">
                    <Button colorScheme="green">Open</Button>
                    <Button colorScheme="red">Lock</Button>
                  </HStack>
                </SimpleGrid>
              ))
            )}
          </VStack>
        </>
      </Box>
    </DefaultLayout>
  );
};

export default Occupancy;
