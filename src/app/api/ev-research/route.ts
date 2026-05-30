import { NextRequest, NextResponse } from "next/server";
import { buildResearch, type Scenario } from "../../lib/ev-news";

/**
 * ────────────────────────────────────────────────────────────
 *  ZEUS · EV RESEARCH ENDPOINT  (free version)
 *  POST /api/ev-research   body: { scenario?: Scenario }
 *
 *  No API key, no billing. Pulls free Google News RSS headlines
 *  and classifies them with the rule-based engine in lib/ev-news.
 * ────────────────────────────────────────────────────────────
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID: Scenario[] = ["conservative", "base", "accelerated"];

export async function POST(req: NextRequest) {
  let scenario: Scenario = "base";
  try {
    const body = await req.json();
    if (body?.scenario && VALID.includes(body.scenario)) scenario = body.scenario;
  } catch {
    /* empty body is fine */
  }

  try {
    const research = await buildResearch(scenario);
    return NextResponse.json(research, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "AbortError"
        ? "The news feed timed out. Try again."
        : err instanceof Error
        ? err.message
        : "Could not load news.";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
