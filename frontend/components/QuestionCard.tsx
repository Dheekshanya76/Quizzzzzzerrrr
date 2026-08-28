"use client";

type QuestionCardProps = {
  question: string;
  options: string[];
  selectedAnswer: string;
  onSelect: (answer: string) => void;
  onSubmit: () => void;
  submitted: boolean;
  correctAnswer: string;
};

export default function QuestionCard({
  question,
  options,
  selectedAnswer,
  onSelect,
  onSubmit,
  submitted,
  correctAnswer,
}: QuestionCardProps) {
  return (
    <div className="rounded-2xl bg-white p-8 shadow-lg">
      <h2 className="mb-8 text-2xl font-bold text-gray-900">
        {question}
      </h2>

      <div className="space-y-4">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={submitted}
            onClick={() => onSelect(option)}
            className={`w-full rounded-xl border-2 p-4 text-left font-medium transition ${
              selectedAnswer === option
                ? "border-black bg-gray-100"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={onSubmit}
          className="mt-8 w-full rounded-xl bg-black py-4 font-semibold text-white hover:bg-gray-800"
        >
          Submit Answer
        </button>
      ) : (
        <div className="mt-8 rounded-xl bg-gray-100 p-5 text-center">
          <p className="font-semibold">
            {selectedAnswer === correctAnswer
              ? "🎉 Correct!"
              : "❌ Incorrect!"}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Correct answer: {correctAnswer}
          </p>
        </div>
      )}
    </div>
  );
}