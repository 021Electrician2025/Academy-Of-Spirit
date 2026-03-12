import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function Index() {
  const { user, isLoading } = useAuth();
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={c.gold} size="large" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />;
}
