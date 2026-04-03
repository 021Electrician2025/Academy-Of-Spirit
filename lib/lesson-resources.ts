import { pb } from '@/lib/pocketbase';

export type ResourceType = 'reflection' | 'cheatsheet' | 'faq' | 'misconception';

export type LessonResource = {
  id: string;
  collectionId: string;
  lesson: string;
  resource_type: ResourceType;
  title: string;
  content: string;
  created: string;
  updated: string;
};

export async function fetchLessonResource(
  lessonId: string,
  resourceType: ResourceType,
  signal?: AbortSignal
): Promise<LessonResource | null> {
  try {
    const record = await pb.collection('lesson_resources').getFirstListItem(
      pb.filter('lesson = {:lessonId} && resource_type = {:resourceType}', {
        lessonId,
        resourceType,
      }),
      { fetch: (url, init) => fetch(url, { ...init, signal }) }
    );
    return record as unknown as LessonResource;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return null;
  }
}
