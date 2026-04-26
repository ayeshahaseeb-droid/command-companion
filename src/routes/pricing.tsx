import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing · Aurora.AI" },
      { name: "description", content: "Free, Pro and Team plans. Pay-as-you-go developer API." },
    ],
  }),
  component: Pricing,
});

const tiers = [
  { name: "Free", price: "$0", suffix: "/forever", features: ["500 commands / month", "Voice dictation", "Local memory", "Community support"], cta: "Start free", highlight: false },
  { name: "Pro", price: "$9.99", suffix: "/mo", features: ["Unlimited commands", "Cross-app workflows", "Cloud sync + history", "Custom vocabulary", "Priority support"], cta: "Go Pro", highlight: true },
  { name: "Team", price: "$29.99", suffix: "/mo per seat", features: ["Everything in Pro", "Shared workflows", "Audit trail + SSO", "Realtime collaboration", "Dedicated success manager"], cta: "Talk to sales", highlight: false },
];

function Pricing() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-32 pt-12">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Pricing</p>
        <h1 className="font-display text-5xl font-semibold md:text-6xl">
          Simple, <span className="text-gradient">scale-friendly.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Start free. Upgrade when your voice becomes your most-used keyboard shortcut.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`glass-strong relative rounded-3xl p-8 ${t.highlight ? "glow-ring border border-primary/40" : ""}`}
          >
            {t.highlight && (
              <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-primary-foreground">
                <Sparkles className="size-3" /> Most popular
              </div>
            )}
            <h3 className="font-display text-2xl font-semibold">{t.name}</h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold">{t.price}</span>
              <span className="text-sm text-muted-foreground">{t.suffix}</span>
            </div>
            <Link
              to="/app"
              className={`mt-6 block rounded-xl px-4 py-2.5 text-center text-sm font-medium ${t.highlight ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "glass hover:bg-white/10"}`}
            >
              {t.cta}
            </Link>
            <ul className="mt-6 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass mx-auto mt-16 max-w-3xl rounded-3xl p-6 text-center">
        <h3 className="font-display text-xl font-semibold">Developer API</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Pay-per-use access to Aurora's intent parser, transcription cleanup and workflow runner.
          Audit trail included.
        </p>
      </div>
    </main>
  );
}
