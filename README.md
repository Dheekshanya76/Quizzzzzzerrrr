# QUIZER

QUIZER is a web-based quiz application that allows hosts to create and
publish quizzes and allows participants to join quizzes using a unique
quiz code, answer questions, submit their responses, view their scores,
and view the leaderboard.

---

## Features

### Host

- Create a quiz
- Add quiz questions
- Add multiple options for each question
- Select the correct answer
- Publish a quiz
- Generate a unique quiz code

### Participant

- Enter participant name
- Enter quiz code
- Join a published quiz
- View quiz questions
- Select answers
- Navigate between questions
- Submit the quiz
- View score and percentage
- View leaderboard

### Leaderboard

- Stores participant results
- Displays multiple participants
- Sorts participants by score
- Uses completion time when scores are equal

### Image Uploads

The backend supports image uploads through Cloudinary.

Copy `backend/.env.example` to `backend/.env` and configure the
Cloudinary values before using the upload API.

---

## Project Structure

```text
Quizzzzzzerrrr/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       ├── services/
│       │   └── quiz.service.ts
│       ├── db/
│       └── ...
│
├── frontend/
│   ├── app/
│   │   ├── host/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   │       └── page.tsx
│   │   │
│   │   ├── join/
│   │   │   └── page.tsx
│   │   │
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   │
│   │   ├── results/
│   │   │   └── page.tsx
│   │   │
│   │   └── page.tsx
│   │
│   └── lib/
│       └── api.ts
│
├── README.md
└── .gitignore