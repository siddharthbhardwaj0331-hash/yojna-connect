"use client";

import { useState, useRef, useEffect } from "react";
import { apiUrl } from "@/lib/api-config";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "👋 Hello! Main Yojna AI Assistant hoon. Kaise help karu?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(apiUrl("/chat"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          profile: JSON.parse(localStorage.getItem("yojnaProfile") || "{}")
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply || "⚠️ No response" },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error connecting to server" },
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 bg-yellow-500 text-black px-4 py-3 rounded-full shadow-lg z-50"
      >
        🤖
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 h-96 bg-black/80 backdrop-blur-lg text-white rounded-xl shadow-xl flex flex-col z-50">
          
          {/* Header */}
          <div className="p-3 border-b border-gray-700 font-bold">
            Yojna AI 🤖
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-yellow-500 text-black ml-auto"
                    : "bg-gray-700"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-gray-400">Typing...</div>}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 border-t border-gray-700 flex">
            <input
              className="flex-1 p-2 rounded bg-gray-800 outline-none"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type message..."
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-yellow-500 px-3 rounded text-black"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}