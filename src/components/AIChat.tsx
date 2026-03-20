import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import type { ChatMessage, Position, PortfolioSummary } from "../types";
import { askPortfolioQuestion } from "../services/claude";

interface Props {
  positions: Position[];
  summary: PortfolioSummary;
}

const SUGGESTIONS = [
  "What's my best performing position?",
  "Which stock has the most risk?",
  "How diversified is my portfolio?",
  "What's my total unrealized gain?",
];

export function AIChat({ positions, summary }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: "user", content };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const reply = await askPortfolioQuestion(next, positions, summary);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "Something went wrong. Check your API key and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
            <Bot size={20} className="text-sky-400" />
          </div>
          <p className="text-sm text-neutral-400 text-center max-w-xs">
            Ask anything about your portfolio. I have full context of your
            positions.
          </p>
          <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-left text-xs px-3 py-2 rounded-lg border border-neutral-800 text-neutral-400 hover:border-sky-500/50 hover:text-neutral-200 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.role === "user"
                    ? "bg-neutral-700"
                    : "bg-sky-500/10"
                }`}
              >
                {m.role === "user" ? (
                  <User size={14} className="text-neutral-300" />
                ) : (
                  <Bot size={14} className="text-sky-400" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-neutral-800 text-neutral-100"
                    : "bg-neutral-900 border border-neutral-800 text-neutral-200"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-sky-500/10 flex items-center justify-center">
                <Bot size={14} className="text-sky-400" />
              </div>
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      <div className="p-4 border-t border-neutral-800 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about your portfolio..."
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-600 outline-none focus:border-sky-500/50 transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-9 h-9 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
