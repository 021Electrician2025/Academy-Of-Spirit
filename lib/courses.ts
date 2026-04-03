import { pb } from '@/lib/pocketbase';

export type Course = {
  id: string;
  collectionId: string;
  title: string;
  description: string;
  thumbnail: string;
  order: number;
  is_active: boolean;
};

export type Lesson = {
  id: string;
  collectionId: string;
  course: string;
  title: string;
  duration_seconds: number;
  thumbnail: string;
  order: number;
  is_active: boolean;
  video_key: string;
  transcript: string;
  summary_short: string;
  summary_detailed: string;
  key_takeaways: string;
};

export function getCourseThumbUrl(course: Course): string {
  return pb.files.getURL(course, course.thumbnail);
}

export function getLessonThumbUrl(lesson: Lesson): string {
  return pb.files.getURL(lesson, lesson.thumbnail);
}

export async function fetchCourses(signal?: AbortSignal): Promise<Course[]> {
  try {
    const res = await pb.collection('courses').getList(1, 50, {
      filter: 'is_active = true',
      sort: 'order',
      fields: 'id,collectionId,title,description,thumbnail,order',
      fetch: (url, init) => fetch(url, { ...init, signal }),
    });
    return res.items as unknown as Course[];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new Error('Failed to load courses. Please check your connection.');
  }
}

export async function fetchLessons(courseId: string, signal?: AbortSignal): Promise<Lesson[]> {
  try {
    const res = await pb.collection('lessons').getList(1, 100, {
      filter: pb.filter('course = {:courseId} && is_active = true', { courseId }),
      sort: 'order',
      fields: 'id,collectionId,course,title,duration_seconds,thumbnail,order,video_key,summary_short',
      fetch: (url, init) => fetch(url, { ...init, signal }),
    });
    return res.items as unknown as Lesson[];
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    throw new Error('Failed to load lessons.');
  }
}

export async function fetchLesson(lessonId: string): Promise<Lesson> {
  const record = await pb.collection('lessons').getOne(lessonId);
  return record as unknown as Lesson;
}
