import { Router } from "express";
import { deleteQuestionController } from "../controllers/question.controller.js";

export const questionRouter = Router();

questionRouter.delete("/:id", deleteQuestionController);
