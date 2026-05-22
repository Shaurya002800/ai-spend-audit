import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { runAudit, AuditInput } from "@/lib/audit-engine";
import { supabase } from "@/lib/supabase";
import { generateShareId } from "@/lib/utils";

// Initialize Anthropic only when needed (lazy loading)
let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropic = new Anthropic({
      apiKey,
    });
  }
  return anthropic;
}

// Rate limiting: simple in-memory store (use Redis/Upstash for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10;

  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

async function generateAISummary(
  input: AuditInput,
  result: ReturnType<typeof runAudit>
): Promise<string> {
  // Full prompt in PROMPTS.md
  const prompt = `You are a blunt, finance-literate AI spend advisor writing a 100-word personalized audit summary for a startup.

Context:
- Team size: ${input.teamSize} people
- Primary use case: ${input.useCase}
- Current monthly AI spend: $${result.totalCurrentSpend}
- Potential monthly savings: $${Math.round(result.totalMonthlySavings)}
- Top waste: ${result.summaryContext.topWaste}
- Key recommendation: ${result.summaryContext.topSwitch !== "none" ? result.summaryContext.topSwitch : "optimize current plans"}
- Number of tools audited: ${input.tools.length}

Write a 100-word personalized audit summary. Be specific about their situation. Mention the dollar amount. Don't be generic. Don't use bullet points. Write like a trusted CFO advisor, not a sales pitch. If savings are minimal, be honest about it — "you're spending well" is a valid conclusion. End with one concrete next step.`;

  const anthropic = getAnthropicClient();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type === "text") return content.text;
  throw new Error("Unexpected response type");
}

function generateFallbackSummary(
  input: AuditInput,
  result: ReturnType<typeof runAudit>
): string {
  if (result.isAlreadyOptimal) {
    return `Your team of ${input.teamSize} is spending $${result.totalCurrentSpend}/mo on AI tools — and doing it efficiently. We found less than $100/mo in potential savings, which means your stack is reasonably well-optimized for ${input.useCase} workflows. Keep monitoring as your team scales; the economics change when you cross 10+ seats on enterprise plans.`;
  }
  return `Your team of ${input.teamSize} is spending $${result.totalCurrentSpend}/mo on AI tools but could be spending $${Math.round(result.totalProjectedSpend)}/mo — a saving of $${Math.round(result.totalMonthlySavings)}/mo ($${Math.round(result.totalAnnualSavings)}/year). The biggest opportunity is ${result.summaryContext.topWaste}. Start there: it's the highest-impact change with lowest switching cost.`;
}

export async function POST(req: NextRequest) {
  try {
    // Honeypot check
    const body = await req.json();
    if (body._hp && body._hp !== "") {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }

    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded. Try again in an hour." }, { status: 429 });
    }

    const input: AuditInput = body.input;

    // Validate
    if (!input || !input.tools || input.tools.length === 0) {
      return NextResponse.json({ error: "No tools provided" }, { status: 400 });
    }

    // Run deterministic audit engine
    const result = runAudit(input);

    // Generate AI summary (with fallback)
    let aiSummary: string;
    try {
      aiSummary = await generateAISummary(input, result);
    } catch (err) {
      console.error("Anthropic API error:", err);
      aiSummary = generateFallbackSummary(input, result);
    }

    // Generate share ID
    const shareId = generateShareId();

    // Store in Supabase
    try {
      await supabase.from("audits").insert({
        share_id: shareId,
        audit_input: input as object,
        audit_result: result as object,
        ai_summary: aiSummary,
      });
    } catch (err) {
      console.error("Supabase insert error:", err);
      // Don't fail the request if storage fails
    }

    return NextResponse.json({
      result,
      aiSummary,
      shareId,
    });
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
