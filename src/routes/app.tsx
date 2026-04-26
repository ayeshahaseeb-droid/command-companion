import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Trash2, Copy, Download, Sparkles, Keyboard, Wand2, Loader2 } from "lucide-react";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/speech";
import { cleanTranscript, load, save } from "@/lib/aurora";
import { polishTranscript } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Studio · Aurora.AI" },
      { name: "description", content: "Hold the hotkey, speak, and watch Aurora transcribe and clean it instantly." },
    ],
  }),
  component: Studio,
});

type HistoryItem = { id: string; text: string; at: number };

function Studio() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [final, setFinal] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [vocab, setVocab] = useState<{ phrase: string; expansion: string }[]>([]);
  const [aiCleaned, setAiCleaned] = useState("");
  const [polishing, setPolishing] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const startedRef = useRef(false);
  const polishFn = useServerFn(polishTranscript);

  useEffect(() => {
    setHistory(load<HistoryItem[]>("aurora.history", []));
    setVocab(load("aurora.vocab", []));
  }, []);

  const stop = useCallback(() => {
    const r = recRef.current;
    if (r && startedRef.current) {
      try { r.stop(); } catch {/* noop */}
    }
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const rec = getSpeechRecognition();
    if (!rec) { setSupported(false); toast.error("Voice not supported in this browser. Try Chrome or Edge."); return; }
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let interimTxt = "";
      let finalTxt = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalTxt += r[0].transcript + " ";
        else interimTxt += r[0].transcript;
      }
      if (interimTxt) setInterim(interimTxt);
      if (finalTxt) {
        setInterim("");
        setFinal((prev) => (prev + " " + finalTxt).trim());
      }
    };
    rec.onerror = (ev) => {
      if (ev.error === "not-allowed") toast.error("Microphone access denied.");
      else if (ev.error !== "aborted" && ev.error !== "no-speech") toast.error(`Voice error: ${ev.error}`);
    };
    rec.onend = () => { startedRef.current = false; setListening(false); };
    rec.onstart = () => { startedRef.current = true; setListening(true); };
    recRef.current = rec;
    try { rec.start(); } catch {/* already started */}
  }, []);

  // Global hotkey ⌘/Ctrl + Shift + V (toggle)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.shiftKey && e.code === "KeyV") {
        e.preventDefault();
        if (startedRef.current) stop(); else start();
      }
      if (e.code === "Escape" && startedRef.current) stop();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, stop]);

  const commit = () => {
    const cleaned = aiCleaned || cleanTranscript(final, vocab);
    if (!cleaned) return;
    const next = [{ id: crypto.randomUUID(), text: cleaned, at: Date.now() }, ...history].slice(0, 50);
    setHistory(next);
    save("aurora.history", next);
    setFinal("");
    setInterim("");
    setAiCleaned("");
    toast.success("Transcript saved");
  };

  const clearAll = () => { setFinal(""); setInterim(""); setAiCleaned(""); };
  const polishWithAI = async () => {
    const src = (final + " " + interim).trim();
    if (!src) { toast.error("Nothing to polish yet."); return; }
    setPolishing(true);
    try {
      const { cleaned } = await polishFn({ data: { text: src } });
      setAiCleaned(cleaned);
      toast.success("Polished by Aurora AI");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI polish failed");
    } finally {
      setPolishing(false);
    }
  };
  const copyOne = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };
  const removeOne = (id: string) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next); save("aurora.history", next);
  };
  const exportAll = () => {
    const blob = new Blob([history.map((h) => `# ${new Date(h.at).toLocaleString()}\n${h.text}\n`).join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "aurora-transcripts.md"; a.click();
    URL.revokeObjectURL(url);
  };

  const cleanedPreview = aiCleaned || cleanTranscript((final + " " + interim).trim(), vocab);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-12">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Studio</p>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">
            Hold, speak, <span className="text-gradient">ship.</span>
          </h1>
        </div>
        <div className="hidden text-right text-xs text-muted-foreground md:block">
          <div className="flex items-center gap-1.5"><Keyboard className="size-3.5" /> Toggle: <kbd className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono">⌘ ⇧ V</kbd></div>
          <div className="mt-1">Esc to stop</div>
        </div>
      </div>

      {/* Mic stage */}
      <div className="glass-strong relative overflow-hidden rounded-[2rem] p-8 md:p-12">
        <div
          aria-hidden
          className="absolute inset-0 opacity-50"
          style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.5 0.2 260 / 0.4), transparent 60%)" }}
        />
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => (listening ? stop() : start())}
            disabled={!supported}
            aria-label={listening ? "Stop listening" : "Start listening"}
            className={`orb relative flex size-40 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-105 ${listening ? "animate-pulse-glow" : ""} ${!supported ? "opacity-50" : ""}`}
          >
            {listening ? <MicOff className="size-12" /> : <Mic className="size-12" />}
          </button>

          {/* Waveform */}
          <div className="mt-6 flex h-10 items-end gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <span
                key={i}
                className={`w-1.5 rounded-full bg-gradient-to-t from-primary to-accent ${listening ? "animate-wave" : "h-1"}`}
                style={{ animationDelay: `${i * 60}ms`, height: listening ? "100%" : "4px" }}
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {!supported ? "Browser doesn't support voice. Try Chrome." : listening ? "Listening — press ⌘⇧V or Esc to stop" : "Press the orb or ⌘⇧V to start"}
          </p>
        </div>

        {/* Transcript */}
        <div className="relative mt-10 grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Raw</h3>
              <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
            </div>
            <p className="min-h-[7rem] whitespace-pre-wrap text-base leading-relaxed">
              {final || <span className="text-muted-foreground">Your words appear here…</span>}
              {interim && <span className="text-muted-foreground"> {interim}</span>}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> {aiCleaned ? "AI polished" : "Cleaned"}
              </h3>
              <div className="flex gap-2">
                <button onClick={polishWithAI} disabled={polishing || !final.trim()} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-30" title="Polish with Aurora AI">
                  {polishing ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                  AI
                </button>
                <button onClick={() => copyOne(cleanedPreview)} disabled={!cleanedPreview} className="rounded-md p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground disabled:opacity-30">
                  <Copy className="size-3.5" />
                </button>
                <button onClick={commit} disabled={!final.trim()} className="rounded-md bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40">
                  Save
                </button>
              </div>
            </div>
            <p className="min-h-[7rem] whitespace-pre-wrap text-base leading-relaxed">
              {cleanedPreview || <span className="text-muted-foreground">Polished output appears here…</span>}
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">History</h2>
          <div className="flex gap-2">
            <button onClick={exportAll} disabled={!history.length} className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs hover:bg-white/10 disabled:opacity-40">
              <Download className="size-3.5" /> Export
            </button>
            <button
              onClick={() => { setHistory([]); save("aurora.history", []); toast.success("Cleared"); }}
              disabled={!history.length}
              className="glass inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs text-destructive-foreground hover:bg-white/10 disabled:opacity-40"
            >
              <Trash2 className="size-3.5" /> Wipe
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {history.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              Nothing yet. Saved transcripts will appear here.
            </div>
          )}
          {history.map((h) => (
            <div key={h.id} className="glass group flex items-start gap-4 rounded-2xl p-4">
              <div className="orb mt-1 size-2 rounded-full" />
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{h.text}</p>
                <p className="mt-1 font-mono text-[10px] uppercase text-muted-foreground">{new Date(h.at).toLocaleString()}</p>
              </div>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => copyOne(h.text)} className="rounded-md p-1.5 hover:bg-white/10"><Copy className="size-3.5" /></button>
                <button onClick={() => removeOne(h.id)} className="rounded-md p-1.5 hover:bg-white/10"><Trash2 className="size-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
