import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioStatus } from 'expo-audio';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import {
  createMeditationSession,
  fetchLastIncompleteSession,
  getMeditationAudioUrl,
  updateMeditationSession,
  type GuidedMeditation,
} from '@/lib/meditations';

type AudioContextValue = {
  player: ReturnType<typeof useAudioPlayer>;
  status: ReturnType<typeof useAudioPlayerStatus>;
  selected: GuidedMeditation | null;
  progress: number;
  selectMeditation: (med: GuidedMeditation) => Promise<void>;
  togglePlay: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<GuidedMeditation | null>(null);

  const currentSessionIdRef = useRef<string | null>(null);
  const sessionSavedRef = useRef(false);

  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
  }, []);

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

  const selectMeditation = useCallback(async (med: GuidedMeditation) => {
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
  }, [player]);

  const togglePlay = useCallback(() => {
    if (!selected) return;
    if (status.playing) {
      player.pause();
      saveSession(false);
    } else {
      if (status.didJustFinish) player.seekTo(0);
      player.play();
    }
  }, [selected, status.playing, status.didJustFinish]);

  const progress = selected && status.duration > 0 ? status.currentTime / status.duration : 0;

  return (
    <AudioContext.Provider value={{ player, status, selected, progress, selectMeditation, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used within AudioProvider');
  return ctx;
}
