# TESTS.md

All tests are in `__tests__/audit-engine.test.ts`. Run with:

```bash
npm test
```

## Test Suite: Audit Engine

File: `__tests__/audit-engine.test.ts`
Runner: Jest + ts-jest
Covers: The core `runAudit()` function and all recommendation logic

| # | Test Name | What It Covers | Status |
|---|---|---|---|
| 1 | ChatGPT Pro for 3 users → downgrade to Team | Overkill plan detection for ChatGPT Pro ($200/seat) vs Team ($30/seat) | ✅ |
| 2 | Cursor Business for 2 seats → downgrade to Pro | Small-team over-plan detection; verifies exact $40 savings | ✅ |
| 3 | Claude Team with 3 seats → downgrade to Pro | Minimum-seat billing trap detection (5-seat min = paying for phantom seats) | ✅ |
| 4 | Cursor + Copilot overlap → eliminate Copilot | Redundant coding AI detection; verifies full spend elimination | ✅ |
| 5 | Optimized stack → isAlreadyOptimal = true | Honest "you're spending well" path; no false savings manufactured | ✅ |
| 6 | Large team on wrong plans → isHighSavings = true | High-savings threshold ($500+/mo) for Credex CTA trigger | ✅ |
| 7 | Annual savings = monthly × 12 | Arithmetic correctness of annualized savings | ✅ |
| 8 | Cursor Pro for research use case → switch | Use-case mismatch detection (code editor for non-coders) | ✅ |
| 9 | Triple overlap (Cursor + Copilot + Windsurf) → eliminate Windsurf | Three-tool redundancy detection | ✅ |
| 10 | Total current spend = sum of inputs | Spend aggregation arithmetic | ✅ |

## Running Tests

```bash
# Run all tests
npm test

# Watch mode during development
npm run test:watch

# With coverage
npx jest --coverage
```

## CI

Tests run automatically on every push to `main` via GitHub Actions (`.github/workflows/ci.yml`).
Green check required before merge.
