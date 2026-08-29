import type { Request, Response } from "express";
import { getParticipantResult } from "../services/participant.service.js";

export async function getParticipantResultController(
  request: Request,
  response: Response
): Promise<void> {
  const { participantId } = request.params;

  if (
    typeof participantId !== "string" ||
    !/^\d+$/.test(participantId) ||
    BigInt(participantId) <= 0n
  ) {
    response.status(404).json({ error: "Participant result not found" });
    return;
  }

  const result = await getParticipantResult(participantId);

  if (!result) {
    response.status(404).json({ error: "Participant result not found" });
    return;
  }

  response.status(200).json(result);
}
