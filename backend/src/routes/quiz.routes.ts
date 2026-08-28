import { Router } from "express";
import {
  createQuestionController,
  createQuizController,
  getPublishedQuizByCodeController,
  getQuizController,
  joinQuizController,
  publishQuizController,
  submitQuizController
} from "../controllers/quiz.controller.js";

export const quizRouter = Router();

quizRouter.post("/", createQuizController);
quizRouter.post("/:id/questions", createQuestionController);
quizRouter.post("/:id/publish", publishQuizController);
quizRouter.post("/code/:code/join", joinQuizController);
quizRouter.post("/code/:code/submit", submitQuizController);
quizRouter.get("/code/:code", getPublishedQuizByCodeController);
quizRouter.get("/:id", getQuizController);
