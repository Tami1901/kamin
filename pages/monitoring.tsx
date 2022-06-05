import React from "react";
import { NextPage } from "next";
import useSWR from "swr";
import { Box, Flex, Heading, Spinner } from "@chakra-ui/react";
import { DataTable } from "chakra-data-table";

import { ListResources } from "types";
import { GetRoom } from "components/fetcher/GetRoom";
import { GetUserByEventId } from "components/fetcher/GetUserByEventId";
import { DefaultLayout } from "layout";

type Event = {
  id: number;
  tstmp: string;
  isEntry: boolean;
  _links: Record<"self" | "tag" | "room", { href: string }>;
};

const MonitoringPage: NextPage = () => {
  const { data, error } = useSWR<ListResources<"events", Event>>(
    `/api/events?sort=id,desc`,
    { refreshInterval: 1000 }
  );

  return (
    <DefaultLayout>
      <Box justifyContent="center">
        <Flex
          justifyContent="center"
          backgroundColor="gray.100"
          py="10px"
          mb="10px"
        >
          <Heading color="gray.800">Last 20 events</Heading>
        </Flex>

        {error && <p>Error fetching events</p>}
        {!data && <Spinner />}
        {data && (
          <DataTable
            keys={["time", "room", "user", "direction"] as const}
            data={data._embedded.events}
            mapper={{
              time: (event) => new Date(event.tstmp).toString().slice(0, 24),
              room: (event) => <GetRoom url={event._links.room.href} />,
              user: (event) => <GetUserByEventId eventId={event.id} />,
              direction: (event) =>
                event.isEntry === null
                  ? "Denied access"
                  : event.isEntry
                  ? "Entry"
                  : "Exit",
            }}
          />
        )}
      </Box>
    </DefaultLayout>
  );
};

export default MonitoringPage;
