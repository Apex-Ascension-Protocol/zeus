import { NextRequest } from "next/server";

/**
 * ZEUS AI proxy → OpenRouter (streaming).
 *
 * Keeps the API key on the server and streams plain-text tokens back to the
 * client. The client sends { messages, context }; we inject `context`
 * (the live simulator state) into the system prompt so the model can
 * summarise / answer questions grounded in the current scenario.
 *
 * Env vars (set in .env.local):
 *   OPENROUTER_API_KEY   – required
 *   OPENROUTER_MODEL     – optional, defaults to the free router
 */

// `openrouter/free` auto-selects an available free model, so the app keeps
// working even when a specific ":free" model gets rotated out. Override with
// e.g. "deepseek/deepseek-chat:free" or "meta-llama/llama-3.3-70b-instruct:free".
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

type ChatMsg = { role: "user" | "assistant"; content: string };

const SYSTEM_PROMPT = `You are ZEUS Analyst, an assistant embedded in an EV-grid stress simulator for Ontario electricity distribution feeders.

The user adjusts macro variables (gas price, affordable EV price, adoption velocity, carbon levy, charging ports per 1K EVs) and the model projects 5-year capacity utilisation for each feeder. Utilisation thresholds: >=85% is CRITICAL, 75-84% HIGH, 65-74% MODERATE, below 65% LOW. The 80% line is the operational risk threshold.

Your job:
- Summarise the current scenario clearly and concisely.
- Answer questions about which feeders/regions are most at risk and why, grounded ONLY in the scenario data provided below.
- When relevant, connect input changes to the projected outcomes (e.g. higher gas price + faster adoption → more load → higher utilisation).
- Be concise and direct. Use short paragraphs or tight bullet lists. No preamble like "Certainly!".
- These are MODEL projections, not guarantees. Don't invent numbers that aren't in the data.
- IMPORTANT: The user can change the sliders between messages. Earlier answers in this conversation may describe an OLD scenario. Always treat the "LIVE SCENARIO STATE" block below as the single source of truth and answer about THOSE numbers, even if they differ from what you said earlier.`;

export async function POST(req: NextRequest) {
  let body: { messages?: ChatMsg[]; context?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { messages, context } = body;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "OPENROUTER_API_KEY is not configured on the server." },
      { status: 500 },
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "No messages provided." }, { status: 400 });
  }

  const system =
    SYSTEM_PROMPT +
    (context ? `\n\n=== LIVE SCENARIO STATE ===\n${context}` : "");

  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional but recommended by OpenRouter for attribution / rankings:
        "HTTP-Referer": "https://zeus.local",
        "X-Title": "ZEUS Simulator",
      },
      body: JSON.stringify({
        model: MODEL,
        stream: true,
        temperature: 0.4,
        max_tokens: 800,
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
  } catch {
    return Response.json(
      { error: "Could not reach OpenRouter." },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    const status = upstream.status || 502;
    const msg =
      status === 429
        ? "Rate limited by OpenRouter free tier (20 req/min, 200/day). Try again shortly."
        : `OpenRouter error (${status}): ${detail.slice(0, 300)}`;
    return Response.json({ error: msg }, { status });
  }

  // Transform OpenRouter's SSE into a plain-text token stream.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      // Some free models stream "reasoning" tokens separately from the answer.
      // We wrap those in <think>…</think> so the client can show them as a
      // collapsible thought process.
      let inReasoning = false;
      const closeThink = () => {
        if (inReasoning) {
          controller.enqueue(encoder.encode("</think>"));
          inReasoning = false;
        }
      };
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? ""; // keep the trailing partial line

          for (const line of lines) {
            const trimmed = line.trim();
            // OpenRouter sends ": ..." keep-alive comments; skip non-data lines.
            if (!trimmed.startsWith("data:")) continue;

            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              closeThink();
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta ?? {};
              const reasoning: string | undefined =
                delta.reasoning ?? delta.reasoning_content;
              const content: string | undefined = delta.content;

              if (reasoning) {
                if (!inReasoning) {
                  controller.enqueue(encoder.encode("<think>"));
                  inReasoning = true;
                }
                controller.enqueue(encoder.encode(reasoning));
              }
              if (content) {
                closeThink(); // reasoning is done once the answer begins
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // Ignore unparsable / partial chunks.
            }
          }
        }
      } catch (err) {
        controller.error(err);
        return;
      }
      closeThink();
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
