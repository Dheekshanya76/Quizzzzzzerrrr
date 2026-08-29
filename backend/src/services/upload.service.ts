import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse } from "cloudinary";

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly statusCode: 502 | 500
  ) {
    super(message);
  }
}

function configureCloudinary(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new UploadError("Cloudinary is not configured", 500);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}

export function uploadImage(file: Express.Multer.File): Promise<string> {
  try {
    configureCloudinary();
  } catch (error) {
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "quizora" },
      (error: Error | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(new UploadError("Image upload failed", 502));
          return;
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
}
