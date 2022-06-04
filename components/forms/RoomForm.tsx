import { DeleteIcon } from "@chakra-ui/icons";
import {
  useToast,
  Flex,
  Spinner,
  HStack,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import axios from "axios";
import { useConfirmDelete } from "chakra-confirm";
import { DataTable } from "chakra-data-table";
import { Form, InputField } from "chakra-form";
import { LinkButton } from "chakra-next-link";
import { NextPage } from "next";
import { useRouter } from "next/router";
import useSWR from "swr";
import { z } from "zod";

const roomSchema = z.object({
  description: z.string(),
});

export type RoomFormType = z.infer<typeof roomSchema>;

export const RoomForm: React.FC<{
  value?: RoomFormType;
  onSubmit: (values: RoomFormType) => Promise<void>;
}> = ({ value, onSubmit }) => {
  return (
    <Form
      onSubmit={onSubmit}
      initialValues={value}
      submitText={value ? "Update" : "Create"}
      wrapProps={{ w: "60%", margin: "0 auto" }}
      buttonsLeft={<LinkButton href="/rooms">Cancel</LinkButton>}
    >
      <InputField name="description" />
    </Form>
  );
};
