"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getQuiz,
  createQuestion,
  publishQuiz,
  deleteQuestion,
  type QuizResponse,
} from "../../../../lib/api";

export default function QuizEditorPage() {
  const params = useParams();
  const router = useRouter();

  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizResponse | null>(null);

  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        setError("");

        const data = await getQuiz(quizId);
        setQuiz(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  function updateOption(index: number, value: string) {
    setOptions((current) => {
      const updated = [...current];
      updated[index] = value;
      return updated;
    });
  }

  async function addQuestion() {
    setError("");

    if (!question.trim()) {
      setError("Question text is required.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("Please fill all four options.");
      return;
    }

    try {
      setSaving(true);

      const newQuestion = await createQuestion(quizId, {
        questionText: question.trim(),
        imageUrl: null,
        options: options.map((option, index) => ({
          text: option.trim(),
          isCorrect: index === correctAnswer,
        })),
      });

      setQuiz((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          questions: [
            ...(current.questions || []),
            newQuestion,
          ],
        };
      });

      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to add question."
      );
    } finally {
      setSaving(false);
    }
  }

  async function removeQuestion(id: string) {
    setError("");

    try {
      await deleteQuestion(id);

      setQuiz((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          questions: (current.questions || []).filter(
            (item) => String(item.id) !== String(id)
          ),
        };
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove question."
      );
    }
  }

  async function handlePublish() {
    setError("");

    if (!quiz) {
      return;
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      setError(
        "Add at least one question before publishing."
      );
      return;
    }

    try {
      setSaving(true);

      const updatedQuiz = await publishQuiz(quizId);

      setQuiz(updatedQuiz);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to publish quiz."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading quiz...</p>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">
            Quiz not found
          </h1>

          {error && (
            <p className="mb-4 text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Back to Home
          </button>
        </div>
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
              {quiz.code || "------"}
            </div>

            <h2 className="mb-2 text-2xl font-bold">
              {quiz.title}
            </h2>

            {quiz.description && (
              <p className="mb-6 text-gray-600">
                {quiz.description}
              </p>
            )}

            <p className="mb-8">
              {(quiz.questions || []).length} question
              {(quiz.questions || []).length !== 1
                ? "s"
                : ""}
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
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            placeholder="Enter your question"
            rows={3}
            className="mb-5 w-full rounded-lg border p-3 outline-none focus:ring-2"
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
                onChange={() =>
                  setCorrectAnswer(index)
                }
              />

              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateOption(
                    index,
                    e.target.value
                  )
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1 rounded-lg border p-3 outline-none focus:ring-2"
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
            disabled={saving}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Question"}
          </button>
        </div>

        {quiz.questions &&
          quiz.questions.length > 0 && (
            <div className="mb-6 rounded-2xl border p-6 shadow-sm">
              <h2 className="mb-5 text-2xl font-bold">
                Questions ({quiz.questions.length})
              </h2>

              {quiz.questions.map(
                (item, index) => (
                  <div
                    key={item.id}
                    className="mb-4 rounded-xl border p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <h3 className="font-semibold">
                        {index + 1}.{" "}
                        {item.questionText}
                      </h3>

                      <button
                        onClick={() =>
                          removeQuestion(
                            String(item.id)
                          )
                        }
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt="Question"
                        className="mt-4 max-h-48 rounded-lg border object-contain"
                      />
                    )}

                    <div className="mt-3 space-y-2">
                      {item.options.map(
                        (option, optionIndex) => (
                          <p
                            key={option.id}
                            className={
                              option.isCorrect
                                ? "font-semibold"
                                : ""
                            }
                          >
                            {String.fromCharCode(
                              65 + optionIndex
                            )}
                            . {option.text}

                            {option.isCorrect &&
                              " ✓"}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handlePublish}
          disabled={saving}
          className="w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Publishing..." : "Publish Quiz"}
        </button>
      </div>
    </main>
  );
}