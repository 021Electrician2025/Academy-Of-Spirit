import { useRouter } from 'expo-router';
import { ChevronRight, Lock, Play } from 'lucide-react-native';
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
import { fetchCourses, getCourseThumbUrl, type Course } from '@/lib/courses';

export default function CoursesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCourses(controller.signal);
        setCourses(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError('Failed to load courses.');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <Box className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C79F27" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 bg-background items-center justify-center px-8">
        <Text className="text-muted-foreground text-center">{error}</Text>
      </Box>
    );
  }

  const featured = courses[0] ?? null;
  const rest = courses.slice(1);

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <Box className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
        <Heading size="2xl" className="text-foreground tracking-tight">Courses</Heading>
        <Text size="sm" className="text-muted-foreground mt-1">
          Deepen your practice with guided lessons
        </Text>
      </Box>

      {/* Featured course */}
      {featured && (
        <Pressable
          className="mx-6 mb-6"
          onPress={() => router.push({ pathname: '/course-details', params: { id: featured.id } })}
        >
          <Box className="bg-hero rounded-3xl overflow-hidden" style={{ minHeight: 200 }}>
            {featured.thumbnail ? (
              <Image
                source={{ uri: getCourseThumbUrl(featured) }}
                style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.4 }}
                resizeMode="cover"
              />
            ) : null}
            <VStack className="p-6 flex-1 justify-between" style={{ minHeight: 200, gap: 16 }}>
              <Box className="self-start bg-primary rounded-full px-3 py-1">
                <Text size="2xs" bold className="text-primary-foreground uppercase tracking-widest">
                  Featured
                </Text>
              </Box>
              <VStack space="sm">
                <Heading size="xl" className="text-white tracking-tight">{featured.title}</Heading>
                {!!featured.description && (
                  <Text size="sm" className="text-white/60" numberOfLines={2}>
                    {featured.description}
                  </Text>
                )}
                <HStack space="xs" className="items-center mt-1">
                  <Icon as={Play} size="xs" className="text-primary" />
                  <Text size="sm" bold className="text-primary">Start Course</Text>
                </HStack>
              </VStack>
            </VStack>
          </Box>
        </Pressable>
      )}

      {/* Rest of courses */}
      {rest.length > 0 && (
        <VStack space="md" className="px-6">
          <Text size="md" bold className="text-foreground">All Courses</Text>
          {rest.map((course) => (
            <Pressable
              key={course.id}
              onPress={() => router.push({ pathname: '/course-details', params: { id: course.id } })}
              className="flex-row bg-card rounded-2xl overflow-hidden border border-border"
            >
              <Box className="w-20 bg-hero justify-center items-center" style={{ minHeight: 80 }}>
                {course.thumbnail ? (
                  <Image
                    source={{ uri: getCourseThumbUrl(course) }}
                    style={{ width: 80, height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <Icon as={Play} className="text-primary" size="md" />
                )}
              </Box>
              <VStack space="xs" className="flex-1 p-3.5">
                <Text size="sm" bold className="text-foreground" numberOfLines={1}>{course.title}</Text>
                {!!course.description && (
                  <Text size="xs" className="text-muted-foreground" numberOfLines={2}>{course.description}</Text>
                )}
              </VStack>
              <Box className="justify-center pr-3.5">
                <Icon as={ChevronRight} className="text-muted-foreground" size="md" />
              </Box>
            </Pressable>
          ))}
        </VStack>
      )}

      {/* Coming soon teaser */}
      <Box className="mx-6 mt-4">
        <Box className="bg-card border border-dashed border-border rounded-2xl p-5 items-center" style={{ gap: 8 }}>
          <Box className="w-10 h-10 rounded-full bg-muted items-center justify-center">
            <Icon as={Lock} className="text-muted-foreground" size="sm" />
          </Box>
          <VStack className="items-center" style={{ gap: 2 }}>
            <Text size="sm" bold className="text-foreground">More Courses Coming Soon</Text>
            <Text size="xs" className="text-muted-foreground text-center">
              New spiritual growth courses are on their way
            </Text>
          </VStack>
        </Box>
      </Box>
    </ScrollView>
  );
}
