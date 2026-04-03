import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, XCircle } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, TextInput, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { pb } from '@/lib/pocketbase';
import {
  type AttemptAnswer,
  type GradeResult,
  type QuizQuestionWithChoices,
  fetchQuizQuestions,
  gradeAnswer,
} from '@/lib/quiz';

type QuizParams = {
  quizId: string;
  lessonId: string;
  passScore: string;
  quizTitle: string;
};

export default function QuizScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const inputTextColor = isDark ? '#F2F2F5' : '#111827';
  const inputPlaceholderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const { quizId, lessonId, passScore, quizTitle } = useLocalSearchParams<QuizParams>();

  const [questions, setQuestions] = useState<QuizQuestionWithChoices[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AttemptAnswer[]>([]);

  // Per-question state
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<GradeResult | null>(null);

  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const qs = await fetchQuizQuestions(quizId, controller.signal);
        setQuestions(qs);
      } catch {
        // silent — will show empty state
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [quizId]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const canSubmit =
    !feedback &&
    !submitting &&
    (['multiple_choice', 'true_false'].includes(currentQuestion?.question_type ?? '')
      ? !!selectedChoiceId
      : textAnswer.trim().length > 0);

  async function handleSubmit() {
    if (!currentQuestion) return;

    if (currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') {
      const choice = currentQuestion.choices.find((c) => c.id === selectedChoiceId);
      const result: GradeResult = {
        is_correct: choice?.is_correct ?? false,
        feedback: currentQuestion.explanation ?? '',
      };
      setFeedback(result);
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          answer: choice?.choice_text ?? '',
          is_correct: result.is_correct,
          feedback: result.feedback,
        },
      ]);
    } else {
      setSubmitting(true);
      try {
        const result = await gradeAnswer(currentQuestion.id, textAnswer.trim());
        setFeedback(result);
        setAnswers((prev) => [
          ...prev,
          {
            questionId: currentQuestion.id,
            answer: textAnswer.trim(),
            is_correct: result.is_correct,
            feedback: result.feedback,
          },
        ]);
      } catch {
        setFeedback({ is_correct: false, feedback: 'Could not grade answer. Please try again.' });
      } finally {
        setSubmitting(false);
      }
    }
    // Scroll to top of question after feedback appears
    scrollRef.current?.scrollTo?.({ y: 0, animated: true });
  }

  function handleNext() {
    if (isLast) {
      const allAnswers = answers; // already includes current question
      const correct = allAnswers.filter((a) => a.is_correct).length;
      const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
      const isPassed = correct >= Number(passScore ?? 0);
      router.replace({
        pathname: '/quiz-results',
        params: {
          quizId,
          lessonId,
          quizTitle: quizTitle ?? '',
          score: String(score),
          isPassed: String(isPassed),
          correct: String(correct),
          total: String(questions.length),
          answers: JSON.stringify(allAnswers),
        },
      });
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setTextAnswer('');
      setFeedback(null);
    }
  }

  if (loading) {
    return (
      <Box className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color="#C79F27" size="large" />
      </Box>
    );
  }

  if (!currentQuestion) {
    return (
      <Box className="flex-1 bg-background items-center justify-center px-6">
        <Text className="text-muted-foreground text-center">No questions found for this quiz.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go back</Text>
        </Pressable>
      </Box>
    );
  }

  const imageUrl =
    currentQuestion.question_image
      ? pb.files.getURL(
        { collectionId: currentQuestion.collectionId, collectionName: currentQuestion.collectionName, id: currentQuestion.id } as never,
        currentQuestion.question_image
      )
      : null;

  return (
    <Box className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <HStack className="items-center px-4 py-3" space="md">
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
        >
          <Icon as={ChevronLeft} size="md" className="text-foreground" />
        </Pressable>
        <VStack className="flex-1" space="xs">
          <Text size="xs" className="text-muted-foreground uppercase tracking-widest">
            {quizTitle ?? 'Quiz'}
          </Text>
          <Text size="xs" className="text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </VStack>
      </HStack>

      {/* Progress bar */}
      <Box className="h-1 bg-card mx-4 rounded-full overflow-hidden">
        <Box
          className="h-full bg-primary rounded-full"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </Box>

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: insets.bottom + 120 }}
      >
        <VStack space="lg">
          {/* Feedback panel */}
          {feedback && (
            <Box
              className={`rounded-xl px-4 py-4 border ${feedback.is_correct
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-destructive/10 border-destructive/30'
                }`}
            >
              <HStack space="sm" className="items-start">
                <Icon
                  as={feedback.is_correct ? CheckCircle : XCircle}
                  size="sm"
                  className={feedback.is_correct ? 'text-green-500 mt-0.5' : 'text-destructive mt-0.5'}
                />
                <VStack space="xs" className="flex-1">
                  <Text bold size="sm" className={feedback.is_correct ? 'text-green-400' : 'text-destructive'}>
                    {feedback.is_correct ? 'Correct!' : 'Not quite'}
                  </Text>
                  {!!feedback.feedback && (
                    <Text size="sm" className="text-muted-foreground leading-relaxed">
                      {feedback.feedback}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Question image */}
          {!!imageUrl && (
            <Box className="rounded-2xl overflow-hidden bg-card border border-border">
              <Image
                source={{ uri: imageUrl }}
                style={{ width: '100%', aspectRatio: 16 / 9 }}
                resizeMode="cover"
              />
            </Box>
          )}

          {/* Question text */}
          <Heading size="md" className="text-foreground leading-snug">
            {currentQuestion.question_text}
          </Heading>

          {/* Multiple choice */}
          {(currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'true_false') && (
            <VStack space="sm">
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                const isSubmitted = !!feedback;
                let borderClass = 'border-border';
                let bgClass = 'bg-card';

                if (isSubmitted && isSelected) {
                  borderClass = choice.is_correct ? 'border-green-500' : 'border-destructive';
                  bgClass = choice.is_correct ? 'bg-green-500/10' : 'bg-destructive/10';
                } else if (!isSubmitted && isSelected) {
                  borderClass = 'border-primary';
                  bgClass = 'bg-primary/10';
                } else if (isSubmitted && choice.is_correct) {
                  borderClass = 'border-green-500';
                  bgClass = 'bg-green-500/10';
                }

                return (
                  <Pressable
                    key={choice.id}
                    onPress={() => !isSubmitted && setSelectedChoiceId(choice.id)}
                    disabled={isSubmitted}
                    className={`flex-row items-center rounded-xl border px-4 py-4 ${bgClass} ${borderClass}`}
                  >
                    <Box
                      className={`w-5 h-5 rounded-full border-2 mr-3 items-center justify-center ${isSelected ? 'border-primary bg-primary' : 'border-border'
                        }`}
                    >
                      {isSelected && <Box className="w-2 h-2 rounded-full bg-primary-foreground" />}
                    </Box>
                    <Text className={`flex-1 ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {choice.choice_text}
                    </Text>
                    {isSubmitted && choice.is_correct && (
                      <Icon as={CheckCircle} size="sm" className="text-green-500 ml-2" />
                    )}
                    {isSubmitted && isSelected && !choice.is_correct && (
                      <Icon as={XCircle} size="sm" className="text-destructive ml-2" />
                    )}
                  </Pressable>
                );
              })}
            </VStack>
          )}

          {/* Short answer */}
          {currentQuestion.question_type === 'short_answer' && (
            <Box className="bg-card border border-border rounded-xl px-4 py-3">
              <TextInput
                value={textAnswer}
                onChangeText={setTextAnswer}
                placeholder="Type your answer here…"
                placeholderTextColor={inputPlaceholderColor}
                editable={!feedback && !submitting}
                multiline
                textAlignVertical="top"
                style={{ color: inputTextColor, fontSize: 14, minHeight: 100, paddingVertical: 8 }}
              />
            </Box>
          )}

          {/* Scenario based — catch-all for any text-response type */}
          {currentQuestion.question_type !== 'multiple_choice' &&
            currentQuestion.question_type !== 'true_false' &&
            currentQuestion.question_type !== 'short_answer' && (
              <Box className="bg-card border border-border rounded-xl px-4 py-3">
                <TextInput
                  value={textAnswer}
                  onChangeText={setTextAnswer}
                  placeholder="Describe your response to this scenario…"
                  placeholderTextColor={inputPlaceholderColor}
                  editable={!feedback && !submitting}
                  multiline
                  textAlignVertical="top"
                  style={{ color: inputTextColor, fontSize: 14, minHeight: 100, paddingVertical: 8 }}
                />
              </Box>
            )}


        </VStack>
      </ScrollView>

      {/* Footer */}
      <Box
        className="px-6 bg-background border-t border-border"
        style={{ paddingBottom: insets.bottom + 12, paddingTop: 12 }}
      >
        {!feedback ? (
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`rounded-2xl py-4 items-center ${canSubmit || submitting ? 'bg-primary' : 'bg-card'}`}
          >
            {submitting ? (
              <HStack space="sm" className="items-center justify-center w-full">
                <ActivityIndicator color="#0C0E14" size="small" />
                <Text bold className="text-primary-foreground">Grading…</Text>
              </HStack>
            ) : (
              <Text bold className={canSubmit ? 'text-primary-foreground' : 'text-muted-foreground'}>
                Submit Answer
              </Text>
            )}
          </Pressable>
        ) : (
          <Pressable onPress={handleNext} className="bg-primary rounded-2xl py-4 items-center">
            <Text bold className="text-primary-foreground">
              {isLast ? 'See Results' : 'Next Question'}
            </Text>
          </Pressable>
        )}
      </Box>
    </Box>
  );
}
