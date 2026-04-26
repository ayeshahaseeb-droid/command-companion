import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GitBranch, Plus, Play, Trash2, Zap } from "lucide-react";
import { load, save } from "@/lib/aurora";
import { toast } from "sonner";

export const Route = createFileRoute("/workflows")({
  head: () => ({
    meta: [
      { title: "Workflows · Aurora.AI" },
      { name: "description", content: "Chain triggers and actions across apps. Aurora wires it up." },
    ],
  }),
  component: Workflows,
});

type Step = { id: string; label: string };
type Workflow = { id: string; name: string; trigger: string; steps: Step[]; runs: number };

const presets: Omit<Workflow, "id" | "runs">[] = [
  { name: "Email digest", trigger: "Email arrives with attachment", steps: [
    { id: "1", label: "Save attachment to Drive" },
    { id: "2", label: "Summarize with Aurora AI" },
    { id: "3", label: "Post summary to #ops" },
  ]},
  { name: "Daily standup", trigger: "Every weekday at 9:00", steps: [
    { id: "1", label: "Pull yesterday's commits" },
    { id: "2", label: "Draft standup notes" },
    { id: "3", label: "Send to #standup" },
  ]},
];

function Workflows() {
  const [items, setItems] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [stepText, setStepText] = useState("");
  const [draftSteps, setDraftSteps] = useState<Step[]>([]);

  useEffect(() => { setItems(load<Workflow[]>("aurora.workflows", [])); }, []);

  const addStep = () => {
    if (!stepText.trim()) return;
    setDraftSteps([...draftSteps, { id: crypto.randomUUID(), label: stepText.trim() }]);
    setStepText("");
  };
  const create = (preset?: Omit<Workflow, "id" | "runs">) => {
    const wf: Workflow = preset
      ? { ...preset, id: crypto.randomUUID(), runs: 0 }
      : { id: crypto.randomUUID(), name: name || "Untitled", trigger: trigger || "Manual", steps: draftSteps, runs: 0 };
    if (!preset && draftSteps.length === 0) { toast.error("Add at least one step"); return; }
    const next = [wf, ...items];
    setItems(next); save("aurora.workflows", next);
    setName(""); setTrigger(""); setDraftSteps([]);
    toast.success("Workflow created");
  };
  const run = (id: string) => {
    const next = items.map((w) => w.id === id ? { ...w, runs: w.runs + 1 } : w);
    setItems(next); save("aurora.workflows", next);
    toast.success("Workflow executed");
  };
  const remove = (id: string) => {
    const next = items.filter((w) => w.id !== id);
    setItems(next); save("aurora.workflows", next);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-12">
      <p className="text-sm text-muted-foreground">Workflows</p>
      <h1 className="font-display text-4xl font-semibold md:text-5xl">
        Wire your <span className="text-gradient">whole stack.</span>
      </h1>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Builder */}
        <div className="glass-strong rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold">New workflow</h2>
          <div className="mt-4 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={trigger} onChange={(e) => setTrigger(e.target.value)} placeholder="Trigger (e.g. New email with attachment)" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <div className="flex gap-2">
              <input value={stepText} onChange={(e) => setStepText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStep()} placeholder="Add a step…" className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={addStep} className="rounded-xl glass px-3 py-2.5 text-sm hover:bg-white/10"><Plus className="size-4" /></button>
            </div>
            {draftSteps.length > 0 && (
              <div className="space-y-1.5">
                {draftSteps.map((s, i) => (
                  <div key={s.id} className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                    <span className="font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{s.label}</span>
                    <button onClick={() => setDraftSteps(draftSteps.filter((x) => x.id !== s.id))} className="text-muted-foreground hover:text-destructive-foreground"><Trash2 className="size-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => create()} className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-medium text-primary-foreground">
              Create workflow
            </button>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Or start from a preset</p>
            {presets.map((p) => (
              <button key={p.name} onClick={() => create(p)} className="glass w-full rounded-xl p-3 text-left text-sm hover:bg-white/10">
                <div className="flex items-center gap-2"><Zap className="size-3.5 text-primary" /> {p.name}</div>
                <p className="mt-1 text-xs text-muted-foreground">{p.trigger} → {p.steps.length} steps</p>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div>
          <h2 className="font-display text-lg font-semibold">Your workflows</h2>
          <div className="mt-3 space-y-3">
            {items.length === 0 && (
              <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
                <GitBranch className="mx-auto mb-2 size-6 text-primary" />
                No workflows yet — create one or pick a preset.
              </div>
            )}
            {items.map((w) => (
              <div key={w.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">{w.name}</h3>
                    <p className="text-xs text-muted-foreground">Trigger · {w.trigger}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => run(w.id)} className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground">
                      <Play className="size-3" /> Run
                    </button>
                    <button onClick={() => remove(w.id)} className="rounded-lg p-1.5 hover:bg-white/10"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {w.steps.map((s, i) => (
                    <div key={s.id} className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs">
                      <span className="font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                      {s.label}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[10px] font-mono uppercase text-muted-foreground">Runs: {w.runs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
