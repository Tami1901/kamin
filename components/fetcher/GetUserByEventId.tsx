import React from "react";
import { Spinner, Text } from "@chakra-ui/react";
import useSWR from "swr";

export const GetUserByEventId: React.FC<{ eventId: number }> = ({
  eventId,
}) => {
  const { data, error } = useSWR<{ id: number; fullName: string }>(
    `/api/userRelations/byEvent/${eventId}`
  );
  if (error) {
    return <div>failed to load</div>;
  }
  if (!data) {
    return <Spinner />;
  }

  return <Text>{data.fullName}</Text>;
};
