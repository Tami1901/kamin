import { Heading, Spinner, Text } from "@chakra-ui/react";
import useSWR from "swr";
import { Tag } from "../pages/users";

export const GetTag: React.FC<{ url: string }> = ({ url }) => {
  const { data, error } = useSWR<Tag>(url);
  if (error) {
    return <div>failed to load</div>;
  }
  if (!data) {
    return <Spinner />;
  }

  return <Text>{data.serialCode}</Text>;
};
