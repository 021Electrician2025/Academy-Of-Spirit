import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, X, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { type AttemptAnswer, getAttemptCount, saveQuizAttempt } from '@/lib/quiz';

type QuizResultsParams = {
  quizId: string;
  lessonId: string;
  quizTitle: string;
  score: string;
  isPassed: string;
  correct: string;
  total: string;
  answers: string;
};

export default function QuizResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { quizId, lessonId, quizTitle, score, isPassed, correct, total, answers } =
    useLocalSearchParams<QuizResultsParams>();

  const scoreNum = parseFloat(score ?? '0');
  const passed = isPassed === 'true';
  const correctNum = parseInt(correct ?? '0', 10);
  const totalNum = parseInt(total ?? '0', 10);
  const parsedAnswers: AttemptAnswer[] = React.useMemo(() => {
    try {
      return JSON.parse(answers ?? '[]');
    } catch {
      return [];
    }
  }, [answers]);

  // Save attempt exactly once
  const hasSaved = useRef(false);
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
    (async () => {
      try {
        const count = await getAttemptCount(quizId);
        await saveQuizAttempt({
          quizId,
          score: scoreNum,
          isPassed: passed,
          attemptNumber: count + 1,
          answers: parsedAnswers,
        });
      } catch {
        // Non-blocking — user still sees results
      }
    })();
  }, []);

  // Score ring geometry
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scoreNum / 100) * circumference;

  return (
    <Box className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <HStack className="items-center px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
        >
          <Icon as={X} size="md" className="text-foreground" />
        </Pressable>
        <Text size="sm" bold className="text-foreground ml-3 flex-1" numberOfLines={1}>
          {quizTitle ?? 'Quiz Results'}
        </Text>
      </HStack>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: insets.bottom + 120 }}
      >
        <VStack space="xl">
          {/* Score circle */}
          <VStack className="items-center" space="md">
            <Box className="relative items-center justify-center" style={{ width: 140, height: 140 }}>
              {/* SVG-like ring using nested boxes */}
              <Box
                className="absolute rounded-full border-4 border-card"
                style={{ width: 120, height: 120 }}
              />
              <Box
                className="absolute rounded-full"
                style={{
                  width: 120,
                  height: 120,
                  borderWidth: 4,
                  borderColor: passed ? '#C79F27' : '#EF4444',
                  borderStyle: 'solid',
                  // Approximate arc fill using opacity trick — full ring for simplicity
                  opacity: scoreNum / 100,
                }}
              />
              <VStack className="items-center" space="xs">
                <Text
                  bold
                  style={{ fontSize: 32, color: passed ? '#C79F27' : '#EF4444', lineHeight: 36 }}
                >
                  {Math.round(scoreNum)}%
                </Text>
                <Text size="xs" className="text-muted-foreground">
                  Score
                </Text>
              </VStack>
            </Box>

            {/* Pass / Fail banner */}
            <Box
              className={`px-5 py-2 rounded-full ${passed ? 'bg-primary/20' : 'bg-destructive/20'}`}
            >
              <Text
                bold
                size="sm"
                style={{ color: passed ? '#C79F27' : '#EF4444' }}
              >
                {passed ? 'Passed!' : 'Keep Learning'}
              </Text>
            </Box>

            <Text size="sm" className="text-muted-foreground">
              {correctNum} / {totalNum} questions correct
            </Text>
          </VStack>

          {/* Divider */}
          <Box className="h-px bg-border" />

          {/* Answer breakdown */}
          <VStack space="xs">
            <Text
              size="xs"
              className="text-muted-foreground uppercase tracking-widest mb-1"
            >
              Answer Review
            </Text>
            {parsedAnswers.map((ans, idx) => (
              <Box
                key={ans.questionId}
                className="bg-card border border-border rounded-xl px-4 py-4"
              >
                <HStack space="sm" className="items-start">
                  <Icon
                    as={ans.is_correct ? CheckCircle : XCircle}
                    size="sm"
                    className={ans.is_correct ? 'text-green-500 mt-0.5' : 'text-destructive mt-0.5'}
                  />
                  <VStack space="xs" className="flex-1">
                    <Text size="xs" className="text-muted-foreground">
                      Question {idx + 1}
                    </Text>
                    <Text size="sm" bold className="text-foreground">
                      {ans.answer}
                    </Text>
                    {!!ans.feedback && (
                      <Text size="xs" className="text-muted-foreground leading-relaxed">
                        {ans.feedback}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </VStack>
      </ScrollView>

      {/* Footer */}
      <Box
        className="px-6 bg-background border-t border-border"
        style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}
      >
        {passed ? (
          <Pressable
            onPress={() => router.back()}
            className="bg-primary rounded-2xl py-4 items-center"
          >
            <Text bold className="text-primary-foreground">Continue</Text>
          </Pressable>
        ) : (
          <VStack space="sm">
            <Pressable
              onPress={() =>
                router.replace({
                  pathname: '/quiz',
                  params: { quizId, lessonId },
                })
              }
              className="bg-primary rounded-2xl py-4 items-center"
            >
              <Text bold className="text-primary-foreground">Retry Quiz</Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              className="py-3 items-center"
            >
              <Text size="sm" className="text-muted-foreground">Back to Lesson</Text>
            </Pressable>
          </VStack>
        )}
      </Box>
    </Box>
  );
}
