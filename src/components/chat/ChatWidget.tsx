"use client";

import { useRef, useState, useEffect } from "react";
import { PetChatSelector } from "@/components/chat/PetChatSelector";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "سلام! من دستیار هوشمند پت‌لند هستم 🐾 هر سؤالی درباره نگهداری، تغذیه یا سلامت حیوان خانگی‌تان دارید بپرسید.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [petId, setPetId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function handlePetChange(newPetId: string | null) {
    if (newPetId !== petId) {
      // گفت‌وگوی تازه تا مشخصات پت قبلی به مدل برنگردد
      setMessages([
        {
          role: "assistant",
          content: newPetId
            ? "باشه، از این به بعد با توجه به مشخصات همین پت کمکت می‌کنم 🐾"
            : "سلام! من دستیار هوشمند پت‌لند هستم 🐾 هر سؤالی داری بپرس.",
        },
      ]);
    }
    setPetId(newPetId);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, petId: petId ?? undefined }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data?.error ?? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
          },
        ]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: assistantText };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "خطایی رخ داد. لطفاً دوباره تلاش کنید." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg transition hover:scale-105"
        aria-label="چت با دستیار هوشمند"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 left-5 z-50 flex h-[32rem] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center gap-2 border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <span className="text-xl">🐾</span>
            <span className="font-semibold">دستیار هوشمند پت‌لند</span>
          </div>

          <PetChatSelector onPetChange={handlePetChange} />

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={clsxMsg(m.role)}
              >
                {m.content || (loading && i === messages.length - 1 ? "…" : "")}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-center gap-2 border-t border-border p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="سؤالتان را بنویسید..."
              className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              ارسال
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function clsxMsg(role: Message["role"]) {
  const base = "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 whitespace-pre-wrap";
  if (role === "user") {
    return `${base} me-auto bg-primary text-primary-foreground`;
  }
  return `${base} ms-auto bg-surface-muted text-foreground`;
}
