import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';

export default function ModalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="flex-1 bg-background items-center justify-center px-6"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Pressable
        onPress={() => router.back()}
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
        style={{ top: insets.top + 12 }}
      >
        <Icon as={X} className="text-foreground" size="sm" />
      </Pressable>

      <Text className="text-muted-foreground text-center">Modal content goes here.</Text>
    </Box>
  );
}
