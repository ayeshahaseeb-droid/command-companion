import { createFileRoute, Link } from "@tanstack/react-router";
import { Mic, Wand2, Brain, GitBranch, ShieldCheck, Sparkles, Keyboard, Globe2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aurora.AI — Speak. Command. Done." },
      { name: "description", content: "Voice-first productivity: hold a hotkey, speak, and watch text, commands and workflows execute." },
      { property: "og:title", content: "Aurora.AI — Speak. Command. Done." },
      { property: "og:description", content: "Dictation, NL commands, workflows, memory — one floating glass widget." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Mic, title: "Hold-to-dictate", desc: "Press ⌘⇧V anywhere, speak, release. Auto-cleaned of fillers, punctuated, smart-cased." },
  { icon: Wand2, title: "Natural commands", desc: "“Email John I’ll be late.” Aurora parses intent, drafts, asks once, then ships." },
  { icon: Brain, title: "Context memory", desc: "Remembers your habits, schedule and recent threads — across every session." },
  { icon: GitBranch, title: "Cross-app workflows", desc: "Chain triggers and actions: when X happens → summarize → post to Slack." },
  { icon: Globe2, title: "Offline mode", desc: "On-device whisper falls back to cloud only when you allow it. Your voice, your rules." },
  { icon: ShieldCheck, title: "Private by design", desc: "30-day max retention, GDPR/CCPA delete-everything button, zero hidden uploads." },
];

function Landing() {
  return (
    <main className="relative">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" />
            New — Aurora 1.0 in private beta
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Speak it. <span className="text-gradient">Done.</span>
            <br />
            Your voice is the interface.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Aurora is a voice-first productivity OS. Dictate anywhere, fire natural-language commands,
            and orchestrate cross-app workflows — without lifting your hands from the keyboard.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/app"
              className="glow-ring rounded-2xl bg-gradient-to-r from-primary to-accent px-7 py-3.5 font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Open the studio
            </Link>
            <Link
              to="/pricing"
              className="glass rounded-2xl px-7 py-3.5 font-medium text-foreground transition-colors hover:bg-white/10"
            >
              See pricing
            </Link>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Keyboard className="size-3.5" />
            Try the global hotkey: <kbd className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">⌘ ⇧ V</kbd>
          </div>
        </div>

        {/* Hero orb */}
        <div className="relative mx-auto mt-20 flex max-w-3xl items-center justify-center">
          <div className="orb animate-pulse-glow animate-float-soft size-56 rounded-full md:size-72" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Mic className="size-16 text-primary-foreground md:size-20" />
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-14 max-w-2xl">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">
            Everything a keyboard can’t do, <span className="text-gradient">your voice can.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six pillars working in harmony, one floating widget that disappears when you don’t need it.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass group relative overflow-hidden rounded-3xl p-7 transition-transform hover:-translate-y-1">
              <div
                aria-hidden
                className="absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-60"
                style={{ background: "radial-gradient(circle, oklch(0.78 0.22 215), transparent 70%)" }}
              />
              <div className="orb mb-4 flex size-11 items-center justify-center rounded-xl">
                <f.icon className="size-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow band */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="glass-strong relative overflow-hidden rounded-[2.5rem] p-10 md:p-16">
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{ background: "radial-gradient(ellipse at 20% 0%, oklch(0.5 0.2 260 / 0.5), transparent 60%), radial-gradient(ellipse at 80% 100%, oklch(0.55 0.22 320 / 0.45), transparent 60%)" }}
          />
          <div className="relative grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-4xl font-semibold md:text-5xl">
                One sentence. <span className="text-gradient">Five apps.</span>
              </h2>
              <p className="mt-4 text-muted-foreground">
                "When I get an email with an attachment, save it to Drive, summarize with AI, post to #ops."
                Aurora wires it up — no Zaps, no glue code.
              </p>
              <Link
                to="/workflows"
                className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Build a workflow
              </Link>
            </div>
            <div className="space-y-3">
              {[
                "📧 New email with attachment",
                "💾 Save attachment → Drive",
                "🧠 Summarize with Aurora AI",
                "💬 Post summary to #ops",
                "✅ Log run in audit trail",
              ].map((s, i) => (
                <div key={s} className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-sm">
                  <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 pb-32 pt-10 text-center">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">
          Stop typing. <span className="text-gradient">Start shipping.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Aurora runs in the background, surfaces only when you summon it, and disappears the moment you’re done.
        </p>
        <Link
          to="/app"
          className="glow-ring mt-8 inline-flex rounded-2xl bg-gradient-to-r from-primary to-accent px-8 py-4 font-medium text-primary-foreground transition-transform hover:scale-105"
        >
          Launch the studio
        </Link>
      </section>
    </main>
  );
}
