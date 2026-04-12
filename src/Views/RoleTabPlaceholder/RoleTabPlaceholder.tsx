import { Layout, Text } from "@ui-kitten/components";

import { styles } from "./RoleTabPlaceholder.styles";
import type { RoleTabPlaceholderProps } from "./RoleTabPlaceholder.types";
import { useRoleTabPlaceholder } from "./useRoleTabPlaceholder";

export const RoleTabPlaceholder = (props: RoleTabPlaceholderProps) => {
  const { title, body } = useRoleTabPlaceholder(props);

  return (
    <Layout style={styles.layout}>
      <Text category="h6" style={styles.title}>
        {title}
      </Text>
      <Text category="s1" style={styles.body}>
        {body}
      </Text>
    </Layout>
  );
};
