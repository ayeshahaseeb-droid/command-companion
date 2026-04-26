export function AuroraBg() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="animate-drift absolute -left-32 top-10 size-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.25 220), transparent 70%)" }}
      />
      <div
        className="animate-drift absolute -right-32 top-1/3 size-[520px] rounded-full opacity-40 blur-3xl"
        style={{ animationDelay: "-6s", background: "radial-gradient(circle, oklch(0.55 0.25 320), transparent 70%)" }}
      />
      <div
        className="animate-drift absolute bottom-0 left-1/3 size-[420px] rounded-full opacity-30 blur-3xl"
        style={{ animationDelay: "-12s", background: "radial-gradient(circle, oklch(0.6 0.22 280), transparent 70%)" }}
      />
    </div>
  );
}
