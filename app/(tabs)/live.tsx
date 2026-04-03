import { Calendar, Clock, Users } from 'lucide-react-native';
import React, { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

const LIVE_SESSION = {
  title: 'Morning Stillness',
  host: 'Dr. Sarah Chen',
  viewers: '1.2k',
  duration: '32 min live',
  topic: 'Mindfulness',
};

const UPCOMING = [
  { time: '2:00 PM', title: 'Breathwork for Energy', host: 'James Park', duration: '45 min', day: 'Today', color: '#1A2B4A' },
  { time: '5:00 PM', title: 'Evening Wind Down', host: 'Emma Wilson', duration: '30 min', day: 'Today', color: '#2D1A4A' },
  { time: '9:00 AM', title: 'Power of Presence', host: 'Dr. Raj Patel', duration: '60 min', day: 'Tomorrow', color: '#1A3A2A' },
  { time: '7:00 PM', title: 'Chakra Alignment', host: 'Lisa Torres', duration: '50 min', day: 'Thu', color: '#3A2A1A' },
];

function PulseDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 900 }), -1, true);
    scale.value = withRepeat(withTiming(1.8, { duration: 900 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Box className="w-3 h-3 items-center justify-center">
      <Animated.View
        style={[
          { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: color },
          animStyle,
        ]}
      />
      <Box className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
    </Box>
  );
}

export default function LiveScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <Box className="px-6 pb-5" style={{ paddingTop: insets.top + 16 }}>
        <Heading size="2xl" className="text-foreground tracking-tight">Live</Heading>
        <Text size="sm" className="text-muted-foreground mt-1">Join live meditation sessions</Text>
      </Box>

      {/* Live Now Card */}
      <Box className="mx-6 mb-7">
        <Box className="bg-hero rounded-3xl overflow-hidden p-6">
          {/* Live badge */}
          <HStack space="sm" className="items-center mb-5">
            <PulseDot color="#EF4444" />
            <Text size="xs" bold className="text-destructive tracking-widest uppercase">Live Now</Text>
          </HStack>

          <VStack space="xs" className="mb-5">
            <Heading size="xl" className="text-white tracking-tight">{LIVE_SESSION.title}</Heading>
            <Text size="sm" className="text-white/55">with {LIVE_SESSION.host}</Text>
          </VStack>

          <HStack space="xl" className="mb-6">
            <HStack space="xs" className="items-center">
              <Icon as={Users} className="text-white/50" size="xs" />
              <Text size="sm" className="text-white/60">{LIVE_SESSION.viewers} watching</Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <Icon as={Clock} className="text-white/50" size="xs" />
              <Text size="sm" className="text-white/60">{LIVE_SESSION.duration}</Text>
            </HStack>
          </HStack>

          <Button variant="destructive" size="lg" className="w-full rounded-2xl">
            <ButtonText className="font-bold">Join Session</ButtonText>
          </Button>
        </Box>
      </Box>

      {/* Upcoming */}
      <VStack space="md" className="px-6">
        <HStack space="sm" className="items-center mb-1">
          <Icon as={Calendar} className="text-muted-foreground" size="sm" />
          <Text size="md" bold className="text-foreground">Upcoming Sessions</Text>
        </HStack>

        {UPCOMING.map((session, i) => (
          <Pressable
            key={i}
            className="flex-row items-center bg-card rounded-[18px] overflow-hidden border border-border"
          >
            {/* Time column */}
            <Box
              className="w-[70px] py-[18px] items-center justify-center"
              style={{ backgroundColor: session.color, gap: 2 }}
            >
              <Text size="2xs" className="text-white/60">{session.day}</Text>
              <Text size="sm" bold className="text-white">{session.time}</Text>
            </Box>

            <VStack space="xs" className="flex-1 p-3.5">
              <Text size="sm" bold className="text-foreground">{session.title}</Text>
              <Text size="xs" className="text-muted-foreground">{session.host}</Text>
              <HStack space="xs" className="items-center mt-1">
                <Icon as={Clock} className="text-muted-foreground" size="2xs" />
                <Text size="xs" className="text-muted-foreground">{session.duration}</Text>
              </HStack>
            </VStack>

            <Button
              variant="ghost"
              size="sm"
              className="mr-3.5 bg-primary/13 rounded-xl"
            >
              <ButtonText className="text-primary">Remind</ButtonText>
            </Button>
          </Pressable>
        ))}
      </VStack>
    </ScrollView>
  );
}
