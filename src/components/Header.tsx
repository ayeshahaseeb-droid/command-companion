import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/app", label: "Dictate" },
  { to: "/commands", label: "Commands" },
  { to: "/chat", label: "Ask" },
  { to: "/workflows", label: "Workflows" },
  { to: "/memory", label: "Memory" },
  { to: "/vocabulary", label: "Vocabulary" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass flex items-center justify-between rounded-2xl px-5 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="orb relative flex size-8 items-center justify-center rounded-xl">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Aurora<span className="text-gradient">.AI</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                activeProps={{ className: "rounded-lg px-3 py-1.5 text-sm text-foreground bg-white/10" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <Link
            to="/app"
            className="rounded-xl bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground shadow-[0_0_20px_oklch(0.78_0.22_215/0.5)] transition-transform hover:scale-105"
          >
            Launch
          </Link>
        </div>
      </div>
    </header>
  );
}
