import { Heading, Spinner, Tag } from "@chakra-ui/react";
import useSWR from "swr";
import { Role } from "pages/roles";

export const GetRole: React.FC<{ url: string }> = ({ url }) => {
  const { data, error } = useSWR<Role>(url);
  if (error) {
    return <div>failed to load</div>;
  }
  if (!data) {
    return <Spinner />;
  }

  return (
    <Tag
      backgroundColor={
        data.roleName === "ROLE_ADMIN" ? "orange.200" : "gray.200"
      }
    >
      {data.roleName.slice(5)}
    </Tag>
  );
};
