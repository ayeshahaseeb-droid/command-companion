// Lightweight localStorage helpers + custom vocabulary cleaning

const FILLERS = ["um", "uh", "uhh", "umm", "er", "ah", "like", "you know", "i mean", "sort of", "kinda"];

export function cleanTranscript(input: string, vocab: { phrase: string; expansion: string }[] = []): string {
  if (!input) return "";
  let t = input.toLowerCase();
  // remove fillers
  for (const f of FILLERS) {
    t = t.replace(new RegExp(`(^|[^a-z])${f}([^a-z]|$)`, "gi"), "$1$2");
  }
  // collapse spaces
  t = t.replace(/\s+/g, " ").trim();
  // expand vocabulary
  for (const v of vocab) {
    if (!v.phrase) continue;
    t = t.replace(new RegExp(`\\b${escapeReg(v.phrase)}\\b`, "gi"), v.expansion);
  }
  // smart-case: capitalize sentences
  t = t.replace(/(^|[.!?]\s+)([a-z])/g, (_m, p1, p2) => p1 + p2.toUpperCase());
  // capitalize "I"
  t = t.replace(/\bi\b/g, "I");
  // ensure ending punctuation
  if (!/[.!?]$/.test(t)) t += ".";
  return t;
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
