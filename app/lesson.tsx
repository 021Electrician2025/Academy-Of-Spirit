import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  ImageIcon,
  Lightbulb,
  ListChecks,
  MessageCircle,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, useColorScheme } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { fetchLesson, type Lesson } from '@/lib/courses';
import { getPresignedUrl } from '@/lib/presign';
import { fetchQuizForLesson, type Quiz } from '@/lib/quiz';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIDEO_HEIGHT = SCREEN_WIDTH * (9 / 16);

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function LessonScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = colorScheme === 'dark';
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

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'resources'>('summary');

  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const quizRef = React.useRef<Quiz | null>(null);
  const [showQuizSheet, setShowQuizSheet] = useState(false);
  const [quizSkipped, setQuizSkipped] = useState(false);

  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  // Detect video completion — prompt quiz if one exists
  useEffect(() => {
    const sub = player.addListener('playToEnd', () => {
      setShowQuizSheet((prev) => {
        // Only show if quiz is loaded (use ref to avoid stale closure)
        return quizRef.current ? true : prev;
      });
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    if (videoUrl) {
      player.replaceAsync({ uri: videoUrl }).catch((e) =>
        console.error('[Player] replaceAsync failed:', e)
      );
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [lessonData, quizData] = await Promise.all([
          fetchLesson(id),
          fetchQuizForLesson(id, controller.signal),
        ]);
        setLesson(lessonData);
        setQuiz(quizData);
        quizRef.current = quizData;
        const url = await getPresignedUrl(lessonData.video_key);
        setVideoUrl(url);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[LessonScreen] error:', err.message, err);
          setError('Failed to load lesson. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  function handleTakeQuiz() {
    setShowQuizSheet(false);
    if (!quiz) return;
    router.push({
      pathname: '/quiz',
      params: {
        quizId: quiz.id,
        lessonId: id,
        passScore: String(quiz.pass_score),
        quizTitle: quiz.title,
      },
    });
  }

  function handleSkipQuiz() {
    setShowQuizSheet(false);
    setQuizSkipped(true);
  }

  return (
    <Box className="flex-1 bg-background">
      {/* Header — back button lives here, above the video */}
      <Box
        className="bg-black w-full flex-row items-center px-4"
        style={{ paddingTop: insets.top, height: insets.top + 48 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
        >
          <Icon as={ChevronLeft} className="text-white" size="md" />
        </Pressable>
        <Text size="sm" bold className="text-white ml-3 flex-1" numberOfLines={1}>
          {lesson?.title ?? ''}
        </Text>
      </Box>

      {/* Video — full width, no overlapping controls */}
      <Box
        style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT, backgroundColor: '#000' }}
        className="justify-center items-center"
      >
        {loading && <ActivityIndicator color="#C79F27" size="large" />}
        {error && <Text className="text-white/70 text-center px-6">{error}</Text>}
        {videoUrl && !loading && (
          <VideoView
            player={player}
            style={{ width: SCREEN_WIDTH, height: VIDEO_HEIGHT }}
            allowsFullscreen
            allowsPictureInPicture
            contentFit="contain"
          />
        )}
      </Box>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <VStack space="md" className="px-6 pt-5">
          <VStack space="xs">
            <Heading size="lg" className="text-foreground tracking-tight">
              {lesson?.title ?? ''}
            </Heading>
            {!!lesson?.duration_seconds && (
              <Text size="sm" className="text-muted-foreground">
                {formatTime(lesson.duration_seconds)}
              </Text>
            )}
          </VStack>

          {/* Tabs */}
          <HStack className="bg-card rounded-xl p-1 border border-border">
            {(['summary', 'resources'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg items-center ${activeTab === tab ? 'bg-primary' : ''}`}
              >
                <HStack space="xs" className="items-center">
                  <Icon
                    as={tab === 'summary' ? BookOpen : FileText}
                    size="xs"
                    className={activeTab === tab ? 'text-primary-foreground' : 'text-muted-foreground'}
                  />
                  <Text
                    size="sm"
                    bold={activeTab === tab}
                    className={activeTab === tab ? 'text-primary-foreground' : 'text-muted-foreground'}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </HStack>
              </Pressable>
            ))}
          </HStack>

          {/* Tab content */}
          {activeTab !== 'resources' ? (
            <VStack space="md">
              {!!lesson?.summary_short && (
                <RenderHtml
                  contentWidth={SCREEN_WIDTH - 48}
                  source={{ html: lesson.summary_short }}
                  baseStyle={htmlBaseStyle}
                  tagsStyles={tagsStyles}
                />
              )}
              {!!lesson?.summary_detailed && (
                <VStack space="xs">
                  <Text size="sm" bold className="text-foreground">Overview</Text>
                  <RenderHtml
                    contentWidth={SCREEN_WIDTH - 48}
                    source={{ html: lesson.summary_detailed }}
                    baseStyle={htmlBaseStyle}
                    tagsStyles={tagsStyles}
                  />
                </VStack>
              )}
              {!!lesson?.key_takeaways && (
                <VStack space="xs">
                  <Text size="sm" bold className="text-foreground">Key Takeaways</Text>
                  <RenderHtml
                    contentWidth={SCREEN_WIDTH - 48}
                    source={{ html: lesson.key_takeaways }}
                    baseStyle={htmlBaseStyle}
                    tagsStyles={tagsStyles}
                  />
                </VStack>
              )}
            </VStack>
          ) : (
            <VStack space="sm">
              {[
                { label: 'Reflection', icon: MessageCircle, route: 'reflection' },
                { label: 'Cheatsheet', icon: ListChecks, route: 'cheatsheet' },
                { label: 'FAQ', icon: HelpCircle, route: 'faq' },
                { label: 'Misconception', icon: Lightbulb, route: 'misconception' },
              ].map(({ label, icon, route }) => (
                <Pressable
                  key={route}
                  onPress={() => router.push({ pathname: '/lesson-resource', params: { id, type: route } })}
                  className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-4"
                >
                  <HStack space="md" className="items-center">
                    <Box className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                      <Icon as={icon} size="sm" className="text-primary" />
                    </Box>
                    <Text bold className="text-foreground">{label}</Text>
                  </HStack>
                  <Icon as={ChevronRight} size="sm" className="text-muted-foreground" />
                </Pressable>
              ))}

              {/* Infographics */}
              <Pressable
                onPress={() => router.push({ pathname: '/lesson-infographic', params: { id } })}
                className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-4"
              >
                <HStack space="md" className="items-center">
                  <Box className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                    <Icon as={ImageIcon} size="sm" className="text-primary" />
                  </Box>
                  <Text bold className="text-foreground">Infographics</Text>
                </HStack>
                <Icon as={ChevronRight} size="sm" className="text-muted-foreground" />
              </Pressable>

              {/* Quiz card — visible only when this lesson has an active quiz */}
              {quiz && (
                <Pressable
                  onPress={handleTakeQuiz}
                  className="flex-row items-center justify-between bg-card border border-primary/30 rounded-xl px-4 py-4"
                >
                  <HStack space="md" className="items-center">
                    <Box className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
                      <Icon as={ClipboardList} size="sm" className="text-primary" />
                    </Box>
                    <VStack space="xs">
                      <Text bold className="text-foreground">Quiz</Text>
                      {quizSkipped && (
                        <Text size="xs" className="text-muted-foreground">
                          Skipped — available here
                        </Text>
                      )}
                    </VStack>
                  </HStack>
                  <Icon as={ChevronRight} size="sm" className="text-muted-foreground" />
                </Pressable>
              )}
            </VStack>
          )}
        </VStack>
      </ScrollView>

      {/* Quiz prompt actionsheet — appears after video ends */}
      {quiz && (
        <Actionsheet isOpen={showQuizSheet} onClose={handleSkipQuiz}>
          <ActionsheetBackdrop />
          <ActionsheetContent>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <VStack space="md" className="w-full px-2 pb-4 pt-2">
              <HStack space="sm" className="items-center">
                <Box className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <Icon as={ClipboardList} size="md" className="text-primary" />
                </Box>
                <VStack>
                  <Heading size="sm" className="text-foreground">Ready for the Quiz?</Heading>
                  <Text size="xs" className="text-muted-foreground">{quiz.title}</Text>
                </VStack>
              </HStack>

              <Text size="sm" className="text-muted-foreground">
                Test your understanding of this lesson. You can always find it in the Resources tab.
              </Text>

              <Pressable
                onPress={handleTakeQuiz}
                className="bg-primary rounded-2xl py-4 items-center"
              >
                <Text bold className="text-primary-foreground">Take the Quiz</Text>
              </Pressable>

              <Pressable onPress={handleSkipQuiz} className="py-3 items-center">
                <Text size="sm" className="text-muted-foreground">Skip for now</Text>
              </Pressable>
            </VStack>
          </ActionsheetContent>
        </Actionsheet>
      )}
    </Box>
  );
}
