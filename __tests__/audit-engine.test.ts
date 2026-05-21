import { runAudit, AuditInput } from "../lib/audit-engine";

// Test 1: Team on ChatGPT Pro (overkill) should get downgrade recommendation
test("ChatGPT Pro for 3 users → downgrade to Team", () => {
  const input: AuditInput = {
    tools: [{ toolId: "chatgpt", plan: "Pro", monthlySpend: 600, seats: 3 }],
    teamSize: 3,
    useCase: "writing",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "chatgpt");
  expect(rec?.recommendedAction).toBe("downgrade");
  expect(rec?.monthlySavings).toBeGreaterThan(0);
});

// Test 2: Cursor Business for 2 devs → downgrade to Pro
test("Cursor Business for 2 seats → downgrade to Pro", () => {
  const input: AuditInput = {
    tools: [{ toolId: "cursor", plan: "Business", monthlySpend: 80, seats: 2 }],
    teamSize: 2,
    useCase: "coding",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "cursor");
  expect(rec?.recommendedAction).toBe("downgrade");
  expect(rec?.recommendedPlan).toBe("Pro");
  expect(rec?.monthlySavings).toBe(40); // (40-20) * 2
});

// Test 3: Claude Team with 3 users (below 5-seat minimum) → downgrade
test("Claude Team with 3 seats (below minimum) → downgrade to Pro", () => {
  const input: AuditInput = {
    tools: [{ toolId: "claude", plan: "Team", monthlySpend: 150, seats: 3 }],
    teamSize: 3,
    useCase: "writing",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "claude");
  expect(rec?.recommendedAction).toBe("downgrade");
  expect(rec?.monthlySavings).toBeGreaterThan(0);
});

// Test 4: Cursor + Copilot overlap → eliminate Copilot
test("Cursor Pro + GitHub Copilot Business overlap → eliminate Copilot", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "Pro", monthlySpend: 60, seats: 3 },
      { toolId: "github_copilot", plan: "Business", monthlySpend: 57, seats: 3 },
    ],
    teamSize: 3,
    useCase: "coding",
  };
  const result = runAudit(input);
  const copilotRec = result.recommendations.find((r) => r.toolId === "github_copilot");
  expect(copilotRec?.recommendedAction).toBe("eliminate");
  expect(copilotRec?.monthlySavings).toBe(57);
});

// Test 5: Already optimal stack → isAlreadyOptimal = true, minimal savings
test("Optimized stack → isAlreadyOptimal true, savings < $100", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "Pro", monthlySpend: 20, seats: 1 },
      { toolId: "claude", plan: "Pro", monthlySpend: 20, seats: 1 },
    ],
    teamSize: 1,
    useCase: "coding",
  };
  const result = runAudit(input);
  expect(result.isAlreadyOptimal).toBe(true);
  expect(result.totalMonthlySavings).toBeLessThan(100);
});

// Test 6: High savings threshold → isHighSavings = true
test("Large team on wrong plans → isHighSavings = true", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "chatgpt", plan: "Pro", monthlySpend: 2000, seats: 10 },
      { toolId: "cursor", plan: "Enterprise", monthlySpend: 1000, seats: 10 },
    ],
    teamSize: 10,
    useCase: "mixed",
  };
  const result = runAudit(input);
  expect(result.isHighSavings).toBe(true);
  expect(result.totalMonthlySavings).toBeGreaterThan(500);
});

// Test 7: Annual savings = monthly * 12
test("Annual savings equals monthly savings × 12", () => {
  const input: AuditInput = {
    tools: [{ toolId: "chatgpt", plan: "Pro", monthlySpend: 400, seats: 2 }],
    teamSize: 2,
    useCase: "writing",
  };
  const result = runAudit(input);
  expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
});

// Test 8: Cursor for writing/research use case → switch recommendation
test("Cursor paid plan for research use case → switch to Claude", () => {
  const input: AuditInput = {
    tools: [{ toolId: "cursor", plan: "Pro", monthlySpend: 60, seats: 3 }],
    teamSize: 3,
    useCase: "research",
  };
  const result = runAudit(input);
  const rec = result.recommendations.find((r) => r.toolId === "cursor");
  expect(rec?.recommendedAction).toBe("switch");
});

// Test 9: Triple overlap (Cursor + Copilot + Windsurf) → eliminate Windsurf
test("Cursor + Copilot + Windsurf triple overlap → eliminate Windsurf", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "Pro", monthlySpend: 40, seats: 2 },
      { toolId: "github_copilot", plan: "Business", monthlySpend: 38, seats: 2 },
      { toolId: "windsurf", plan: "Pro", monthlySpend: 30, seats: 2 },
    ],
    teamSize: 2,
    useCase: "coding",
  };
  const result = runAudit(input);
  const windsurfRec = result.recommendations.find((r) => r.toolId === "windsurf");
  expect(windsurfRec?.recommendedAction).toBe("eliminate");
});

// Test 10: Total current spend = sum of all tool monthly spends
test("Total current spend matches sum of inputs", () => {
  const input: AuditInput = {
    tools: [
      { toolId: "cursor", plan: "Pro", monthlySpend: 100, seats: 5 },
      { toolId: "claude", plan: "Team", monthlySpend: 150, seats: 5 },
      { toolId: "chatgpt", plan: "Plus", monthlySpend: 20, seats: 1 },
    ],
    teamSize: 5,
    useCase: "coding",
  };
  const result = runAudit(input);
  expect(result.totalCurrentSpend).toBe(270);
});
