import type { Request, Response } from "express";
import { deleteQuestion } from "../services/question.service.js";

export async function deleteQuestionController(
  request: Request,
  response: Response
): Promise<void> {
  const { id } = request.params;

  if (typeof id !== "string" || !/^\d+$/.test(id) || BigInt(id) <= 0n) {
    response.status(404).json({ error: "Question not found" });
    return;
  }

  const deleted = await deleteQuestion(id);

  if (!deleted) {
    response.status(404).json({ error: "Question not found" });
    return;
  }

  response.status(204).send();
}
