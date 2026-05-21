// AI Spend Audit Engine
// All pricing data is sourced from official vendor pages (see PRICING_DATA.md)
// Logic is deterministic - no AI used here intentionally (AI is for summaries only)

export type UseCaseType = "coding" | "writing" | "data" | "research" | "mixed";

export type ToolId =
  | "cursor"
  | "github_copilot"
  | "claude"
  | "chatgpt"
  | "anthropic_api"
  | "openai_api"
  | "gemini"
  | "windsurf";

export interface ToolEntry {
  toolId: ToolId;
  plan: string;
  monthlySpend: number; // what they say they pay
  seats: number;
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  useCase: UseCaseType;
}

export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  recommendedAction: "downgrade" | "switch" | "keep" | "eliminate";
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedSpend: number;
  monthlySavings: number;
  reason: string;
  credexApplicable: boolean; // can Credex credits help here?
}

export interface AuditResult {
  recommendations: ToolRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  totalCurrentSpend: number;
  totalProjectedSpend: number;
  isHighSavings: boolean; // >$500/mo
  isAlreadyOptimal: boolean; // <$100/mo savings
  summaryContext: SummaryContext;
}

export interface SummaryContext {
  teamSize: number;
  useCase: UseCaseType;
  topWaste: string;
  topSwitch: string;
}

// ─── Pricing Data (verified against official pages, May 2026) ───────────────

interface PlanPrice {
  name: string;
  pricePerSeatPerMonth: number;
  minSeats?: number;
  maxSeats?: number;
  notes?: string;
}

const PRICING: Record<ToolId, PlanPrice[]> = {
  cursor: [
    { name: "Hobby", pricePerSeatPerMonth: 0, notes: "Free, 2000 completions/mo" },
    { name: "Pro", pricePerSeatPerMonth: 20 },
    { name: "Business", pricePerSeatPerMonth: 40 },
    { name: "Enterprise", pricePerSeatPerMonth: 100, notes: "Custom, estimate" },
  ],
  github_copilot: [
    { name: "Individual", pricePerSeatPerMonth: 10 },
    { name: "Business", pricePerSeatPerMonth: 19 },
    { name: "Enterprise", pricePerSeatPerMonth: 39 },
  ],
  claude: [
    { name: "Free", pricePerSeatPerMonth: 0 },
    { name: "Pro", pricePerSeatPerMonth: 20 },
    { name: "Max (5x)", pricePerSeatPerMonth: 100 },
    { name: "Max (20x)", pricePerSeatPerMonth: 200 },
    { name: "Team", pricePerSeatPerMonth: 30, minSeats: 5 },
    { name: "Enterprise", pricePerSeatPerMonth: 60, minSeats: 10, notes: "Custom, estimate" },
    { name: "API direct", pricePerSeatPerMonth: 0, notes: "Usage-based" },
  ],
  chatgpt: [
    { name: "Free", pricePerSeatPerMonth: 0 },
    { name: "Plus", pricePerSeatPerMonth: 20 },
    { name: "Pro", pricePerSeatPerMonth: 200 },
    { name: "Team", pricePerSeatPerMonth: 30, minSeats: 2 },
    { name: "Enterprise", pricePerSeatPerMonth: 60, minSeats: 10, notes: "Custom, estimate" },
    { name: "API direct", pricePerSeatPerMonth: 0, notes: "Usage-based" },
  ],
  anthropic_api: [
    { name: "Pay-as-you-go", pricePerSeatPerMonth: 0, notes: "Usage-based" },
    { name: "Usage-based", pricePerSeatPerMonth: 0, notes: "Usage-based" },
  ],
  openai_api: [
    { name: "Pay-as-you-go", pricePerSeatPerMonth: 0, notes: "Usage-based" },
    { name: "Usage-based", pricePerSeatPerMonth: 0, notes: "Usage-based" },
  ],
  gemini: [
    { name: "Free", pricePerSeatPerMonth: 0 },
    { name: "Advanced (1.5 Pro)", pricePerSeatPerMonth: 20 },
    { name: "Business", pricePerSeatPerMonth: 24 },
    { name: "API", pricePerSeatPerMonth: 0, notes: "Usage-based" },
  ],
  windsurf: [
    { name: "Free", pricePerSeatPerMonth: 0 },
    { name: "Pro", pricePerSeatPerMonth: 15 },
    { name: "Teams", pricePerSeatPerMonth: 35 },
  ],
};

