import { Spinner } from "@chakra-ui/react";
import { Form, InputField, SelectField } from "chakra-form";
import { LinkButton } from "chakra-next-link";
import useSWR from "swr";
import { z } from "zod";
import { RolesList } from "pages/roles";

const userSchema = z.object({
  fullName: z.string(),
  role: z.string(),
});

export type UserFormType = z.infer<typeof userSchema>;

export const UserForm: React.FC<{
  value?: UserFormType;
  onSubmit: (values: UserFormType) => Promise<void>;
}> = ({ value, onSubmit }) => {
  const { data: rolesData } = useSWR<RolesList>("/api/userRoles");
  if (!rolesData) {
    return <Spinner />;
  }

  return (
    <Form
      onSubmit={onSubmit}
      initialValues={value}
      submitText={value ? "Update" : "Create"}
      wrapProps={{ w: "60%", margin: "0 auto" }}
      buttonsLeft={<LinkButton href="/users">Cancel</LinkButton>}
    >
      <InputField name="fullName" />
      <SelectField name="role" placeholder="Choose role">
        {rolesData._embedded.userRoles.map((role) => (
          <option key={role.id} value={role._links.self.href}>
            {role.roleName}
          </option>
        ))}
      </SelectField>
    </Form>
  );
};
