"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  published: boolean;
  code: string;
};

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [error, setError] = useState("");

  useEffect(() => {
    const storedQuiz = localStorage.getItem(`quiz-${quizId}`);

    if (storedQuiz) {
      setQuiz(JSON.parse(storedQuiz));
    }
  }, [quizId]);

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  function addQuestion() {
    setError("");

    if (!question.trim()) {
      setError("Question text is required.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("Please fill all four options.");
      return;
    }

    if (!quiz) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      question: question.trim(),
      options: options.map((option) => option.trim()),
      correctAnswer,
    };

    const updatedQuiz = {
      ...quiz,
      questions: [...quiz.questions, newQuestion],
    };

    setQuiz(updatedQuiz);

    localStorage.setItem(
      `quiz-${quizId}`,
      JSON.stringify(updatedQuiz)
    );

    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  }

  function removeQuestion(id: string) {
    if (!quiz) return;

    const updatedQuiz = {
      ...quiz,
      questions: quiz.questions.filter(
        (item) => item.id !== id
      ),
    };

    setQuiz(updatedQuiz);

    localStorage.setItem(
      `quiz-${quizId}`,
      JSON.stringify(updatedQuiz)
    );
  }

  function publishQuiz() {
    setError("");

    if (!quiz) return;

    if (quiz.questions.length === 0) {
      setError("Add at least one question before publishing.");
      return;
    }

    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const updatedQuiz = {
      ...quiz,
      published: true,
      code,
    };

    localStorage.setItem(
      `quiz-${quizId}`,
      JSON.stringify(updatedQuiz)
    );

    setQuiz(updatedQuiz);
  }

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading quiz...</p>
      </main>
    );
  }

  if (quiz.published) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-2xl">

          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">
              Quiz Published!
            </h1>

            <p className="mt-2 text-gray-600">
              Share this code with participants.
            </p>
          </div>

          <div className="rounded-2xl border p-8 text-center shadow-sm">

            <p className="mb-3 text-gray-600">
              Quiz Code
            </p>

            <div className="mb-6 text-5xl font-bold tracking-widest">
              {quiz.code}
            </div>

            <h2 className="mb-2 text-2xl font-bold">
              {quiz.title}
            </h2>

            <p className="mb-6 text-gray-600">
              {quiz.description}
            </p>

            <p className="mb-8">
              {quiz.questions.length} question
              {quiz.questions.length !== 1 ? "s" : ""}
            </p>

            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
            >
              Back to Home
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {quiz.title}
          </h1>

          {quiz.description && (
            <p className="mt-2 text-gray-600">
              {quiz.description}
            </p>
          )}
        </div>

        <div className="mb-6 rounded-2xl border p-6 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">
            Add Question
          </h2>

          <label className="mb-2 block font-medium">
            Question
          </label>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your question"
            rows={3}
            className="mb-5 w-full rounded-lg border p-3"
          />

          <label className="mb-3 block font-medium">
            Options
          </label>

          {options.map((option, index) => (
            <div
              key={index}
              className="mb-3 flex items-center gap-3"
            >
              <input
                type="radio"
                name="correct"
                checked={correctAnswer === index}
                onChange={() => setCorrectAnswer(index)}
              />

              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateOption(index, e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1 rounded-lg border p-3"
              />
            </div>
          ))}

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={addQuestion}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Add Question
          </button>

        </div>

        {quiz.questions.length > 0 && (
          <div className="mb-6 rounded-2xl border p-6 shadow-sm">

            <h2 className="mb-5 text-2xl font-bold">
              Questions ({quiz.questions.length})
            </h2>

            {quiz.questions.map((item, index) => (
              <div
                key={item.id}
                className="mb-4 rounded-xl border p-4"
              >

                <div className="flex justify-between gap-4">
                  <h3 className="font-semibold">
                    {index + 1}. {item.question}
                  </h3>

                  <button
                    onClick={() => removeQuestion(item.id)}
                    className="text-sm text-red-600"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {item.options.map(
                    (option, optionIndex) => (
                      <p
                        key={optionIndex}
                        className={
                          optionIndex === item.correctAnswer
                            ? "font-semibold"
                            : ""
                        }
                      >
                        {String.fromCharCode(65 + optionIndex)}.{" "}
                        {option}

                        {optionIndex === item.correctAnswer &&
                          " ✓"}
                      </p>
                    )
                  )}
                </div>

              </div>
            ))}

          </div>
        )}

        <button
          onClick={publishQuiz}
          className="w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white"
        >
          Publish Quiz
        </button>

      </div>
    </main>
  );
}