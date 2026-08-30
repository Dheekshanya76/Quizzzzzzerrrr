const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ==================== TYPES ====================

export type QuizOptionResponse = {
  id: string | number;
  text: string;
  isCorrect?: boolean;
};

export type QuestionResponse = {
  id: string | number;
  questionText: string;
  imageUrl?: string | null;
  options: QuizOptionResponse[];
};

export type QuizResponse = {
  id?: string | number;
  title: string;
  description?: string | null;
  questions: QuestionResponse[];
  published?: boolean;
  code?: string | null;
};

export type ParticipantResponse = {
  id: string | number;
  quizId?: string | number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

export type QuizSubmissionResponse = {
  id?: string | number;
  participantId?: string | number;
  score: number;
  totalQuestions: number;
  percentage: string | number;
  completionTime?: string;
};

export type LeaderboardEntry = {
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: string | number;
  completionTime: string;
};

export type CreateQuizData = {
  title: string;
  description?: string;
};

export type CreateQuestionData = {
  questionText: string;
  imageUrl?: string | null;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
};

// ==================== REQUEST HELPER ====================

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.error || "Something went wrong"
    );
  }

  return data as T;
}

// ==================== HOST ====================

export function createQuiz(
  data: CreateQuizData
) {
  return request<QuizResponse>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getQuiz(quizId: string) {
  return request<QuizResponse>(
    `/api/quizzes/${quizId}`
  );
}

export function createQuestion(
  quizId: string,
  data: CreateQuestionData
) {
  return request<QuestionResponse>(
    `/api/quizzes/${quizId}/questions`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export function publishQuiz(quizId: string) {
  return request<QuizResponse>(
    `/api/quizzes/${quizId}/publish`,
    {
      method: "POST",
    }
  );
}

export function deleteQuestion(
  questionId: string
) {
  return request<void>(
    `/api/questions/${questionId}`,
    {
      method: "DELETE",
    }
  );
}

// ==================== PARTICIPANT ====================

export function getQuizByCode(
  code: string
) {
  return request<QuizResponse>(
    `/api/quizzes/code/${encodeURIComponent(code)}`
  );
}

export function joinQuiz(
  code: string,
  name: string
) {
  return request<ParticipantResponse>(
    `/api/quizzes/code/${encodeURIComponent(code)}/join`,
    {
      method: "POST",
      body: JSON.stringify({ name }),
    }
  );
}

export function submitQuiz(
  code: string,
  participantId: string | number,
  answers: {
    questionId: string | number;
    selectedOptionId: string | number;
  }[]
) {
  return request<QuizSubmissionResponse>(
    `/api/quizzes/code/${encodeURIComponent(code)}/submit`,
    {
      method: "POST",
      body: JSON.stringify({
        participantId,
        answers,
      }),
    }
  );
}

export function getParticipantResult(
  participantId: string | number
) {
  return request<QuizSubmissionResponse>(
    `/api/participants/${participantId}/result`
  );
}

export function getLeaderboard(
  code: string
) {
  return request<LeaderboardEntry[]>(
    `/api/quizzes/code/${encodeURIComponent(code)}/leaderboard`
  );
}