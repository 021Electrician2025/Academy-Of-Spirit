import { createAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { Clock, Headphones, Pause, Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAudio } from '@/context/audio-context';
import {
  fetchGuidedMeditations,
  getMeditationAudioUrl,
  updateMeditationDuration,
  type GuidedMeditation,
} from '@/lib/meditations';

function probeAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const player = createAudioPlayer({ uri: url });
    const timeout = setTimeout(() => { player.remove(); resolve(0); }, 15000);
    const sub = player.addListener('playbackStatusUpdate', (s) => {
      if (s.isLoaded && s.duration > 0) {
        clearTimeout(timeout);
        sub.remove();
        player.remove();
        resolve(Math.floor(s.duration));
      }
    });
  });
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MeditateScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status, selected, selectMeditation, togglePlay } = useAudio();

  const [meditations, setMeditations] = useState<GuidedMeditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchGuidedMeditations(controller.signal)
      .then((list) => {
        setMeditations(list);
        probeMissingDurations(list);
      })
      .catch((err: Error) => { if (err.name !== 'AbortError') setError(err.message); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const probeMissingDurations = async (list: GuidedMeditation[]) => {
    const missing = list.filter((m) => !m.duration_seconds);
    for (const med of missing) {
      const url = getMeditationAudioUrl(med);
      const duration = await probeAudioDuration(url);
      if (duration > 0) {
        await updateMeditationDuration(med.id, duration);
        setMeditations((prev) =>
          prev.map((m) => (m.id === med.id ? { ...m, duration_seconds: duration } : m))
        );
      }
    }
  };

  const handleSelect = async (med: GuidedMeditation) => {
    await selectMeditation(med);
    router.push('/player');
  };

  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: selected ? 88 : 32 }}
      >
        {/* Header */}
        <Box className="px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
          <Text size="2xl" bold className="text-foreground tracking-tight">Meditate</Text>
          <Text size="sm" className="text-muted-foreground mt-1">Breathe. Be present. Transcend.</Text>
        </Box>

        {/* Sessions List */}
        <Box className="px-6 mt-4">
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
                    onPress={() => handleSelect(med)}
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

      {/* Mini Player Bar */}
      {selected && (
        <Pressable
          onPress={() => router.push('/player')}
          className="absolute left-4 right-4 bg-hero rounded-2xl px-4 py-3 flex-row items-center"
          style={{ bottom: 8, gap: 12 }}
        >
          <Box className="w-10 h-10 rounded-full bg-primary/20 items-center justify-center">
            <Icon as={Headphones} className="text-primary" size="sm" />
          </Box>

          <VStack className="flex-1" style={{ gap: 2 }}>
            <Text size="sm" bold className="text-white" numberOfLines={1}>
              {selected.title}
            </Text>
            <Text size="2xs" className="text-white/50">
              {status.playing ? 'Playing' : 'Paused'} · {formatTime(status.currentTime)}
            </Text>
          </VStack>

          <Pressable
            onPress={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
          >
            {status.playing ? (
              <Icon as={Pause} className="text-primary-foreground fill-primary-foreground" size="sm" />
            ) : (
              <Icon as={Play} className="text-primary-foreground fill-primary-foreground" size="sm" />
            )}
          </Pressable>
        </Pressable>
      )}
    </Box>
  );
}
