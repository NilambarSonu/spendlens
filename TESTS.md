# SpendLens — Verification & Test Suite Documentation

This document describes the validation strategy, testing architecture, and test suite definitions for the SpendLens platform. All tests are powered by **Vitest** for native ESM compatibility.

---

## 1. Testing Strategy & Setup

We implement a combination of **Unit Testing** (for deterministic rules and data structures) and **Integration Testing** (for API routes, validations, and rate-limiting fallbacks).

### Test Configuration (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

All source paths use the `@/*` alias resolved back to the application root directory, ensuring complete path parity with the Next.js compiler.

---

## 2. Test Suite Breakdown

We maintain 13 unit/integration tests grouped across 3 primary test suites.

### A. Pricing Data Integrity (`tests/pricing-data.test.ts`)
- **Focus**: Verifies accuracy of tool catalog schemas and subscription facts.
- **Tests**:
  1. `contains all 8 target AI tools`: Validates that Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf, OpenAI API, and Anthropic API exist in definitions.
  2. `ensures every tool has at least one paid plan`: Checks that plan pricing lists are fully formed.
  3. `ensures official pricing URLs are valid HTTPS paths`: Guards against broken or standard fallback links.
  4. `ensures verification dates are formatted correctly`: Asserts YYYY-MM-DD pattern to keep price records fresh.

### B. Rule-Based Audit Engine (`tests/audit-engine.test.ts`)
- **Focus**: Validates correctness of core deterministic financial logic.
- **Tests**:
  1. `recommends downgrading Cursor Business to Pro for solo developer`: Asserts $20/mo savings recommendation.
  2. `detects redundancy when both Claude Pro and ChatGPT Plus for non-mixed use case`: Flags overlapping chat utilities and suggests consolidation.
  3. `marks spend as optimal when user is on right plan for team size`: Confirms zero-savings keeps are flagged cleanly.
  4. `calculates total annual savings correctly as 12x monthly`: Checks math parity.
  5. `flags as high savings when total monthly savings exceeds $500`: Ensures leads are routed to high-value Credex consultation flows.
  6. `handles empty tools array without crashing`: Asserts array boundary protections.

### C. Backend API Integration (`tests/api.test.ts`)
- **Focus**: Asserts route behavior, validation guards, and fallback systems.
- **Tests**:
  1. `rejects malformed payloads with 400 status`: Confirms team size or primary use case validators function.
  2. `triggers honeypot defense on bot submissions`: Asserts blockages when the hidden "website" field is filled.
  3. `returns graceful fallback summary if AI key is missing/invalid`: Validates local text rendering fallbacks.

---

## 3. Running Tests Locally

Execute the test suite in non-interactive run mode:

```bash
npm run test
```

### Verified Test Outputs (Sample Execution):

```bash
> spendlens@0.1.0 test
> vitest run

 RUN  v4.1.7 C:/Users/Asus/OneDrive/Code_X/Credex_AI_Spent/spendlens

 ✓ tests/pricing-data.test.ts (4 tests) 25ms
 ✓ tests/api.test.ts (3 tests) 11ms
 ✓ tests/audit-engine.test.ts (6 tests) 14ms

 Test Files  3 passed (3)
      Tests  13 passed (13)
   Start at  10:55:37
   Duration  575ms
```