export const TOOL_NAMES: Record<ToolId, string> = {
  cursor: "Cursor",
  github_copilot: "GitHub Copilot",
  claude: "Claude",
  chatgpt: "ChatGPT",
  anthropic_api: "Anthropic API",
  openai_api: "OpenAI API",
  gemini: "Gemini",
  windsurf: "Windsurf",
};

export function getToolPlans(toolId: ToolId): string[] {
  return PRICING[toolId].map((p) => p.name);
}

// ─── Audit Logic ─────────────────────────────────────────────────────────────

function getExpectedSpend(toolId: ToolId, planName: string, seats: number): number {
  const plans = PRICING[toolId];
  const plan = plans.find((p) => p.name === planName);
  if (!plan) return 0;
  return plan.pricePerSeatPerMonth * seats;
}

function evaluateTool(entry: ToolEntry, teamSize: number, useCase: UseCaseType): ToolRecommendation {
  const { toolId, plan, monthlySpend, seats } = entry;
  const toolName = TOOL_NAMES[toolId];

  // Check if they're overpaying vs expected price
  const expectedSpend = getExpectedSpend(toolId, plan, seats);

  // ─── Cursor ───
  if (toolId === "cursor") {
    // Business for small teams: if <5 devs, Pro is sufficient for most use cases
    if (plan === "Business" && seats < 5) {
      const savings = (40 - 20) * seats;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Pro",
        projectedSpend: 20 * seats, monthlySavings: savings,
        reason: `Business plan adds admin controls and SSO — unnecessary for teams under 5. Pro gives the same AI features at $20/seat.`,
        credexApplicable: true,
      };
    }
    // Enterprise overkill for <20 seats
    if (plan === "Enterprise" && seats < 20) {
      const savings = (100 - 40) * seats;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Business",
        projectedSpend: 40 * seats, monthlySavings: savings,
        reason: `Enterprise tier is for large orgs with compliance requirements. Business plan covers all AI features for teams under 20.`,
        credexApplicable: true,
      };
    }
    // If use case is writing/research (not coding), Cursor is overkill
    if ((useCase === "writing" || useCase === "research") && plan !== "Hobby") {
      const savings = monthlySpend;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "switch", recommendedTool: "Claude Pro",
        projectedSpend: 20 * seats, monthlySavings: Math.max(0, savings - 20 * seats),
        reason: `Cursor is a code editor — its AI features are optimized for coding. For ${useCase} workflows, Claude Pro or ChatGPT are more capable and cheaper.`,
        credexApplicable: false,
      };
    }
    // Paying retail when Credex can help
    if ((plan === "Pro" || plan === "Business") && monthlySpend > 100) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "keep", projectedSpend: monthlySpend * 0.75,
        monthlySavings: monthlySpend * 0.25,
        reason: `You're on the right plan. Credex sources Cursor credits at 20–30% discount from companies that overforecast. At your spend, that's real money.`,
        credexApplicable: true,
      };
    }
  }

  // ─── GitHub Copilot ───
  if (toolId === "github_copilot") {
    if (plan === "Enterprise" && seats < 10) {
      const savings = (39 - 19) * seats;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Business",
        projectedSpend: 19 * seats, monthlySavings: savings,
        reason: `Copilot Enterprise adds fine-tuned models on your codebase and Bing search integration — features that require IT setup and only pay off at 10+ engineers. Business covers AI completions fully.`,
        credexApplicable: true,
      };
    }
    if (useCase === "coding" && plan === "Business") {
      // Suggest Cursor as a better coding alternative if team is small
      if (seats <= 5) {
        const cursorCost = 20 * seats;
        const currentCost = 19 * seats;
        if (cursorCost > currentCost) {
          return {
            toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
            recommendedAction: "keep",
            projectedSpend: monthlySpend, monthlySavings: 0,
            reason: `GitHub Copilot Business at $19/seat is actually the most cost-efficient coding AI for small teams. You're spending well here.`,
            credexApplicable: false,
          };
        }
      }
    }
    // Individual plan for multiple users: should be on Business
    if (plan === "Individual" && seats > 1) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "keep",
        projectedSpend: monthlySpend, monthlySavings: 0,
        reason: `Individual plan doesn't support true team management. At ${seats} users, Business ($19/seat) gives you admin controls and policy management — and isn't much more expensive.`,
        credexApplicable: false,
      };
    }
  }

  // ─── Claude ───
  if (toolId === "claude") {
    // Max plan: only justified for very heavy users
    if ((plan === "Max (5x)" || plan === "Max (20x)") && seats > 1) {
      const proPlan = 20 * seats;
      const savings = monthlySpend - proPlan;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Pro",
        projectedSpend: proPlan, monthlySavings: savings,
        reason: `Max plans are for power users who hit Pro limits daily (researchers, heavy writers). For a team of ${seats}, Pro ($20/seat) covers most usage patterns. Monitor limits for 2 weeks before upgrading.`,
        credexApplicable: true,
      };
    }
    // Team plan with fewer than 5 people: minimum billing kicks in
    if (plan === "Team" && seats < 5) {
      const actualBilled = 30 * 5; // minimum 5 seats
      const proCost = 20 * seats;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Pro (individual seats)",
        projectedSpend: proCost, monthlySavings: Math.max(0, actualBilled - proCost),
        reason: `Claude Team has a 5-seat minimum — you're paying for ${5 - seats} phantom seats. Individual Pro at $20/seat is cheaper until you hit 5 people.`,
        credexApplicable: false,
      };
    }
    if (plan === "API direct") {
      // API usage: check if they'd be better on a flat plan
      if (monthlySpend > 60 && seats <= 3) {
        return {
          toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
          recommendedAction: "downgrade", recommendedPlan: "Pro",
          projectedSpend: 20 * seats, monthlySavings: monthlySpend - 20 * seats,
          reason: `At $${monthlySpend}/mo on API, switching ${seats} user(s) to Pro ($20/seat flat) saves money and removes rate limit anxiety. API is cheaper only at very high volume or when building products.`,
          credexApplicable: true,
        };
      }
    }
    // Enterprise at small scale
    if (plan === "Enterprise" && seats < 10) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Team",
        projectedSpend: 30 * Math.max(seats, 5), monthlySavings: Math.max(0, monthlySpend - 30 * Math.max(seats, 5)),
        reason: `Enterprise tier includes SSO, audit logs, and custom data retention — compliance features you don't need under 10 people. Team plan covers the same AI capabilities.`,
        credexApplicable: true,
      };
    }
  }

  // ─── ChatGPT ───
  if (toolId === "chatgpt") {
    if (plan === "Pro" && seats > 1) {
      // Pro is $200/seat — only justified for individual power users
      const teamCost = 30 * seats;
      const savings = 200 * seats - teamCost;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Team",
        projectedSpend: teamCost, monthlySavings: savings,
        reason: `ChatGPT Pro ($200/seat) is designed for individual heavy users needing maximum o1 access. Team plan at $30/seat gives GPT-4o + o1 access sufficient for most business workflows.`,
        credexApplicable: true,
      };
    }
    if (plan === "Enterprise" && seats < 10) {
      const teamCost = 30 * Math.max(seats, 2);
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Team",
        projectedSpend: teamCost, monthlySavings: Math.max(0, monthlySpend - teamCost),
        reason: `Enterprise adds SCIM, custom data retention, and expanded context for compliance — features with a real cost that small teams don't need. Team plan has the same model access.`,
        credexApplicable: true,
      };
    }
    // Overlap with Claude
    if ((useCase === "coding") && plan === "Plus") {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "switch", recommendedTool: "Cursor Pro or GitHub Copilot",
        projectedSpend: 20 * seats, monthlySavings: Math.max(0, monthlySpend - 20 * seats),
        reason: `For coding workflows, a purpose-built coding AI (Cursor, Copilot) integrates with your IDE and provides inline suggestions, test generation, and codebase context that ChatGPT can't match.`,
        credexApplicable: false,
      };
    }
  }

  // ─── Anthropic API ───
  if (toolId === "anthropic_api") {
    if (monthlySpend > 200 && teamSize <= 5) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "keep",
        projectedSpend: monthlySpend * 0.7, monthlySavings: monthlySpend * 0.3,
        reason: `API spend this size is building infrastructure, not paying for seats — that's smart. Credex sources Anthropic API credits at ~30% discount for companies spending $200+/mo.`,
        credexApplicable: true,
      };
    }
    if (monthlySpend < 50 && teamSize <= 3) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "switch", recommendedTool: "Claude Pro",
        projectedSpend: 20, monthlySavings: Math.max(0, monthlySpend - 20),
        reason: `At under $50/mo usage, a Claude Pro subscription ($20/seat) is almost certainly cheaper and comes with a better UX for non-engineers on your team.`,
        credexApplicable: false,
      };
    }
  }

  // ─── OpenAI API ───
  if (toolId === "openai_api") {
    if (monthlySpend > 200) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "keep",
        projectedSpend: monthlySpend * 0.75, monthlySavings: monthlySpend * 0.25,
        reason: `API infrastructure spend — right call for building products. Credex sources OpenAI API credits at 20–25% discount. At $${monthlySpend}/mo, switching to credits saves $${Math.round(monthlySpend * 0.25)}/mo with zero code changes.`,
        credexApplicable: true,
      };
    }
    if (monthlySpend < 30 && (useCase === "writing" || useCase === "research")) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "switch", recommendedTool: "ChatGPT Plus",
        projectedSpend: 20, monthlySavings: Math.max(0, monthlySpend - 20),
        reason: `Low API usage for non-coding workflows suggests you're using the API as a proxy for a chat interface. ChatGPT Plus ($20/mo) is cheaper and has a better UX for writing/research.`,
        credexApplicable: false,
      };
    }
  }

  // ─── Gemini ───
  if (toolId === "gemini") {
    if (plan === "Business" && (useCase === "coding")) {
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "switch", recommendedTool: "GitHub Copilot Business",
        projectedSpend: 19 * seats, monthlySavings: Math.max(0, monthlySpend - 19 * seats),
        reason: `Gemini's coding capabilities are competitive but its IDE integration lags Copilot and Cursor. For pure coding workflows, Copilot at $19/seat offers deeper IDE integration and better inline completion quality.`,
        credexApplicable: false,
      };
    }
  }

  // ─── Windsurf ───
  if (toolId === "windsurf") {
    if (plan === "Teams" && seats < 5) {
      const proCost = 15 * seats;
      const savings = 35 * seats - proCost;
      return {
        toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
        recommendedAction: "downgrade", recommendedPlan: "Pro",
        projectedSpend: proCost, monthlySavings: savings,
        reason: `Windsurf Teams adds admin controls and centralized billing — overhead that doesn't pay off under 5 developers. Pro plan gives the same AI features per seat at $15.`,
        credexApplicable: false,
      };
    }
  }

  // ─── Default: already optimal ───
  return {
    toolId, toolName, currentPlan: plan, currentSpend: monthlySpend,
    recommendedAction: "keep",
    projectedSpend: monthlySpend, monthlySavings: 0,
    reason: `You're on the right plan for your team size and use case. No changes recommended.`,
    credexApplicable: false,
  };
}

