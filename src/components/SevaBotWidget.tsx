"use client";

import { Bot, MessageCircle, Send, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starter: ChatMessage = {
  role: "assistant",
  content:
    "Namaste! Main SevaBot hoon. Aapko kaunsi service chahiye ya aap apna business list karna chahte hain?",
};

export default function SevaBotWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([starter]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/sevabot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await res.json()) as { reply?: string };

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "Main abhi thoda busy hoon, lekin aap apni requirement bhejiye - main turant help karta hoon.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Connection issue aa gaya. Aap service + locality bhej dijiye, main phir se try karta hoon.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="sevabot-fab fixed bottom-[88px] right-6 z-[60] inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-5 py-3 text-sm font-bold text-[#1a2d5c] shadow-xl transition duration-300 ease-out hover:brightness-105 active:scale-95 md:bottom-6"
          aria-label="Open SevaBot"
          title="Need help finding a service?"
        >
          <MessageCircle size={18} aria-hidden />
          SevaBot
        </button>
      )}

      {open && (
        <div className="fixed bottom-[88px] right-6 z-[60] w-[92vw] max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:bottom-6">
          <div className="flex items-center justify-between bg-[#1a2d5c] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot size={17} />
              <p className="text-sm font-bold">SevaBot Assistant</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/10" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto bg-gray-50 p-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[88%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === "assistant"
                    ? "bg-white text-gray-800 border border-gray-200"
                    : "ml-auto bg-saffron text-white"
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && <div className="text-xs font-medium text-gray-500">SevaBot typing...</div>}
          </div>

          <form onSubmit={onSubmit} className="border-t border-gray-200 bg-white p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type service + locality..."
                className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-saffron focus:outline-none"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-saffron text-white disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
