import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { FloatingMic } from "@/components/FloatingMic";
import { AuroraBg } from "@/components/AuroraBg";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-3xl p-10 text-center">
        <h1 className="text-gradient text-7xl font-bold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Lost in the aurora</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page slipped through the void.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Aurora.AI — Voice productivity, reimagined" },
      { name: "description", content: "Aurora.AI is a voice-first productivity assistant: dictation, natural-language commands, workflows and memory." },
      { name: "author", content: "Aurora" },
      { property: "og:title", content: "Aurora.AI — Voice productivity, reimagined" },
      { property: "og:description", content: "Dictation, natural-language commands, workflows and memory — all in one minimal floating widget." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AuroraBg />
      <Header />
      <Outlet />
      <FloatingMic />
      <Toaster />
    </>
  );
}
