import { pool } from "../db/index.js";

export interface ParticipantResult {
  participantName: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  percentage: string;
  correctAnswers: number;
  incorrectAnswers: number;
  quizId: string;
}

export async function getParticipantResult(
  participantId: string
): Promise<ParticipantResult | null> {
  const result = await pool.query<ParticipantResult>(
    `SELECT
       p.name AS "participantName",
       q.title AS "quizTitle",
       r.score,
       r.total_questions AS "totalQuestions",
       r.percentage::text AS percentage,
       COUNT(a.id) FILTER (WHERE a.is_correct = TRUE)::int AS "correctAnswers",
       COUNT(a.id) FILTER (WHERE a.is_correct = FALSE)::int AS "incorrectAnswers",
       q.id AS "quizId"
     FROM participants p
     INNER JOIN quizzes q ON q.id = p.quiz_id
     INNER JOIN results r
       ON r.participant_id = p.id AND r.quiz_id = q.id
     LEFT JOIN answers a ON a.participant_id = p.id
     WHERE p.id = $1
     GROUP BY p.id, p.name, q.id, q.title, r.id, r.score,
       r.total_questions, r.percentage`,
    [participantId]
  );

  return result.rows[0] ?? null;
}
