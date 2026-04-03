import { pb } from '@/lib/pocketbase';

/**
 * Requests a short-lived presigned URL from PocketBase for a private DO Spaces file.
 * The PocketBase hook validates the user's auth token before generating the URL.
 *
 * @param key - The DO Spaces object key stored in the `video_files` field (e.g. "lessons/video.mp4")
 * @returns A presigned URL valid for ~15 minutes
 */
export async function getPresignedUrl(key: string): Promise<string> {
  if (!pb.authStore.isValid) throw new Error('Not authenticated');
  const resp = await pb.send('/api/presign', {
    method: 'GET',
    query: { key },
  });
  return resp.url as string;
}
