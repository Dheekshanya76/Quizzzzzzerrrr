import type { Request, Response } from "express";
import { uploadImage, UploadError } from "../services/upload.service.js";

export async function uploadController(
  request: Request,
  response: Response
): Promise<void> {
  if (!request.file) {
    response.status(400).json({ error: "An image file is required" });
    return;
  }

  try {
    const secureUrl = await uploadImage(request.file);
    response.status(201).json({ secureUrl });
  } catch (error) {
    if (error instanceof UploadError) {
      response.status(error.statusCode).json({ error: error.message });
      return;
    }
    throw error;
  }
}
