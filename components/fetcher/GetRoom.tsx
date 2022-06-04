import React from "react";
import { Spinner, Text } from "@chakra-ui/react";
import useSWR from "swr";

import { Room } from "pages/rooms";

export const GetRoom: React.FC<{ url: string }> = ({ url }) => {
  const { data, error } = useSWR<Room>(url);
  if (error) {
    return <div>failed to load</div>;
  }
  if (!data) {
    return <Spinner />;
  }

  return <Text>{data.description}</Text>;
};
