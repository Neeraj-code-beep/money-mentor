"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "user" | "assistant"; text: string };

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I’m Money Mentor. Ask me about saving, investing, or your dashboard numbers.",
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api<{ reply: string }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: text }),
      });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <motion.button
        type="button"
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lift",
          open && "pointer-events-none opacity-0"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,400px)]"
          >
            <Card className="overflow-hidden border-emerald-100 shadow-2xl shadow-emerald-900/10">
              <div className="flex items-center justify-between border-b border-emerald-50 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 text-white">
                <div>
                  <div className="text-sm font-bold">Money Mentor</div>
                  <div className="text-xs text-emerald-50/90">AI assistant</div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/10"
                  onClick={() => setOpen(false)}
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <ScrollArea className="h-[min(55vh,420px)] bg-emerald-50/40 p-3">
                <div className="flex flex-col gap-3 pr-2">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                          m.role === "user"
                            ? "rounded-br-md bg-emerald-600 text-white"
                            : "rounded-bl-md bg-white text-slate-800 ring-1 ring-emerald-100"
                        )}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-white px-3 py-2 text-sm text-slate-500 ring-1 ring-emerald-100">
                        <TypingDots />
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
              </ScrollArea>
              <div className="flex gap-2 border-t border-emerald-50 bg-white p-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your finances..."
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  className="bg-white"
                />
                <Button type="button" onClick={send} disabled={loading} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <motion.span
        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.span
        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.15 }}
      />
      <motion.span
        className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
      />
    </span>
  );
}
