import { randomInt } from "node:crypto";
import { pool } from "../db/index.js";
import type { PoolClient } from "pg";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  code: string | null;
  published: boolean;
  created_at: Date;
  updated_at: Date;
}

export async function createQuiz(
  title: string,
  description: string | null
): Promise<Quiz> {
  const result = await pool.query<Quiz>(
    `INSERT INTO quizzes (title, description, published)
     VALUES ($1, $2, FALSE)
     RETURNING id, title, description, code, published, created_at, updated_at`,
    [title, description]
  );

  return result.rows[0];
}

export interface QuizDetails {
  title: string;
  description: string | null;
  code: string | null;
  published: boolean;
  questions: Array<{
    id: string;
    question_text: string;
    image_url: string | null;
    options: Array<{
      id: string;
      option_text: string;
      is_correct: boolean;
    }>;
  }>;
}

export async function getQuizById(id: string): Promise<QuizDetails | null> {
  const result = await pool.query<QuizDetails>(
    `SELECT
       q.title,
       q.description,
       q.code,
       q.published,
       COALESCE(
         json_agg(
           json_build_object(
             'id', qs.id,
             'question_text', qs.question_text,
             'image_url', qs.image_url,
             'options', COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', o.id,
                     'option_text', o.option_text,
                     'is_correct', o.is_correct
                   )
                   ORDER BY o.id
                 )
                 FROM options o
                 WHERE o.question_id = qs.id
               ),
               '[]'::json
             )
           )
           ORDER BY qs.id
         ) FILTER (WHERE qs.id IS NOT NULL),
         '[]'::json
       ) AS questions
     FROM quizzes q
     LEFT JOIN questions qs ON qs.quiz_id = q.id
     WHERE q.id = $1
     GROUP BY q.id, q.title, q.description, q.code, q.published`,
    [id]
  );

  return result.rows[0] ?? null;
}

export interface PublishedQuiz {
  title: string;
  questions: Array<{
    id: string;
    questionText: string;
    imageUrl: string | null;
    options: Array<{
      id: string;
      text: string;
    }>;
  }>;
}

export async function getPublishedQuizByCode(
  code: string
): Promise<PublishedQuiz | null> {
  const result = await pool.query<PublishedQuiz>(
    `SELECT
       q.title,
       COALESCE(
         json_agg(
           json_build_object(
             'id', qs.id,
             'questionText', qs.question_text,
             'imageUrl', qs.image_url,
             'options', COALESCE(
               (
                 SELECT json_agg(
                   json_build_object(
                     'id', o.id,
                     'text', o.option_text
                   )
                   ORDER BY o.id
                 )
                 FROM options o
                 WHERE o.question_id = qs.id
               ),
               '[]'::json
             )
           )
           ORDER BY qs.id
         ) FILTER (WHERE qs.id IS NOT NULL),
         '[]'::json
       ) AS questions
     FROM quizzes q
     LEFT JOIN questions qs ON qs.quiz_id = q.id
     WHERE q.code = $1 AND q.published = TRUE
     GROUP BY q.id, q.title`,
    [code]
  );

  return result.rows[0] ?? null;
}

export interface CreateQuestionOptionInput {
  text: string;
  isCorrect: boolean;
}

export interface CreatedQuestion {
  id: string;
  questionText: string;
  imageUrl: string | null;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
}

export async function quizExists(client: PoolClient, quizId: string): Promise<boolean> {
  const result = await client.query("SELECT 1 FROM quizzes WHERE id = $1", [quizId]);
  return result.rowCount === 1;
}

export async function createQuestion(
  quizId: string,
  questionText: string,
  imageUrl: string | null,
  options: CreateQuestionOptionInput[]
): Promise<CreatedQuestion> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (!(await quizExists(client, quizId))) {
      await client.query("ROLLBACK");
      throw new Error("Quiz not found");
    }

    const questionResult = await client.query<{
      id: string;
      question_text: string;
      image_url: string | null;
    }>(
      `INSERT INTO questions (quiz_id, question_text, image_url)
       VALUES ($1, $2, $3)
       RETURNING id, question_text, image_url`,
      [quizId, questionText, imageUrl]
    );

    const question = questionResult.rows[0];
    const createdOptions: CreatedQuestion["options"] = [];

    for (const option of options) {
      const optionResult = await client.query<{
        id: string;
        option_text: string;
        is_correct: boolean;
      }>(
        `INSERT INTO options (question_id, option_text, is_correct)
         VALUES ($1, $2, $3)
         RETURNING id, option_text, is_correct`,
        [question.id, option.text, option.isCorrect]
      );

      const createdOption = optionResult.rows[0];
      createdOptions.push({
        id: createdOption.id,
        text: createdOption.option_text,
        isCorrect: createdOption.is_correct
      });
    }

    await client.query("COMMIT");

    return {
      id: question.id,
      questionText: question.question_text,
      imageUrl: question.image_url,
      options: createdOptions
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original database or validation error.
    }
    throw error;
  } finally {
    client.release();
  }
}

const quizCodeCharacters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateQuizCode(): string {
  return Array.from({ length: 6 }, () =>
    quizCodeCharacters[randomInt(quizCodeCharacters.length)]
  ).join("");
}

