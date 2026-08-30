# Quizzzzzzerrrr

A full-stack quiz application where hosts can create and publish quizzes, and participants can join using a unique quiz code, answer questions, submit their quiz, view their results, and check the leaderboard.

## Features

### Host

* Create a quiz
* Add questions and multiple-choice options
* Mark correct answers
* Publish a quiz
* Generate a unique quiz code

### Participant

* Join a published quiz using a quiz code
* Enter a participant name
* View quiz questions dynamically
* Select answers
* Navigate between questions
* Submit the quiz
* View score and percentage
* View the leaderboard

## Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Fetch API

### Backend

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* `pg` PostgreSQL client

### Integration

The frontend communicates with the backend using REST APIs.

```text
Next.js / React Frontend
        |
        | REST API / Fetch
        v
Express.js Backend
        |
        | PostgreSQL queries
        v
PostgreSQL Database

```

## Project Structure

```text
Quizzzzzzerrrr/
│
├── backend/
│   └── src/
│       ├── db/
│       │   └── index.ts
│       ├── services/
│       │   └── quiz.service.ts
│       └── ...
│
├── frontend/
│   ├── app/
│   │   ├── host/
│   │   │   ├── page.tsx
│   │   │   └── create/
│   │   ├── join/
│   │   │   └── page.tsx
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   ├── results/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   │
│   └── lib/
│       └── api.ts
│
└── README.md

```

## Application Flow

### Host

```text
Create Quiz
    │
    ▼
Add Questions & Options
    │
    ▼
Publish
    │
    ▼
Unique Quiz Code (e.g., PSNEA8)

```

### Participant

```text
Enter Name + Quiz Code
    │
    ▼
Join Quiz
    │
    ▼
Get Participant ID
    │
    ▼
Load Quiz
    │
    ▼
Answer Questions
    │
    ▼
Submit Quiz
    │
    ▼
Calculate Score
    │
    ├─────────────┐
    ▼             ▼
Results      Leaderboard

```

## API Endpoints

### Quiz & Participant

| Action | Method | Endpoint |
| --- | --- | --- |
| Get quiz by code | `GET` | `/api/quizzes/code/:code` |
| Join quiz | `POST` | `/api/quizzes/code/:code/join` |
| Submit quiz | `POST` | `/api/quizzes/code/:code/submit` |
| Get leaderboard | `GET` | `/api/quizzes/code/:code/leaderboard` |

## Participant API Integration

The frontend API functions are centralized in `frontend/lib/api.ts`. The main participant functions are:

* `getQuizByCode()`
* `joinQuiz()`
* `submitQuiz()`
* `getLeaderboard()`

### Get Quiz

`GET /api/quizzes/code/:code`
Retrieves the published quiz, questions, and options using the quiz code.

### Join Quiz

`POST /api/quizzes/code/:code/join`
Creates a participant for the selected quiz and returns the participant ID.

### Submit Quiz

`POST /api/quizzes/code/:code/submit`
Sends the participant ID and selected answers to the backend. The backend validates the answers and calculates the score.

### Leaderboard

`GET /api/quizzes/code/:code/leaderboard`
Retrieves the results of participants who completed the quiz.

## Database

The application uses PostgreSQL to store quiz and participant data. Main tables include:

* `quizzes`
* `questions`
* `options`
* `participants`
* `answers`
* `results`

The quiz code is stored in the `code` column of the `quizzes` table. Questions and options are connected to the quiz using their IDs, while participant answers and results are associated with the participant and quiz.

## Frontend-Backend Integration

The frontend uses the Fetch API to communicate with the Express.js backend through a structured pipeline:

```text
React Component
      │
      ▼
frontend/lib/api.ts
      │
      ▼
Fetch API
      │
      ▼
REST Endpoint
      │
      ▼
Express.js Backend
      │
      ▼
Quiz Service
      │
      ▼
PostgreSQL

```

## Running the Project

### 1. Clone the repository

```bash
git clone <repository-url>
cd Quizzzzzzerrrr

```

### 2. Backend

Navigate to the backend:

```bash
cd backend

```

Install dependencies:

```bash
npm install

```

Configure the backend environment variables in `backend/.env`. Start the backend using the project's configured npm script. The backend runs on `http://localhost:3000`.

### 3. Frontend

Open another terminal and navigate to the frontend:

```bash
cd frontend

```

Install dependencies:

```bash
npm install

```

Start the frontend development server:

```bash
npm run dev

```

The frontend runs on `http://localhost:3001`.

## Image Uploads

The application supports image uploads through Cloudinary. Copy `backend/.env.example` to `backend/.env` and configure the required Cloudinary values. Images can be uploaded using `POST /api/upload` via the multipart form-data field `image`. A successful upload returns an HTTP `201` response containing the uploaded image URL.

## Example Participant Flow

Participants join using a published code like `PSNEA8`:

```text
/join
   │
   ├─► Enter name + PSNEA8
   ▼
Join API
   │
   ▼
Participant ID
   │
   ▼
/quiz
   │
   ├─► Load quiz
   ├─► Answer questions
   ▼
Submit Quiz
   │
   ▼
/results
   │
   ▼
Leaderboard

```

## Team Contribution

The project was developed as a team. The participant-side frontend and frontend-backend integration include:

* Participant join flow
* Quiz loading by code
* Question and option rendering
* Answer selection and state management
* Quiz submission
* Results display
* Leaderboard integration
* REST API integration through `frontend/lib/api.ts`

## License

This project was developed as an academic/team project.
