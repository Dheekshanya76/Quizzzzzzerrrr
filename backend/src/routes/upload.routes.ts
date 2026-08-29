import multer from "multer";
import { Router } from "express";
import { uploadController } from "../controllers/upload.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
      return;
    }
    callback(null, true);
  }
});

export const uploadRouter = Router();

uploadRouter.post("/", upload.single("image"), uploadController);
