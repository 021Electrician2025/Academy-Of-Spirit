import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Clock, Lock, Play } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  fetchCourses,
  fetchLessons,
  getCourseThumbUrl,
  getLessonThumbUrl,
  type Course,
  type Lesson,
} from '@/lib/courses';

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return s > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${m} min`;
}

export default function CourseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [courses, lessonData] = await Promise.all([
          fetchCourses(controller.signal),
          fetchLessons(id, controller.signal),
        ]);
        setCourse(courses.find((c) => c.id === id) ?? null);
        setLessons(lessonData);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[CourseScreen]', err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const totalMinutes = Math.round(
    lessons.reduce((sum, l) => sum + (l.duration_seconds ?? 0), 0) / 60
  );

  return (
    <Box className="flex-1 bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* ── Hero ── */}
        <Box style={{ height: 260 + insets.top, backgroundColor: '#0F1628' }}>
          {course?.thumbnail ? (
            <Image
              source={{ uri: getCourseThumbUrl(course) }}
              style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.35 }}
              resizeMode="cover"
            />
          ) : null}
          {/* Dark gradient overlay for readability */}
          <Box
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 140,
              backgroundColor: 'transparent',
            }}
            className="bg-gradient-to-t from-background to-transparent"
          />

          {/* Back button */}
          <Box style={{ paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center self-start"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
            >
              <Icon as={ChevronLeft} className="text-white" size="md" />
            </Pressable>
          </Box>

          {/* Course info pinned to bottom of hero */}
          <VStack space="sm" className="px-6 pb-6 mt-auto">
            <Box
              className="self-start rounded-full px-3 py-1"
              style={{ backgroundColor: '#C79F27' }}
            >
              <Text size="2xs" bold className="text-black uppercase tracking-widest">
                Course
              </Text>
            </Box>
            <Heading size="2xl" className="text-white tracking-tight" numberOfLines={2}>
              {course?.title ?? ''}
            </Heading>
            {!!course?.description && (
              <Text size="sm" className="text-white/60" numberOfLines={2}>
                {course.description}
              </Text>
            )}
            {/* Stats row */}
            <HStack space="lg" className="items-center mt-1">
              <HStack space="xs" className="items-center">
                <Icon as={Play} size="2xs" className="text-primary" />
                <Text size="sm" className="text-white/70">
                  {lessons.length} lessons
                </Text>
              </HStack>
              {totalMinutes > 0 && (
                <HStack space="xs" className="items-center">
                  <Icon as={Clock} size="2xs" className="text-primary" />
                  <Text size="sm" className="text-white/70">
                    {totalMinutes} min total
                  </Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </Box>

        {/* ── Gold divider ── */}
        <Box
          style={{ height: 2, marginHorizontal: 24, marginTop: 24, marginBottom: 20, backgroundColor: '#C79F27', opacity: 0.25, borderRadius: 1 }}
        />

        {/* ── Section header ── */}
        <HStack className="px-6 mb-3 items-center justify-between">
          <Text size="md" bold className="text-foreground">Lessons</Text>
          <Text size="sm" className="text-muted-foreground">{lessons.length} total</Text>
        </HStack>

        {/* ── Lessons list ── */}
        {loading ? (
          <Box className="py-16 items-center">
            <ActivityIndicator color="#C79F27" />
          </Box>
        ) : (
          <VStack className="px-6" style={{ gap: 10 }}>
            {lessons.map((lesson, i) => (
              <Pressable
                key={lesson.id}
                onPress={() => router.push({ pathname: '/lesson', params: { id: lesson.id } })}
                className="flex-row bg-card rounded-2xl overflow-hidden border border-border items-center"
                style={{ minHeight: 72 }}
              >
                {/* Fixed-size thumbnail */}
                <Box
                  className="bg-hero items-center justify-center"
                  style={{ width: 72, height: 72, flexShrink: 0 }}
                >
                  {lesson.thumbnail ? (
                    <Image
                      source={{ uri: getLessonThumbUrl(lesson) }}
                      style={{ width: 72, height: 72 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text size="lg" bold className="text-primary">{i + 1}</Text>
                  )}
                  {/* Lesson number badge overlay */}
                  <Box
                    style={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      borderRadius: 6,
                      paddingHorizontal: 5,
                      paddingVertical: 1,
                    }}
                  >
                    <Text size="2xs" bold className="text-white/80">{i + 1}</Text>
                  </Box>
                </Box>

                {/* Content */}
                <VStack className="flex-1 px-3.5 py-3" style={{ gap: 3 }}>
                  <Text
                    size="sm"
                    bold
                    className="text-foreground"
                    numberOfLines={2}
                    style={{ lineHeight: 18 }}
                  >
                    {lesson.title}
                  </Text>
                  {!!lesson.duration_seconds && (
                    <HStack space="xs" className="items-center">
                      <Icon as={Clock} className="text-muted-foreground" size="2xs" />
                      <Text size="xs" className="text-muted-foreground">
                        {formatTime(lesson.duration_seconds)}
                      </Text>
                    </HStack>
                  )}
                </VStack>

                {/* Chevron */}
                <Box className="pr-4">
                  <Icon as={ChevronRight} className="text-muted-foreground" size="sm" />
                </Box>
              </Pressable>
            ))}

            {/* Coming soon card */}
            {lessons.length > 0 && (
              <Box
                className="flex-row bg-card rounded-2xl border border-dashed border-border items-center px-4"
                style={{ height: 72, marginTop: 4, gap: 12 }}
              >
                <Box
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: 'rgba(199,159,39,0.12)' }}
                >
                  <Icon as={Lock} size="sm" style={{ color: '#C79F27' }} />
                </Box>
                <VStack style={{ gap: 2 }}>
                  <Text size="sm" bold className="text-muted-foreground">
                    More lessons coming soon
                  </Text>
                  <Text size="xs" className="text-muted-foreground" style={{ opacity: 0.6 }}>
                    Stay tuned for new content
                  </Text>
                </VStack>
              </Box>
            )}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
