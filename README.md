# Quizzzzzzerrrr

## Image uploads

Copy `backend/.env.example` to `backend/.env` and set the Cloudinary
configuration values before using `POST /api/upload`.

Send an image as multipart form data using the field name `image`. A successful
upload returns HTTP `201` with `{ "secureUrl": "..." }`.