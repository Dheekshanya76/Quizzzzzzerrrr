import type { Request, Response } from "express";
import {
  createQuestion,
  createQuiz,
  getPublishedQuizByCode,
  getLeaderboardByCode,
  getQuizById,
  joinPublishedQuiz,
  publishQuiz,
  SubmissionError,
  submitQuiz
} from "../services/quiz.service.js";

export async function createQuizController(
  request: Request,
  response: Response
): Promise<void> {
  const { title, description } = request.body as {
    title?: unknown;
    description?: unknown;
  };

  if (typeof title !== "string" || title.trim().length === 0) {
    response.status(400).json({ error: "Title is required" });
    return;
  }

  if (description !== undefined && description !== null && typeof description !== "string") {
    response.status(400).json({ error: "Description must be a string" });
    return;
  }

  const quiz = await createQuiz(
    title.trim(),
    typeof description === "string" ? description : null
  );

  response.status(201).json(quiz);
}

export async function getQuizController(
  request: Request,
  response: Response
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  const quiz = await getQuizById(id);

  if (!quiz) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  response.status(200).json(quiz);
}

export async function getPublishedQuizByCodeController(
  request: Request,
  response: Response
): Promise<void> {
  const { code } = request.params;

  if (typeof code !== "string" || !/^[A-Za-z0-9]{6}$/.test(code)) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  const quiz = await getPublishedQuizByCode(code);

  if (!quiz) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  response.status(200).json(quiz);
}

export async function getLeaderboardController(
  request: Request,
  response: Response
): Promise<void> {
  const { code } = request.params;

  if (typeof code !== "string" || !/^[A-Za-z0-9]{6}$/.test(code)) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  const leaderboard = await getLeaderboardByCode(code);

  if (!leaderboard) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  response.status(200).json(leaderboard);
}

export async function createQuestionController(
  request: Request,
  response: Response
): Promise<void> {
  const { id } = request.params;
  const { questionText, imageUrl, options } = request.body as {
    questionText?: unknown;
    imageUrl?: unknown;
    options?: unknown;
  };

  if (typeof id !== "string" || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  if (typeof questionText !== "string" || questionText.trim().length === 0) {
    response.status(400).json({ error: "questionText is required" });
    return;
  }

  if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== "string") {
    response.status(400).json({ error: "imageUrl must be a string" });
    return;
  }

  if (!Array.isArray(options) || options.length === 0) {
    response.status(400).json({ error: "At least one option is required" });
    return;
  }

  const validOptions = options.every(
    (option): option is { text: string; isCorrect: boolean } =>
      typeof option === "object" &&
      option !== null &&
      "text" in option &&
      "isCorrect" in option &&
      typeof option.text === "string" &&
      option.text.trim().length > 0 &&
      typeof option.isCorrect === "boolean"
  );

  if (!validOptions) {
    response.status(400).json({
      error: "Each option must contain non-empty text and boolean isCorrect"
    });
    return;
  }

  const question = await createQuestion(
    id,
    questionText.trim(),
    typeof imageUrl === "string" ? imageUrl : null,
    options.map((option) => ({
      text: option.text.trim(),
      isCorrect: option.isCorrect
    }))
  );

  response.status(201).json(question);
}

export async function publishQuizController(
  request: Request,
  response: Response
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  const quiz = await publishQuiz(id);

  if (!quiz) {
    response.status(404).json({ error: "Quiz not found" });
    return;
  }

  response.status(200).json(quiz);
}

export async function joinQuizController(
  request: Request,
  response: Response
): Promise<void> {
  const { code } = request.params;
  const { name } = request.body as { name?: unknown };

  if (typeof code !== "string" || !/^[A-Za-z0-9]{6}$/.test(code)) {
    response.status(400).json({ error: "Quiz code must be 6 alphanumeric characters" });
    return;
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    response.status(400).json({ error: "Participant name is required" });
    return;
  }

  const participant = await joinPublishedQuiz(code, name.trim());

  if (!participant) {
    response.status(404).json({ error: "Quiz not found or not published" });
    return;
  }

  response.status(201).json(participant);
}

export async function submitQuizController(
  request: Request,
  response: Response
): Promise<void> {
  const { code } = request.params;
  const { participantId, answers } = request.body as {
    participantId?: unknown;
    answers?: unknown;
  };

  if (typeof code !== "string" || !/^[A-Za-z0-9]{6}$/.test(code)) {
    response.status(400).json({ error: "Quiz code must be 6 alphanumeric characters" });
    return;
  }

  if (
    (typeof participantId !== "string" && typeof participantId !== "number") ||
    !/^\d+$/.test(String(participantId)) ||
    BigInt(String(participantId)) <= 0n
  ) {
    response.status(400).json({ error: "A valid participantId is required" });
    return;
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    response.status(400).json({ error: "At least one answer is required" });
    return;
  }

  const validAnswers = answers.every(
    (answer): answer is { questionId: string | number; selectedOptionId: string | number } =>
      typeof answer === "object" &&
      answer !== null &&
      "questionId" in answer &&
      "selectedOptionId" in answer &&
      (typeof answer.questionId === "string" || typeof answer.questionId === "number") &&
      (typeof answer.selectedOptionId === "string" ||
        typeof answer.selectedOptionId === "number") &&
      /^\d+$/.test(String(answer.questionId)) &&
      BigInt(String(answer.questionId)) > 0n &&
      /^\d+$/.test(String(answer.selectedOptionId)) &&
      BigInt(String(answer.selectedOptionId)) > 0n
  );

  if (!validAnswers) {
    response.status(400).json({
      error: "Each answer must contain valid questionId and selectedOptionId values"
    });
    return;
  }

  try {
    const result = await submitQuiz(
      code,
      String(participantId),
      answers.map((answer) => ({
        questionId: String(answer.questionId),
        selectedOptionId: String(answer.selectedOptionId)
      }))
    );
    response.status(201).json(result);
  } catch (error) {
    if (error instanceof SubmissionError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}
