import { pb } from '@/lib/pocketbase';

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'scenario_based';

export type Quiz = {
  id: string;
  collectionId: string;
  lesson: string;
  title: string;
  pass_score: number;
  is_active: boolean;
  created: string;
  updated: string;
};

export type QuizQuestion = {
  id: string;
  collectionId: string;
  collectionName: string;
  quiz: string;
  question_text: string;
  question_type: QuestionType;
  explanation: string;
  question_image: string;
  order: number;
};

export type QuizChoice = {
  id: string;
  question: string;
  choice_text: string;
  is_correct: boolean;
  order: number;
};

export type QuizQuestionWithChoices = QuizQuestion & {
  choices: QuizChoice[];
};

export type GradeResult = {
  is_correct: boolean;
  feedback: string;
};

export type AttemptAnswer = {
  questionId: string;
  answer: string;
  is_correct: boolean;
  feedback?: string;
};

/**
 * Fetch the active quiz for a given lesson. Returns null if none exists.
 */
export async function fetchQuizForLesson(
  lessonId: string,
  signal?: AbortSignal
): Promise<Quiz | null> {
  try {
    const record = await pb.collection('quizzes').getFirstListItem(
      pb.filter('lesson = {:lessonId} && is_active = true', { lessonId }),
      { fetch: (url, init) => fetch(url, { ...init, signal }) }
    );
    return record as unknown as Quiz;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') throw err;
    return null;
  }
}

/**
 * Fetch all questions for a quiz, with choices populated for multiple_choice questions.
 * Questions are sorted by `order`.
 */
export async function fetchQuizQuestions(
  quizId: string,
  signal?: AbortSignal
): Promise<QuizQuestionWithChoices[]> {
  const result = await pb.collection('quiz_questions').getFullList({
    filter: pb.filter('quiz = {:quizId}', { quizId }),
    sort: 'order',
    fetch: (url, init) => fetch(url, { ...init, signal }),
  });

  const questions = result as unknown as QuizQuestion[];

  // Fetch choices in parallel for choice-based question types
  const withChoices: QuizQuestionWithChoices[] = await Promise.all(
    questions.map(async (q) => {
      if (q.question_type !== 'multiple_choice' && q.question_type !== 'true_false') {
        return { ...q, choices: [] };
      }
      const choiceRecords = await pb.collection('quiz_choices').getFullList({
        filter: pb.filter('question = {:questionId}', { questionId: q.id }),
        sort: 'order',
        fetch: (url, init) => fetch(url, { ...init, signal }),
      });
      return { ...q, choices: choiceRecords as unknown as QuizChoice[] };
    })
  );

  return withChoices;
}

/**
 * Grade a short_answer or scenario_based answer via PocketBase server hook.
 * The OpenAI API key lives only on the PocketBase server — never in this client.
 */
export async function gradeAnswer(
  questionId: string,
  answer: string
): Promise<GradeResult> {
  if (!pb.authStore.isValid) throw new Error('Not authenticated');
  const resp = await pb.send('/api/quiz/grade-answer', {
    method: 'POST',
    body: { questionId, answer },
  });
  return resp as GradeResult;
}

/**
 * Save a completed quiz attempt to PocketBase.
 */
export async function saveQuizAttempt(params: {
  quizId: string;
  score: number;
  isPassed: boolean;
  attemptNumber: number;
  answers: AttemptAnswer[];
}): Promise<void> {
  const userId = pb.authStore.record?.id;
  if (!userId) throw new Error('Not authenticated');
  await pb.collection('quiz_attempts').create({
    user: userId,
    quiz: params.quizId,
    score: params.score,
    is_passed: params.isPassed,
    attempt_number: params.attemptNumber,
    answers: JSON.stringify(params.answers),
  });
}

/**
 * Get the number of previous attempts for a quiz by the current user.
 */
export async function getAttemptCount(
  quizId: string,
  signal?: AbortSignal
): Promise<number> {
  const userId = pb.authStore.record?.id;
  if (!userId) return 0;
  try {
    const result = await pb.collection('quiz_attempts').getList(1, 1, {
      filter: pb.filter('quiz = {:quizId} && user = {:userId}', { quizId, userId }),
      fetch: (url, init) => fetch(url, { ...init, signal }),
    });
    return result.totalItems;
  } catch {
    return 0;
  }
}
