const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// HOST

export function createQuiz(data: CreateQuizData) {
  return request("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getQuiz(quizId: string) {
  return request(`/api/quizzes/${quizId}`);
}

export function createQuestion(
  quizId: string,
  data: CreateQuestionData
) {
  return request(`/api/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function publishQuiz(quizId: string) {
  return request(`/api/quizzes/${quizId}/publish`, {
    method: "POST",
  });
}

export function deleteQuestion(questionId: string) {
  return request(`/api/questions/${questionId}`, {
    method: "DELETE",
  });
}

// PARTICIPANT

export function getQuizByCode(code: string) {
  return request(`/api/quizzes/code/${code}`);
}

export function joinQuiz(code: string, name: string) {
  return request(`/api/quizzes/code/${code}/join`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function submitQuiz(
  code: string,
  participantId: string | number,
  answers: {
    questionId: string | number;
    selectedOptionId: string | number;
  }[]
) {
  return request(`/api/quizzes/code/${code}/submit`, {
    method: "POST",
    body: JSON.stringify({
      participantId,
      answers,
    }),
  });
}

export function getParticipantResult(
  participantId: string | number
) {
  return request(`/api/participants/${participantId}/result`);
}

export function getLeaderboard(code: string) {
  return request(`/api/quizzes/code/${code}/leaderboard`);
}