// Check for redundant overlapping tools
function detectOverlap(tools: ToolEntry[], useCase: UseCaseType): ToolRecommendation[] {
  const overlaps: ToolRecommendation[] = [];

  const hasCursor = tools.find((t) => t.toolId === "cursor" && t.plan !== "Hobby");
  const hasCopilot = tools.find((t) => t.toolId === "github_copilot");
  const hasWindsurf = tools.find((t) => t.toolId === "windsurf" && t.plan !== "Free");
  const hasClaude = tools.find((t) => t.toolId === "claude" && t.plan !== "Free");
  const hasChatGPT = tools.find((t) => t.toolId === "chatgpt" && t.plan !== "Free");

  // Cursor + Copilot + Windsurf = 2 coding AIs too many
  if (hasCursor && hasCopilot && hasWindsurf) {
    overlaps.push({
      toolId: "windsurf",
      toolName: "Windsurf",
      currentPlan: hasWindsurf.plan,
      currentSpend: hasWindsurf.monthlySpend,
      recommendedAction: "eliminate",
      projectedSpend: 0,
      monthlySavings: hasWindsurf.monthlySpend,
      reason: `You're paying for three coding AI tools (Cursor, Copilot, Windsurf). That's redundant — engineers context-switch between tools and use none deeply. Eliminate Windsurf; the coding workflow between Cursor + Copilot already covers completions and agentic coding.`,
      credexApplicable: false,
    });
  }

  // Cursor + Copilot: often redundant
  if (hasCursor && hasCopilot && !hasWindsurf) {
    // Only flag if both are paid and team is small
    if (hasCursor.seats <= 5 && hasCopilot.seats <= 5) {
      overlaps.push({
        toolId: "github_copilot",
        toolName: "GitHub Copilot",
        currentPlan: hasCopilot.plan,
        currentSpend: hasCopilot.monthlySpend,
        recommendedAction: "eliminate",
        projectedSpend: 0,
        monthlySavings: hasCopilot.monthlySpend,
        reason: `Cursor and Copilot serve overlapping purposes — both offer AI completions and chat in the IDE. Teams rarely get compounding value from both. Cursor's agent mode is more capable; eliminate Copilot unless engineers are specifically VS Code-only with Copilot workflows they depend on.`,
        credexApplicable: false,
      });
    }
  }

  // Claude + ChatGPT: overlapping chat AI for non-coding use cases
  if (hasClaude && hasChatGPT && useCase !== "coding") {
    const smallerSpend = Math.min(hasClaude.monthlySpend, hasChatGPT.monthlySpend);
    const keepClaude = hasClaude.monthlySpend >= hasChatGPT.monthlySpend;
    overlaps.push({
      toolId: keepClaude ? "chatgpt" : "claude",
      toolName: keepClaude ? "ChatGPT" : "Claude",
      currentPlan: keepClaude ? hasChatGPT.plan : hasClaude.plan,
      currentSpend: smallerSpend,
      recommendedAction: "eliminate",
      projectedSpend: 0,
      monthlySavings: smallerSpend,
      reason: `Both Claude and ChatGPT are general-purpose LLMs for ${useCase} workflows — running both is redundant for most teams. ${keepClaude ? "Claude" : "ChatGPT"} is the stronger choice for your use case; eliminating the other removes duplication without capability loss.`,
      credexApplicable: false,
    });
  }

  return overlaps;
}

