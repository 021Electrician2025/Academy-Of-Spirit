import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioStatus } from 'expo-audio';
import { Clock, Headphones, Pause, Play } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  createMeditationSession,
  fetchGuidedMeditations,
  fetchLastIncompleteSession,
  getMeditationAudioUrl,
  updateMeditationSession,
  type GuidedMeditation,
} from '@/lib/meditations';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MeditateScreen() {
  const insets = useSafeAreaInsets();

  const [meditations, setMeditations] = useState<GuidedMeditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GuidedMeditation | null>(null);

  const currentSessionIdRef = useRef<string | null>(null);
  const sessionSavedRef = useRef(false);

  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  const scale = useSharedValue(1);
  const outerOpacity = useSharedValue(0.3);

  // Audio session config
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

  // Fetch meditations
  useEffect(() => {
    const controller = new AbortController();
    fetchGuidedMeditations(controller.signal)
      .then(setMeditations)
      .catch((err: Error) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

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

  useEffect(() => {
    if (status.didJustFinish && selected && !sessionSavedRef.current) {
      sessionSavedRef.current = true;
      saveSession(true);
    }
  }, [status.didJustFinish]);

  const saveSession = async (isCompleted: boolean) => {
    if (!currentSessionIdRef.current) return;
    await updateMeditationSession(
      currentSessionIdRef.current,
      Math.floor(player.currentTime),
      isCompleted
    );
  };

  const selectMeditation = async (med: GuidedMeditation) => {
    const prevSessionId = currentSessionIdRef.current;
    const prevPosition = Math.floor(player.currentTime);
    if (prevSessionId && prevPosition > 0) {
      await updateMeditationSession(prevSessionId, prevPosition, false);
    }
    sessionSavedRef.current = false;
    setSelected(med);

    const lastSession = await fetchLastIncompleteSession(med.id);
    const url = getMeditationAudioUrl(med);

    if (lastSession && lastSession.position > 0) {
      currentSessionIdRef.current = lastSession.id;
      const subscription = player.addListener('playbackStatusUpdate', async (s: AudioStatus) => {
        if (s.isLoaded) {
          await player.seekTo(lastSession.position);
          player.play();
          subscription.remove();
        }
      });
      player.replace({ uri: url });
    } else {
      currentSessionIdRef.current = lastSession?.id ?? await createMeditationSession(med.id);
      player.replace({ uri: url });
      player.play();
    }
  };

  const togglePlay = () => {
    if (!selected) return;
    if (status.playing) {
      player.pause();
      saveSession(false);
    } else {
      if (status.didJustFinish) player.seekTo(0);
      player.play();
    }
  };

  const progress = selected && status.duration > 0 ? status.currentTime / status.duration : 0;

  const circleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const outerStyle = useAnimatedStyle(() => ({ opacity: outerOpacity.value }));

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <Box className="px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <Text size="2xl" bold className="text-foreground tracking-tight">Meditate</Text>
        <Text size="sm" className="text-muted-foreground mt-1">Breathe. Be present. Transcend.</Text>
      </Box>

      {/* Player Hero Card */}
      <Box className="mx-6 my-3 bg-hero rounded-3xl p-6 items-center" style={{ gap: 20 }}>
        {/* Breathing Circle */}
        <Box className="items-center justify-center" style={{ height: 210 }}>
          <Animated.View
            style={[
              { position: 'absolute', width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(199,159,39,0.19)' },
              outerStyle,
            ]}
          />
          <Animated.View
            style={[
              { width: 160, height: 160, borderRadius: 80, backgroundColor: '#1A2035', borderWidth: 2.5, borderColor: 'rgba(199,159,39,1)', alignItems: 'center', justifyContent: 'center' },
              circleStyle,
            ]}
          >
            {!selected ? (
              <Icon as={Headphones} className="text-primary" size="xl" />
            ) : (
              <VStack space="xs" className="items-center">
                <Text size="2xs" bold className="text-primary tracking-widest uppercase">
                  {status.playing ? 'Playing' : 'Paused'}
                </Text>
                <Text size="2xs" className="text-white/40">
                  {formatTime(status.currentTime)} / {formatTime(status.duration || selected.duration_seconds)}
                </Text>
              </VStack>
            )}
          </Animated.View>
        </Box>

        {/* Track Info */}
        {selected ? (
          <VStack space="xs" className="items-center w-full">
            <Text size="md" bold className="text-white text-center" numberOfLines={1}>
              {selected.title}
            </Text>
            {!!selected.description && (
              <Text size="xs" className="text-white/45 text-center" numberOfLines={2}>
                {selected.description}
              </Text>
            )}
          </VStack>
        ) : (
          <Text size="sm" className="text-white/35 text-center">
            Select a session below to begin
          </Text>
        )}

        {/* Progress Bar */}
        <Box className="w-full h-[3px] bg-white/8 rounded-full">
          <Box
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </Box>

        {/* Play/Pause Button */}
        <Pressable
          onPress={togglePlay}
          disabled={!selected}
          className={`w-16 h-16 rounded-full items-center justify-center ${selected ? 'bg-primary' : 'bg-white/8'}`}
        >
          {status.playing ? (
            <Icon as={Pause} className="text-primary-foreground fill-primary-foreground" size="lg" />
          ) : (
            <Icon
              as={Play}
              className={selected ? 'text-primary-foreground fill-primary-foreground' : 'text-white/25 fill-white/25'}
              size="lg"
            />
          )}
        </Pressable>
      </Box>

      {/* Sessions List */}
      <Box className="px-6 mt-2">
        <Text size="md" bold className="text-foreground mb-3">Sessions</Text>

        {loading ? (
          <Spinner className="text-primary mt-8" />
        ) : error ? (
          <Text size="sm" className="text-destructive text-center mt-8">{error}</Text>
        ) : meditations.length === 0 ? (
          <Text size="sm" className="text-muted-foreground text-center mt-8">No meditations available yet.</Text>
        ) : (
          <VStack space="sm">
            {meditations.map((med) => {
              const isActive = selected?.id === med.id;
              return (
                <Pressable
                  key={med.id}
                  onPress={() => selectMeditation(med)}
                  className={`flex-row items-center p-3.5 rounded-2xl border ${isActive ? 'bg-primary/8 border-primary' : 'bg-card border-border'}`}
                  style={{ gap: 12 }}
                >
                  <Box
                    className={`w-10 h-10 rounded-full items-center justify-center ${isActive ? 'bg-primary' : 'bg-border'}`}
                  >
                    {isActive && status.playing ? (
                      <Icon as={Pause} className="text-primary-foreground fill-primary-foreground" size="sm" />
                    ) : (
                      <Icon
                        as={Play}
                        className={isActive ? 'text-primary-foreground fill-primary-foreground' : 'text-muted-foreground fill-muted-foreground'}
                        size="sm"
                      />
                    )}
                  </Box>

                  <VStack space="xs" className="flex-1">
                    <Text
                      size="sm"
                      bold
                      className={isActive ? 'text-primary' : 'text-foreground'}
                      numberOfLines={1}
                    >
                      {med.title}
                    </Text>
                    {!!med.description && (
                      <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
                        {med.description}
                      </Text>
                    )}
                  </VStack>

                  <HStack space="xs" className="items-center">
                    <Icon as={Clock} className="text-muted-foreground" size="2xs" />
                    <Text size="xs" className="text-muted-foreground">{formatTime(med.duration_seconds)}</Text>
                  </HStack>
                </Pressable>
              );
            })}
          </VStack>
        )}
      </Box>
    </ScrollView>
  );
}
