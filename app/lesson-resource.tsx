import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, FileText, HelpCircle, Lightbulb, ListChecks, MessageCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, useColorScheme } from 'react-native';
import RenderHtml from 'react-native-render-html';
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
  fetchLessonResource,
  type LessonResource,
  type ResourceType,
} from '@/lib/lesson-resources';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RESOURCE_META: Record<
  ResourceType,
  { label: string; icon: React.ComponentType<any>; description: string }
> = {
  reflection: {
    label: 'Reflection',
    icon: MessageCircle,
    description: 'Questions to deepen your understanding',
  },
  cheatsheet: {
    label: 'Cheatsheet',
    icon: ListChecks,
    description: 'Quick-reference summary of key concepts',
  },
  faq: {
    label: 'FAQ',
    icon: HelpCircle,
    description: 'Answers to common questions',
  },
  misconception: {
    label: 'Misconception',
    icon: Lightbulb,
    description: 'Common misunderstandings clarified',
  },
};

export default function LessonResourceScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const isDark = colorScheme === 'dark';

  const resourceType = (type as ResourceType) ?? 'reflection';
  const meta = RESOURCE_META[resourceType] ?? RESOURCE_META.reflection;

  const textColor = isDark ? '#e5e7eb' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';

  const htmlBaseStyle = { color: textColor, fontSize: 14, lineHeight: 22 };
  const tagsStyles = {
    p: { marginTop: 0, marginBottom: 8, color: textColor },
    strong: { color: textColor },
    em: { color: mutedColor },
    ul: { color: textColor },
    ol: { color: textColor },
    li: { color: textColor, marginBottom: 4 },
    h1: { color: textColor, fontSize: 18 },
    h2: { color: textColor, fontSize: 16 },
    h3: { color: textColor, fontSize: 15 },
    a: { color: '#C79F27' },
  };

  const [resource, setResource] = useState<LessonResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!id || !type) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setEmpty(false);
        const data = await fetchLessonResource(id, resourceType, controller.signal);
        if (data) {
          setResource(data);
        } else {
          setEmpty(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[LessonResourceScreen]', err.message);
          setEmpty(true);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, type]);

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box
        className="bg-background border-b border-border w-full flex-row items-center px-4"
        style={{ paddingTop: insets.top, height: insets.top + 56 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
        >
          <Icon as={ChevronLeft} className="text-foreground" size="md" />
        </Pressable>
        <HStack space="sm" className="ml-3 flex-1 items-center">
          <Box className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center">
            <Icon as={meta.icon} size="xs" className="text-primary" />
          </Box>
          <Text size="md" bold className="text-foreground">
            {meta.label}
          </Text>
        </HStack>
      </Box>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <VStack space="md" className="px-6 pt-6">
          {/* Description badge */}
          <HStack
            space="sm"
            className="items-center bg-card border border-border rounded-xl px-4 py-3"
          >
            <Icon as={meta.icon} size="sm" className="text-primary" />
            <Text size="sm" className="text-muted-foreground flex-1">
              {meta.description}
            </Text>
          </HStack>

          {/* Title */}
          {!!resource?.title && (
            <Heading size="lg" className="text-foreground tracking-tight">
              {resource.title}
            </Heading>
          )}

          {/* Body */}
          {loading && (
            <Box className="py-20 items-center">
              <ActivityIndicator color="#C79F27" />
            </Box>
          )}

          {!loading && empty && (
            <Box className="py-20 items-center">
              <Icon as={FileText} size="xl" className="text-muted-foreground mb-3" />
              <Text className="text-muted-foreground text-center">
                No {meta.label.toLowerCase()} content available for this lesson yet.
              </Text>
            </Box>
          )}

          {!loading && !!resource?.content && (
            <RenderHtml
              contentWidth={SCREEN_WIDTH - 48}
              source={{ html: resource.content }}
              baseStyle={htmlBaseStyle}
              tagsStyles={tagsStyles}
            />
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
