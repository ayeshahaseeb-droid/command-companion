import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Mail, Calendar, Bell, MessageSquare, FileSpreadsheet, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { parseCommand } from "@/lib/ai.functions";

export const Route = createFileRoute("/commands")({
  head: () => ({
    meta: [
      { title: "Commands · Aurora.AI" },
      { name: "description", content: "Type or speak natural-language commands. Aurora parses intent and confirms before acting." },
    ],
  }),
  component: Commands,
});

const examples = [
  { icon: Mail, label: "Send an email to John saying meeting at 3pm" },
  { icon: Calendar, label: "Create a calendar event tomorrow at 10 with the design team" },
  { icon: Bell, label: "Remind me to call Mom at 6pm" },
  { icon: MessageSquare, label: "Send a Slack message to #ops: deploy is green" },
  { icon: FileSpreadsheet, label: "Generate a spreadsheet of last week's expenses" },
];

type Intent = { kind: string; summary: string; params: Record<string, string> };

function Commands() {
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Intent | null>(null);
  const [log, setLog] = useState<{ id: string; intent: Intent; at: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const parseFn = useServerFn(parseCommand);

  const propose = async () => {
    if (!input.trim()) { toast.error("Tell me what to do."); return; }
    setLoading(true);
    try {
      const { intent } = await parseFn({ data: { text: input } });
      setPending(intent as Intent);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI parsing failed");
    } finally {
      setLoading(false);
    }
  };

  const confirm = () => {
    if (!pending) return;
    setLog([{ id: crypto.randomUUID(), intent: pending, at: Date.now() }, ...log]);
    toast.success(`Executed: ${pending.summary}`);
    setPending(null); setInput("");
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-32 pt-12">
      <p className="text-sm text-muted-foreground">Commands</p>
      <h1 className="font-display text-4xl font-semibold md:text-5xl">
        Tell Aurora what to <span className="text-gradient">do.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Aurora parses intent, shows you exactly what will happen, then asks for one tap to confirm.
      </p>

      <div className="glass-strong mt-10 rounded-3xl p-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder='Try: "Send an email to John saying meeting at 3pm"'
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-base outline-none ring-primary/40 focus:ring-2"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Sparkles className="size-3 text-primary" /> Powered by Aurora AI · confirms before executing.</p>
          <button onClick={propose} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            {loading ? "Thinking…" : "Propose"}
          </button>
        </div>

        {pending && (
          <div className="glass mt-4 rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Aurora plans to:</p>
            <h3 className="mt-1 text-lg font-semibold">{pending.summary}</h3>
            <pre className="glass mt-3 overflow-x-auto rounded-xl p-3 font-mono text-xs text-muted-foreground">
{JSON.stringify(pending, null, 2)}
            </pre>
            <div className="mt-4 flex gap-2">
              <button onClick={confirm} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground">
                <CheckCircle2 className="size-4" /> Confirm & run
              </button>
              <button onClick={() => setPending(null)} className="rounded-xl px-4 py-2 text-sm text-muted-foreground hover:bg-white/5">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold">Try one</h2>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {examples.map((e) => (
          <button
            key={e.label}
            onClick={() => setInput(e.label)}
            className="glass flex items-center gap-3 rounded-2xl p-4 text-left text-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="orb flex size-9 shrink-0 items-center justify-center rounded-lg">
              <e.icon className="size-4 text-primary-foreground" />
            </div>
            <span>{e.label}</span>
          </button>
        ))}
      </div>

      {log.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold">Audit trail</h2>
          <p className="text-xs text-muted-foreground">Every command is logged and reversible.</p>
          <div className="mt-3 space-y-2">
            {log.map((l) => (
              <div key={l.id} className="glass flex items-center gap-3 rounded-xl p-3 text-sm">
                <CheckCircle2 className="size-4 text-primary" />
                <span className="flex-1">{l.intent.summary}</span>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">{new Date(l.at).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
