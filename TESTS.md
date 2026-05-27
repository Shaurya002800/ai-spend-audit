# TESTS.md

The tests for this project are in `__tests__/audit-engine.test.ts`.

Run them with:

```bash
npm test
```

## What the tests cover

The current test file focuses on the core audit logic:

- plan mismatch recommendations
- overlap detection across tools
- savings math
- annualized savings calculation
- the "already optimized" path
- high-savings detection

I focused the tests on the engine because that is the part most likely to silently drift if I change recommendation rules.

## What is not covered yet

I did not build a full test suite around the UI or API routes. If I were extending this project, I would add:

- a couple of route tests for `/api/audit` and `/api/lead`
- one end-to-end flow test
- a few mobile UI checks

For the scope of this assignment, engine coverage felt like the highest-value place to spend the time.
