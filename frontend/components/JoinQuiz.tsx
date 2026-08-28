"use client";

import { useState } from "react";

export default function JoinQuiz() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const join = () => {
    if (!code || !name) {
      alert("Enter Quiz Code and Name");
      return;
    }

    window.location.href = `/quiz?code=${code}&name=${name}`;
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6">
      <h1 className="text-3xl font-bold mb-6">Join Quiz</h1>

      <input
        className="border p-3 w-full mb-3"
        placeholder="Quiz Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <input
        className="border p-3 w-full mb-3"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button
        onClick={join}
        className="bg-black text-white px-6 py-3 rounded w-full"
      >
        Join Quiz
      </button>
    </div>
  );
}