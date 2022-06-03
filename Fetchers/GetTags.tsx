import { Spinner, Tag, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useConfirmDelete } from "chakra-confirm";
import useSWR from "swr";

export const GetTags: React.FC<{ id: number }> = ({ id }) => {
  const { data, error, mutate } = useSWR(`/api/userRelations/${id}/tags`);

  const toast = useToast();
  const confirm = useConfirmDelete();
  const handleDelete = async (id: number) => {
    if (await confirm()) {
      try {
        await axios.delete(`/api/tags/${id}`);
        toast({ status: "success", title: "Tag deleted" });
        mutate(data.filter((tags: any) => tags.id !== id));
      } catch (error) {
        toast({ status: "error", title: "Error deleting tag" });
      }
    }
  };

  if (error) {
    return <Text>Error</Text>;
  }
  if (!data) {
    return <Spinner />;
  }
  return (
    <>
      {data.map((tag: any) => (
        <Tag
          key={tag.id.toString()}
          _hover={{
            cursor: "pointer",
            backgroundColor: "red.200",
          }}
          onClick={() => handleDelete(tag.id)}
          mr="4"
        >
          ID={tag.serialCode}
        </Tag>
      ))}
    </>
  );
};
