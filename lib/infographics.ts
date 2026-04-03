import { pb } from '@/lib/pocketbase';

export type Infographic = {
  id: string;
  collectionId: string;
  collectionName: string;
  lesson: string;
  title: string;
  content_brief: string;
  image_file: string;
  external_url: string;
  created: string;
  updated: string;
};

export function getInfographicImageUrl(infographic: Infographic): string | null {
  if (!infographic.image_file) return null;
  return pb.files.getURL(infographic as never, infographic.image_file);
}

export async function fetchInfographics(
  lessonId: string,
  signal?: AbortSignal
): Promise<Infographic[]> {
  try {
    const records = await pb.collection('infographics').getFullList({
      filter: pb.filter('lesson = {:lessonId}', { lessonId }),
      sort: 'created',
      fetch: (url, init) => fetch(url, { ...init, signal }),
    });
    return records as unknown as Infographic[];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return [];
  }
}
