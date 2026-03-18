import { Button, Layout, Text } from '@ui-kitten/components';
import { useAuthStore } from '@/stores/authStore';

export default function HomeTab() {
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Início</Text>

      <Button onPress={signOut} style={{ marginTop: 16 }}>
        Logout
      </Button>
    </Layout>
  );
}

