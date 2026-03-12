import { pb } from '@/lib/pocketbase';

export type GuidedMeditation = {
  id: string;
  collectionId: string;
  title: string;
  description: string;
  duration_seconds: number;
  audio_file: string;
  order: number;
  is_active: boolean;
};

export function getMeditationAudioUrl(meditation: GuidedMeditation): string {
  return pb.files.getURL(meditation, meditation.audio_file);
}

export async function fetchGuidedMeditations(signal?: AbortSignal): Promise<GuidedMeditation[]> {
  try {
    const res = await pb.collection('guided_meditations').getList(1, 50, {
      filter: 'is_active = true',
      sort: 'order',
      fields: 'id,collectionId,title,description,duration_seconds,audio_file,order',
      fetch: (url, init) => fetch(url, { ...init, signal }),
    });
    return res.items as unknown as GuidedMeditation[];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new Error('Failed to load meditations. Please check your connection.');
  }
}

// Returns the last incomplete session for a meditation so we can resume it.
// Returns null if the user has never played it or already completed it.
export async function fetchLastIncompleteSession(
  meditationId: string
): Promise<{ id: string; position: number } | null> {
  if (!pb.authStore.isValid) return null;
  try {
    const record = await pb.collection('meditation_sessions').getFirstListItem(
      pb.filter(
        'user = {:userId} && meditation ~ {:meditationId} && is_completed = false',
        { userId: pb.authStore.record?.id, meditationId }
      ),
      { sort: '-created' }
    );
    return { id: record.id, position: record.duration_seconds ?? 0 };
  } catch {
    return null;
  }
}

// Creates a new session record when playback starts. Returns the new record ID.
export async function createMeditationSession(meditationId: string): Promise<string | null> {
  if (!pb.authStore.isValid) return null;
  try {
    const record = await pb.collection('meditation_sessions').create({
      user: pb.authStore.record?.id,
      meditation: [meditationId],
      duration_seconds: 0,
      is_completed: false,
    });
    return record.id;
  } catch {
    return null;
  }
}

// Updates an existing session record with the current playback position.
export async function updateMeditationSession(
  sessionId: string,
  durationSeconds: number,
  isCompleted: boolean
): Promise<void> {
  try {
    await pb.collection('meditation_sessions').update(sessionId, {
      duration_seconds: durationSeconds,
      is_completed: isCompleted,
    });
  } catch {
    // silently fail — session tracking is non-critical
  }
}
