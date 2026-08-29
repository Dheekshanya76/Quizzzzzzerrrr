import { Router } from "express";
import { getParticipantResultController } from "../controllers/participant.controller.js";

export const participantRouter = Router();

participantRouter.get("/:participantId/result", getParticipantResultController);
