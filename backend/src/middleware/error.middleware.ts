import type { ErrorRequestHandler } from "express";
import multer from "multer";

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: "Invalid image upload" });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Internal server error" });
};