export async function publishQuiz(id: string): Promise<Quiz | null> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingQuiz = await client.query<{ id: string }>(
      "SELECT id FROM quizzes WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (existingQuiz.rowCount === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = generateQuizCode();

      try {
        const result = await client.query<Quiz>(
          `UPDATE quizzes
           SET code = $1, published = TRUE, updated_at = NOW()
           WHERE id = $2
           RETURNING id, title, description, code, published, created_at, updated_at`,
          [code, id]
        );

        await client.query("COMMIT");
        return result.rows[0];
      } catch (error) {
        if (
          typeof error !== "object" ||
          error === null ||
          !("code" in error) ||
          error.code !== "23505"
        ) {
          throw error;
        }
      }

    }

    throw new Error("Unable to generate a unique quiz code");
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original database or code-generation error.
    }
    throw error;
  } finally {
    client.release();
  }
}

export interface Participant {
  id: string;
  quizId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function joinPublishedQuiz(
  code: string,
  name: string
): Promise<Participant | null> {
  const result = await pool.query<Participant>(
    `INSERT INTO participants (quiz_id, name)
     SELECT id, $2
     FROM quizzes
     WHERE code = $1 AND published = TRUE
     RETURNING id, quiz_id AS "quizId", name,
       created_at AS "createdAt", updated_at AS "updatedAt"`,
    [code, name]
  );

  return result.rows[0] ?? null;
}

export interface SubmitAnswerInput {
  questionId: string;
  selectedOptionId: string;
}

export interface SubmittedResult {
  id: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  completionTime: Date;
}

export class SubmissionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 400 | 404 | 409
  ) {
    super(message);
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function submitQuiz(
  code: string,
  participantId: string,
  answers: SubmitAnswerInput[]
): Promise<SubmittedResult> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const quizResult = await client.query<{ id: string }>(
      "SELECT id FROM quizzes WHERE code = $1 AND published = TRUE FOR SHARE",
      [code]
    );
    const quiz = quizResult.rows[0];

    if (!quiz) {
      throw new SubmissionError("Quiz not found or not published", 404);
    }

    const participantResult = await client.query<{ id: string }>(
      "SELECT id FROM participants WHERE id = $1 AND quiz_id = $2 FOR SHARE",
      [participantId, quiz.id]
    );

    if (!participantResult.rows[0]) {
      throw new SubmissionError("Participant does not belong to this quiz", 404);
    }

    const questionResult = await client.query<{
      id: string;
      option_id: string;
      is_correct: boolean;
    }>(
      `SELECT
         q.id,
         o.id AS option_id,
         o.is_correct
       FROM questions q
       LEFT JOIN options o ON o.question_id = q.id
       WHERE q.quiz_id = $1`,
      [quiz.id]
    );

    const questions = new Map<
      string,
      { options: Map<string, boolean> }
    >();

    for (const row of questionResult.rows) {
      let question = questions.get(row.id);
      if (!question) {
        question = { options: new Map() };
        questions.set(row.id, question);
      }
      if (row.option_id !== null) {
        question.options.set(row.option_id, row.is_correct);
      }
    }

    const duplicateQuestionIds = new Set<string>();
    let score = 0;

    for (const answer of answers) {
      if (duplicateQuestionIds.has(answer.questionId)) {
        throw new SubmissionError("Each question may be answered only once", 400);
      }
      duplicateQuestionIds.add(answer.questionId);

      const question = questions.get(answer.questionId);
      if (!question) {
        throw new SubmissionError("Question does not belong to this quiz", 400);
      }

      const isCorrect = question.options.get(answer.selectedOptionId);
      if (isCorrect === undefined) {
        throw new SubmissionError("Selected option does not belong to this question", 400);
      }

      if (isCorrect) {
        score += 1;
      }

      await client.query(
        `INSERT INTO answers (
           participant_id, question_id, selected_option_id, is_correct
         )
         VALUES ($1, $2, $3, $4)`,
        [participantId, answer.questionId, answer.selectedOptionId, isCorrect]
      );
    }

    const totalQuestions = questions.size;
    const percentage =
      totalQuestions === 0 ? 0 : Number(((score / totalQuestions) * 100).toFixed(2));

    try {
      const result = await client.query<SubmittedResult>(
        `INSERT INTO results (
           participant_id, quiz_id, score, total_questions, percentage, completion_time
         )
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING
           id,
           score,
           total_questions AS "totalQuestions",
           percentage::text AS percentage,
           completion_time AS "completionTime"`,
        [participantId, quiz.id, score, totalQuestions, percentage]
      );

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new SubmissionError("Quiz has already been submitted", 409);
      }
      throw error;
    }
  } catch (error) {
    const submissionError = isUniqueViolation(error)
      ? new SubmissionError("Quiz has already been submitted", 409)
      : error;

    try {
      await client.query("ROLLBACK");
    } catch {
      // Preserve the original submission or database error.
    }
    throw submissionError;
  } finally {
    client.release();
  }
}

export interface LeaderboardEntry {
  participantName: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  completionTime: Date;
}

export async function getLeaderboardByCode(
  code: string
): Promise<LeaderboardEntry[] | null> {
  const quizResult = await pool.query(
    "SELECT 1 FROM quizzes WHERE code = $1",
    [code]
  );

  if (quizResult.rowCount === 0) {
    return null;
  }

  const result = await pool.query<LeaderboardEntry>(
    `SELECT
       p.name AS "participantName",
       r.score,
       r.total_questions AS "totalQuestions",
       r.percentage::text AS percentage,
       r.completion_time AS "completionTime"
     FROM results r
     INNER JOIN quizzes q ON q.id = r.quiz_id
     INNER JOIN participants p ON p.id = r.participant_id
     WHERE q.code = $1
     ORDER BY r.score DESC, r.completion_time ASC`,
    [code]
  );

  return result.rows;
}
