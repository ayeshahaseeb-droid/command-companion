import { Link, useLocation } from "@tanstack/react-router";
import { Mic } from "lucide-react";

export function FloatingMic() {
  const loc = useLocation();
  if (loc.pathname === "/app") return null;
  return (
    <Link
      to="/app"
      className="orb animate-pulse-glow fixed bottom-6 right-6 z-50 flex size-16 items-center justify-center rounded-full text-primary-foreground"
      aria-label="Open dictation"
    >
      <Mic className="size-6" />
    </Link>
  );
}
