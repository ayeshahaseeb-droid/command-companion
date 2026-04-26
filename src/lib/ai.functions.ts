import { createServerFn } from "@tanstack/react-start";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

async function callGateway(body: Record<string, unknown>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
  if (!res.ok) {
    const t = await res.text();
    console.error("AI gateway error", res.status, t);
    throw new Error(`AI gateway error (${res.status})`);
  }
  return res.json();
}

// 1. Parse a natural-language command into a structured intent
export const parseCommand = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    if (!input?.text || typeof input.text !== "string") throw new Error("text required");
    if (input.text.length > 2000) throw new Error("text too long");
    return input;
  })
  .handler(async ({ data }) => {
    const tools = [
      {
        type: "function",
        function: {
          name: "execute_intent",
          description: "Return the user's intent as structured data.",
          parameters: {
            type: "object",
            properties: {
              kind: {
                type: "string",
                enum: ["email", "calendar", "reminder", "slack", "sheet", "note"],
                description: "The type of action the user wants to perform.",
              },
              summary: { type: "string", description: "One-line human summary, e.g. 'Email Sarah about lunch'." },
              params: {
                type: "object",
                description: "Action-specific fields. For email: to, subject, body. For calendar: title, when, attendees. For reminder: what, when. For slack: channel, body. For sheet: title, columns. For note: body.",
                additionalProperties: { type: "string" },
              },
            },
            required: ["kind", "summary", "params"],
            additionalProperties: false,
          },
        },
      },
    ];

    const json = await callGateway({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are Aurora, a productivity assistant. Convert the user's natural-language request into a structured intent by calling execute_intent. Always extract specific entities (people, times, channels, subjects). Use 'note' as a fallback when no other action fits.",
        },
        { role: "user", content: data.text },
      ],
      tools,
      tool_choice: { type: "function", function: { name: "execute_intent" } },
    });

    const call = json.choices?.[0]?.message?.tool_calls?.[0];
    if (!call) throw new Error("Could not parse intent");
    try {
      const args = JSON.parse(call.function.arguments);
      return { intent: args };
    } catch {
      throw new Error("Bad AI response");
    }
  });

// 2. Polish a raw transcript: punctuation, casing, filler removal, light grammar
export const polishTranscript = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    if (!input?.text || typeof input.text !== "string") throw new Error("text required");
    if (input.text.length > 5000) throw new Error("text too long");
    return input;
  })
  .handler(async ({ data }) => {
    const json = await callGateway({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You polish raw voice transcripts. Remove filler words (um, uh, like, you know). Add proper punctuation and capitalization. Fix obvious grammar mistakes. Preserve the speaker's voice and meaning exactly — do not rephrase, summarize, or add information. Return ONLY the cleaned text, no commentary.",
        },
        { role: "user", content: data.text },
      ],
    });
    const cleaned = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { cleaned };
  });

// 3. Streaming chat — returns the gateway stream directly
export const chatStream = createServerFn({ method: "POST" })
  .inputValidator((input: { messages: ChatMsg[] }) => {
    if (!Array.isArray(input?.messages)) throw new Error("messages required");
    if (input.messages.length > 50) throw new Error("too many messages");
    return input;
  })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is not configured");

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: true,
        messages: [
          {
            role: "system",
            content:
              "You are Aurora, a friendly and concise productivity assistant. Help the user think, draft, plan, and decide. Keep answers short unless they ask for depth. Use markdown for structure when helpful.",
          },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limited — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add funds in Settings → Workspace → Usage.");
    if (!res.ok || !res.body) throw new Error(`AI gateway error (${res.status})`);

    // Read entire stream and concatenate (server fn cannot stream; for true streaming use a server route)
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") break;
        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) full += delta;
        } catch {
          // partial line, push back
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
    return { reply: full };
  });