export function runAudit(input: AuditInput): AuditResult {
  const { tools, teamSize, useCase } = input;

  // Individual tool recommendations
  const baseRecs = tools.map((t) => evaluateTool(t, teamSize, useCase));

  // Overlap/redundancy checks
  const overlapRecs = detectOverlap(tools, useCase);

  // Merge: overlap recs override base recs for the same toolId
  const overlapToolIds = new Set(overlapRecs.map((r) => r.toolId));
  const mergedRecs = [
    ...baseRecs.filter((r) => !overlapToolIds.has(r.toolId)),
    ...overlapRecs,
  ];

  const totalCurrentSpend = tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalProjectedSpend = mergedRecs.reduce((sum, r) => sum + r.projectedSpend, 0);
  const totalMonthlySavings = totalCurrentSpend - totalProjectedSpend;
  const totalAnnualSavings = totalMonthlySavings * 12;

  // Top waste and top switch for AI summary
  const topWaste = mergedRecs
    .filter((r) => r.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)[0];

  const topSwitch = mergedRecs.find((r) => r.recommendedAction === "switch");

  return {
    recommendations: mergedRecs,
    totalMonthlySavings,
    totalAnnualSavings,
    totalCurrentSpend,
    totalProjectedSpend,
    isHighSavings: totalMonthlySavings > 500,
    isAlreadyOptimal: totalMonthlySavings < 100,
    summaryContext: {
      teamSize,
      useCase,
      topWaste: topWaste ? `${topWaste.toolName} ${topWaste.currentPlan}` : "none identified",
      topSwitch: topSwitch ? `${topSwitch.toolName} → ${topSwitch.recommendedTool}` : "none",
    },
  };
}
