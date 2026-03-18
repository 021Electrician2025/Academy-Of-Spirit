import { useRouter } from 'expo-router';
import { ChevronDown, Headphones, Pause, Play } from 'lucide-react-native';
import React, { useCallback, useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAudio } from '@/context/audio-context';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { status, selected, progress, togglePlay } = useAudio();
  const scale = useSharedValue(1);
  const outerOpacity = useSharedValue(0.3);

  const startBreathing = useCallback(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.3, { duration: 4000 }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000 })
      ),
      -1
    );
    outerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 4000 }), withTiming(0.6, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 }), withTiming(0.2, { duration: 4000 })
      ),
      -1
    );
  }, []);

  const stopBreathing = useCallback(() => {
    scale.value = withTiming(1, { duration: 600 });
    outerOpacity.value = withTiming(0.3, { duration: 600 });
  }, []);

  useEffect(() => {
    if (status.playing) { startBreathing(); } else { stopBreathing(); }
  }, [status.playing]);

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const outerStyle = useAnimatedStyle(() => ({ opacity: outerOpacity.value }));

  return (
    <Box className="flex-1 bg-hero items-center" style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}>
      {/* Top bar */}
      <HStack className="w-full px-6 items-center justify-between mb-8">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/10"
        >
          <Icon as={ChevronDown} className="text-white" size="lg" />
        </Pressable>
        <VStack className="items-center flex-1">
          <Text size="xs" className="text-white/50 uppercase tracking-widest">Now Playing</Text>
        </VStack>
        <Box className="w-10" />
      </HStack>

      {/* Breathing Circle */}
      <Box className="flex-1 items-center justify-center">
        <Box className="items-center justify-center" style={{ height: 280 }}>
          <Animated.View
            style={[
              { position: 'absolute', width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(199,159,39,0.19)' },
              outerStyle,
            ]}
          />
          <Animated.View
            style={[
              { width: 200, height: 200, borderRadius: 100, backgroundColor: '#1A2035', borderWidth: 2.5, borderColor: 'rgba(199,159,39,1)', alignItems: 'center', justifyContent: 'center' },
              circleStyle,
            ]}
          >
            {!selected ? (
              <Icon as={Headphones} className="text-primary" size="xl" />
            ) : (
              <VStack space="xs" className="items-center">
                <Text size="xs" bold className="text-primary tracking-widest uppercase">
                  {status.playing ? 'Playing' : 'Paused'}
                </Text>
                <Text size="2xs" className="text-white/40">
                  {formatTime(status.currentTime)} / {formatTime(status.duration || selected?.duration_seconds || 0)}
                </Text>
              </VStack>
            )}
          </Animated.View>
        </Box>
      </Box>

      {/* Track Info + Controls */}
      <VStack space="lg" className="w-full px-8 items-center">
        {/* Track name */}
        <VStack space="xs" className="items-center w-full">
          <Text size="xl" bold className="text-white text-center" numberOfLines={2}>
            {selected?.title ?? 'No track selected'}
          </Text>
          {!!selected?.description && (
            <Text size="sm" className="text-white/50 text-center" numberOfLines={2}>
              {selected.description}
            </Text>
          )}
        </VStack>

        {/* Progress */}
        <VStack space="xs" className="w-full">
          <Box className="w-full h-1 bg-white/15 rounded-full">
            <Box
              className="h-full bg-primary rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
          </Box>
          <HStack className="w-full justify-between">
            <Text size="2xs" className="text-white/40">{formatTime(status.currentTime)}</Text>
            <Text size="2xs" className="text-white/40">
              {formatTime(status.duration || selected?.duration_seconds || 0)}
            </Text>
          </HStack>
        </VStack>

        {/* Play/Pause */}
        <Pressable
          onPress={togglePlay}
          disabled={!selected}
          className={`w-20 h-20 rounded-full items-center justify-center ${selected ? 'bg-primary' : 'bg-white/10'}`}
        >
          {status.playing ? (
            <Icon as={Pause} className="text-primary-foreground fill-primary-foreground" size="xl" />
          ) : (
            <Icon
              as={Play}
              className={selected ? 'text-primary-foreground fill-primary-foreground' : 'text-white/25 fill-white/25'}
              size="xl"
            />
          )}
        </Pressable>
      </VStack>
    </Box>
  );
}
