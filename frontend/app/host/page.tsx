"use client";

import { useState } from "react";

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function HostPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [published, setPublished] = useState(false);
  const [quizCode, setQuizCode] = useState("");

  const [error, setError] = useState("");

  function updateOption(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  function addQuestion() {
    setError("");

    if (!questionText.trim()) {
      setError("Please enter a question.");
      return;
    }

    if (options.some((option) => !option.trim())) {
      setError("Please fill all four options.");
      return;
    }

    const newQuestion: Question = {
      question: questionText.trim(),
      options: options.map((option) => option.trim()),
      correctAnswer,
    };

    setQuestions([...questions, newQuestion]);

    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
  }

  function removeQuestion(index: number) {
    setQuestions(
      questions.filter((_, questionIndex) => questionIndex !== index)
    );
  }

  function publishQuiz() {
    setError("");

    if (!title.trim()) {
      setError("Please enter a quiz title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a quiz description.");
      return;
    }

    if (questions.length === 0) {
      setError("Please add at least one question.");
      return;
    }

    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    setQuizCode(code);
    setPublished(true);
  }

  function resetQuiz() {
    setTitle("");
    setDescription("");
    setQuestions([]);
    setQuestionText("");
    setOptions(["", "", "", ""]);
    setCorrectAnswer(0);
    setPublished(false);
    setQuizCode("");
    setError("");
  }

  if (published) {
    return (
      <main className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">
              QUIZER
            </h1>

            <p className="text-gray-600 mt-2">
              Quiz Published Successfully!
            </p>
          </div>

          <div className="border rounded-2xl p-8 text-center shadow-sm">

            <p className="text-gray-600 mb-3">
              Your Quiz Code
            </p>

            <div className="text-5xl font-bold tracking-widest mb-6">
              {quizCode}
            </div>

            <p className="text-gray-600 mb-2">
              Share this code with participants.
            </p>

            <p className="font-medium mb-8">
              {title}
            </p>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  (window.location.href = `/join`)
                }
                className="w-1/2 border px-6 py-3 rounded-lg"
              >
                Join Quiz
              </button>

              <button
                onClick={resetQuiz}
                className="w-1/2 bg-black text-white px-6 py-3 rounded-lg"
              >
                Create Another
              </button>

            </div>
          </div>

          <div className="border rounded-2xl p-6 mt-6">

            <h2 className="text-xl font-bold mb-4">
              Quiz Summary
            </h2>

            <p className="mb-2">
              <strong>Title:</strong> {title}
            </p>

            <p className="mb-2">
              <strong>Description:</strong> {description}
            </p>

            <p>
              <strong>Total Questions:</strong>{" "}
              {questions.length}
            </p>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold">
            QUIZER
          </h1>

          <p className="text-gray-600 mt-2">
            Create a Quiz
          </p>
        </div>

        {/* Quiz Details */}

        <div className="border rounded-2xl p-6 shadow-sm mb-6">

          <h2 className="text-2xl font-bold mb-5">
            Quiz Details
          </h2>

          <label className="block font-medium mb-2">
            Quiz Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            className="w-full border rounded-lg p-3 mb-5"
          />

          <label className="block font-medium mb-2">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            placeholder="Enter quiz description"
            rows={3}
            className="w-full border rounded-lg p-3"
          />

        </div>

        {/* Add Question */}

        <div className="border rounded-2xl p-6 shadow-sm mb-6">

          <h2 className="text-2xl font-bold mb-5">
            Add Question
          </h2>

          <label className="block font-medium mb-2">
            Question
          </label>

          <textarea
            value={questionText}
            onChange={(e) =>
              setQuestionText(e.target.value)
            }
            placeholder="Enter your question"
            rows={3}
            className="w-full border rounded-lg p-3 mb-5"
          />

          <label className="block font-medium mb-3">
            Options
          </label>

          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-center gap-3 mb-3"
            >

              <input
                type="radio"
                name="correctAnswer"
                checked={correctAnswer === index}
                onChange={() =>
                  setCorrectAnswer(index)
                }
              />

              <input
                type="text"
                value={option}
                onChange={(e) =>
                  updateOption(index, e.target.value)
                }
                placeholder={`Option ${index + 1}`}
                className="flex-1 border rounded-lg p-3"
              />

            </div>
          ))}

          <p className="text-sm text-gray-500 mt-3">
            Select the radio button beside the correct answer.
          </p>

          <button
            onClick={addQuestion}
            className="w-full bg-black text-white py-3 rounded-lg mt-6"
          >
            Add Question
          </button>

        </div>

        {/* Questions Added */}

        {questions.length > 0 && (
          <div className="border rounded-2xl p-6 shadow-sm mb-6">

            <h2 className="text-2xl font-bold mb-5">
              Questions Added ({questions.length})
            </h2>

            {questions.map((question, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 mb-4"
              >

                <div className="flex justify-between gap-4">

                  <h3 className="font-semibold">
                    {index + 1}. {question.question}
                  </h3>

                  <button
                    onClick={() =>
                      removeQuestion(index)
                    }
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>

                </div>

                <div className="mt-3 space-y-2">

                  {question.options.map(
                    (option, optionIndex) => (
                      <p
                        key={optionIndex}
                        className={
                          optionIndex ===
                          question.correctAnswer
                            ? "font-semibold"
                            : ""
                        }
                      >
                        {String.fromCharCode(65 + optionIndex)}.{" "}
                        {option}
                        {optionIndex ===
                          question.correctAnswer &&
                          " ✓"}
                      </p>
                    )
                  )}

                </div>

              </div>
            ))}

          </div>
        )}

        {/* Error */}

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-3 mb-5">
            {error}
          </div>
        )}

        {/* Publish */}

        <button
          onClick={publishQuiz}
          className="w-full bg-black text-white py-4 rounded-xl text-lg font-semibold"
        >
          Publish Quiz
        </button>

      </div>
    </main>
  );
}