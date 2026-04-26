import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, User } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatStream } from "@/lib/ai.functions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Ask Aurora · AI Assistant" },
      { name: "description", content: "Chat with Aurora — your AI productivity copilot. Draft, plan, decide, and think out loud." },
    ],
  }),
  component: Chat,
});

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Draft a polite follow-up email to a client who hasn't replied",
  "Help me plan my week — I have 4 deep-work projects",
  "Summarize the pros and cons of monorepos vs polyrepos",
  "Write a tweet announcing our new feature in a Steve Jobs tone",
];

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sendFn = useServerFn(chatStream);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await sendFn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
      setMessages(next); // keep user msg, no assistant reply
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-7rem)] max-w-4xl flex-col px-4 pb-4 pt-8">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Ask Aurora</p>
        <h1 className="font-display text-3xl font-semibold md:text-4xl">
          Your <span className="text-gradient">thinking partner.</span>
        </h1>
      </div>

      <div className="glass-strong relative flex flex-1 flex-col overflow-hidden rounded-3xl">
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="orb mb-4 flex size-16 items-center justify-center rounded-2xl">
                <Sparkles className="size-7 text-primary-foreground" />
              </div>
              <p className="mb-6 text-muted-foreground">Ask anything. Aurora drafts, plans, and decides with you.</p>
              <div className="grid w-full max-w-2xl gap-2 md:grid-cols-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="glass rounded-xl p-3 text-left text-sm text-muted-foreground transition-transform hover:-translate-y-0.5 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${m.role === "assistant" ? "orb" : "bg-white/10"}`}>
                  {m.role === "assistant" ? <Sparkles className="size-4 text-primary-foreground" /> : <User className="size-4" />}
                </div>
                <div className={`glass max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === "user" ? "bg-white/10" : ""}`}>
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-pre:bg-black/30 prose-code:text-primary">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="orb flex size-8 shrink-0 items-center justify-center rounded-lg">
                  <Sparkles className="size-4 text-primary-foreground" />
                </div>
                <div className="glass flex items-center gap-2 rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" /> Thinking…
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="border-t border-white/5 bg-black/20 p-4"
        >
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aurora anything…"
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none ring-primary/40 focus:ring-2 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
