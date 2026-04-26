import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Brain, Plus, Trash2 } from "lucide-react";
import { load, save } from "@/lib/aurora";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Memory · Aurora.AI" },
      { name: "description", content: "Persistent context Aurora remembers about you — habits, schedule, preferences." },
    ],
  }),
  component: Memory,
});

type Note = { id: string; kind: "habit" | "fact" | "geo"; text: string; at: number };
const KINDS: Note["kind"][] = ["habit", "fact", "geo"];

function Memory() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [kind, setKind] = useState<Note["kind"]>("fact");

  useEffect(() => { setNotes(load<Note[]>("aurora.memory", [])); }, []);

  const add = () => {
    if (!text.trim()) return;
    const next = [{ id: crypto.randomUUID(), kind, text: text.trim(), at: Date.now() }, ...notes];
    setNotes(next); save("aurora.memory", next); setText("");
  };
  const remove = (id: string) => {
    const next = notes.filter((n) => n.id !== id); setNotes(next); save("aurora.memory", next);
  };
  const wipe = () => { setNotes([]); save("aurora.memory", []); };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-12">
      <p className="text-sm text-muted-foreground">Memory</p>
      <h1 className="font-display text-4xl font-semibold md:text-5xl">
        Aurora <span className="text-gradient">remembers.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Persistent notes Aurora carries across sessions. Used to personalize transcripts and commands.
      </p>

      <div className="glass-strong mt-10 rounded-3xl p-6">
        <div className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider transition-colors ${kind === k ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "glass text-muted-foreground"}`}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder='e.g. "Remind me to buy milk near a grocery store"'
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button onClick={add} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground">
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Stored memories</h2>
        {notes.length > 0 && (
          <button onClick={wipe} className="text-xs text-muted-foreground hover:text-destructive-foreground">
            Delete all (GDPR)
          </button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {notes.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            <Brain className="mx-auto mb-2 size-6 text-primary" />
            No memories yet. Add a habit, fact, or geofence trigger.
          </div>
        )}
        {notes.map((n) => (
          <div key={n.id} className="glass group flex items-start gap-3 rounded-2xl p-4">
            <span className="orb mt-1 inline-flex rounded-md px-2 py-0.5 font-mono text-[10px] uppercase text-primary-foreground">
              {n.kind}
            </span>
            <div className="flex-1">
              <p className="text-sm">{n.text}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase text-muted-foreground">{new Date(n.at).toLocaleString()}</p>
            </div>
            <button onClick={() => remove(n.id)} className="rounded-md p-1.5 opacity-0 hover:bg-white/10 group-hover:opacity-100">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
