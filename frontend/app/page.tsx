"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message) return;

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          message: message,
        }
      );

      setReply(response.data.reply);
    } catch (error) {
      console.error(error);
      setReply("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-100 rounded-2xl shadow-lg p-6">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-600">
          Dental AI Assistant
        </h1>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a dental question..."
          className="w-full p-4 rounded-lg border border-gray-300 outline-none"
          rows={4}
        />

        <button
          onClick={sendMessage}
          className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Ask AI
        </button>

        {loading && (
          <p className="mt-4 text-center text-gray-500">
            AI is thinking...
          </p>
        )}

        {reply && (
          <div className="mt-6 bg-white p-4 rounded-lg border">
            <h2 className="font-semibold mb-2 text-blue-600">
              AI Response
            </h2>

            <p className="whitespace-pre-wrap text-gray-700">
              {reply}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}