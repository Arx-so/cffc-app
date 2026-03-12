import { Button, Layout, Text } from "@ui-kitten/components";

import { useAuthStore } from "@/stores/authStore";

const Inbox = () => {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Layout style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Inbox</Text>
      <Button onPress={signOut} style={{ marginTop: 16 }}>
        Logout
      </Button>
    </Layout>
  );
};

export default Inbox;
