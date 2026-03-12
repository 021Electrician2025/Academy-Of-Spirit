import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioStatus } from 'expo-audio';
import { Clock, Headphones, Pause, Play } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

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
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  // Breathing animation
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
        withTiming(0.6, { duration: 4000 }),
        withTiming(0.6, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 }),
        withTiming(0.2, { duration: 4000 })
      ),
      -1
    );
  }, []);

  const stopBreathing = useCallback(() => {
    scale.value = withTiming(1, { duration: 600 });
    outerOpacity.value = withTiming(0.3, { duration: 600 });
  }, []);

  useEffect(() => {
    if (status.playing) {
      startBreathing();
    } else {
      stopBreathing();
    }
  }, [status.playing]);

  // Save session on finish
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
      Math.floor(player.currentTime), // read directly from player, not stale status closure
      isCompleted
    );
  };

  const selectMeditation = async (med: GuidedMeditation) => {
    // Snapshot position NOW before the player source is swapped
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
      // Resume: reuse the existing session record and seek to last position
      currentSessionIdRef.current = lastSession.id;
      const subscription = player.addListener('playbackStatusUpdate', async (s: AudioStatus) => {
        if (s.isLoaded) {
          await player.seekTo(lastSession.position); // await so play() fires after seek completes
          player.play();
          subscription.remove();
        }
      });
      player.replace({ uri: url });
    } else {
      // Fresh start: reuse existing record (position 0) or create a new one
      currentSessionIdRef.current = lastSession?.id ?? await createMeditationSession(med.id);
      player.replace({ uri: url });
      player.play();
    }
  };

  const togglePlay = () => {
    if (!selected) return;
    if (status.playing) {
      player.pause();
      saveSession(false); // save position every time user pauses
    } else {
      if (status.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const progress =
    selected && status.duration > 0 ? status.currentTime / status.duration : 0;

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const outerStyle = useAnimatedStyle(() => ({
    opacity: outerOpacity.value,
  }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 8 }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
          Meditate
        </Text>
        <Text style={{ color: c.muted, fontSize: 14, marginTop: 4 }}>
          Breathe. Be present. Transcend.
        </Text>
      </View>

      {/* Player Hero Card */}
      <View
        style={{
          marginHorizontal: 24,
          marginVertical: 12,
          backgroundColor: '#0F1628',
          borderRadius: 24,
          padding: 24,
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Breathing Circle */}
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 210 }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 210,
                height: 210,
                borderRadius: 105,
                backgroundColor: c.gold + '30',
              },
              outerStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: '#1A2035',
                borderWidth: 2.5,
                borderColor: c.gold,
                alignItems: 'center',
                justifyContent: 'center',
              },
              circleStyle,
            ]}
          >
            {!selected ? (
              <Headphones color={c.gold} size={30} strokeWidth={1.5} />
            ) : (
              <View style={{ alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    color: c.gold,
                    fontSize: 12,
                    fontWeight: '700',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                  }}
                >
                  {status.playing ? 'Playing' : 'Paused'}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                  {formatTime(status.currentTime)} / {formatTime(status.duration || selected.duration_seconds)}
                </Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Track Info */}
        {selected ? (
          <View style={{ alignItems: 'center', gap: 4, width: '100%' }}>
            <Text
              style={{ color: '#FFFFFF', fontSize: 17, fontWeight: '700', textAlign: 'center' }}
              numberOfLines={1}
            >
              {selected.title}
            </Text>
            {!!selected.description && (
              <Text
                style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center' }}
                numberOfLines={2}
              >
                {selected.description}
              </Text>
            )}
          </View>
        ) : (
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 14, textAlign: 'center' }}>
            Select a session below to begin
          </Text>
        )}

        {/* Progress Bar */}
        <View
          style={{
            width: '100%',
            height: 3,
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: 2,
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: c.gold,
              borderRadius: 2,
            }}
          />
        </View>

        {/* Play/Pause Button */}
        <TouchableOpacity
          onPress={togglePlay}
          disabled={!selected}
          activeOpacity={0.85}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: selected ? c.gold : 'rgba(255,255,255,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {status.playing ? (
            <Pause
              color={isDark ? '#121212' : '#211E1F'}
              size={24}
              fill={isDark ? '#121212' : '#211E1F'}
            />
          ) : (
            <Play
              color={selected ? (isDark ? '#121212' : '#211E1F') : 'rgba(255,255,255,0.25)'}
              size={24}
              fill={selected ? (isDark ? '#121212' : '#211E1F') : 'rgba(255,255,255,0.25)'}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <View style={{ paddingHorizontal: 24, marginTop: 8 }}>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', marginBottom: 12 }}>
          Sessions
        </Text>

        {loading ? (
          <ActivityIndicator color={c.gold} style={{ marginTop: 32 }} />
        ) : error ? (
          <Text style={{ color: '#E57373', fontSize: 14, textAlign: 'center', marginTop: 32 }}>
            {error}
          </Text>
        ) : meditations.length === 0 ? (
          <Text style={{ color: c.muted, fontSize: 14, textAlign: 'center', marginTop: 32 }}>
            No meditations available yet.
          </Text>
        ) : (
          <View style={{ gap: 10 }}>
            {meditations.map((med) => {
              const isActive = selected?.id === med.id;
              return (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => selectMeditation(med)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 16,
                    backgroundColor: isActive ? c.gold + '14' : c.card,
                    borderWidth: 1,
                    borderColor: isActive ? c.gold : c.border,
                    gap: 12,
                  }}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: isActive ? c.gold : c.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isActive && status.playing ? (
                      <Pause
                        color={isDark ? '#121212' : '#211E1F'}
                        size={15}
                        fill={isDark ? '#121212' : '#211E1F'}
                      />
                    ) : (
                      <Play
                        color={isActive ? (isDark ? '#121212' : '#211E1F') : c.muted}
                        size={15}
                        fill={isActive ? (isDark ? '#121212' : '#211E1F') : c.muted}
                      />
                    )}
                  </View>

                  {/* Title + description */}
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={{
                        color: isActive ? c.gold : c.text,
                        fontSize: 15,
                        fontWeight: '600',
                      }}
                      numberOfLines={1}
                    >
                      {med.title}
                    </Text>
                    {!!med.description && (
                      <Text style={{ color: c.muted, fontSize: 12 }} numberOfLines={1}>
                        {med.description}
                      </Text>
                    )}
                  </View>

                  {/* Duration */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock color={c.muted} size={12} />
                    <Text style={{ color: c.muted, fontSize: 12 }}>
                      {formatTime(med.duration_seconds)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
