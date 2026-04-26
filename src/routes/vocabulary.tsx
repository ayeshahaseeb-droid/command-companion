import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, BookText } from "lucide-react";
import { load, save } from "@/lib/aurora";

export const Route = createFileRoute("/vocabulary")({
  head: () => ({
    meta: [
      { title: "Vocabulary · Aurora.AI" },
      { name: "description", content: "Custom terms and shortcuts. Map phrases to expansions for faster dictation." },
    ],
  }),
  component: Vocabulary,
});

type Term = { phrase: string; expansion: string };

function Vocabulary() {
  const [terms, setTerms] = useState<Term[]>([]);
  const [phrase, setPhrase] = useState("");
  const [expansion, setExpansion] = useState("");

  useEffect(() => { setTerms(load<Term[]>("aurora.vocab", [])); }, []);

  const add = () => {
    if (!phrase.trim() || !expansion.trim()) return;
    const next = [{ phrase: phrase.trim(), expansion: expansion.trim() }, ...terms];
    setTerms(next); save("aurora.vocab", next); setPhrase(""); setExpansion("");
  };
  const remove = (p: string) => {
    const next = terms.filter((t) => t.phrase !== p); setTerms(next); save("aurora.vocab", next);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 pb-32 pt-12">
      <p className="text-sm text-muted-foreground">Vocabulary</p>
      <h1 className="font-display text-4xl font-semibold md:text-5xl">
        Speak in your <span className="text-gradient">own dialect.</span>
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Add jargon, acronyms or shortcuts. Aurora rewrites them in transcripts automatically.
      </p>

      <div className="glass-strong mt-10 rounded-3xl p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder='Phrase ("my calendar")' className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          <input value={expansion} onChange={(e) => setExpansion(e.target.value)} placeholder="Expansion (https://cal.com/me)" className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          <button onClick={add} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground">
            <Plus className="size-4" /> Add
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-2">
        {terms.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
            <BookText className="mx-auto mb-2 size-6 text-primary" />
            No custom vocabulary yet.
          </div>
        )}
        {terms.map((t) => (
          <div key={t.phrase} className="glass group flex items-center gap-3 rounded-2xl p-4">
            <span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs">{t.phrase}</span>
            <span className="text-muted-foreground">→</span>
            <span className="flex-1 truncate text-sm">{t.expansion}</span>
            <button onClick={() => remove(t.phrase)} className="rounded-md p-1.5 opacity-0 hover:bg-white/10 group-hover:opacity-100">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
