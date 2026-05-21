# SpendLens — Development Log (Nilambar Behera, May 21–27, 2026)

This log records the daily progression of the SpendLens internship project, covering architecture, challenges, fixes, and validation.

---

## Day 1: Initial Setup & Environment Configuration (May 21, 2026)
- **Goal**: Scaffold the application structure and create project configuration files.
- **Achievements**:
  - Initialized a Next.js 14 (App Router) + TypeScript application in non-interactive mode.
  - Setup `.env.example` defining essential service boundaries (Supabase, Resend, Anthropic, and Local URLs).
  - Drafted custom Tailwind system styling guidelines (`tailwind.config.ts` and `app/globals.css`).
  - Added Lucide-react for iconography and clsx/tailwind-merge for class manipulations.
- **Technical Insight**: Configured Next.js with strict type-safety flags (`strictNullChecks: true`) inside `tsconfig.json` to prevent null/undefined dereferencing bugs in the dynamic form components.

---

## Day 2: Models & Core Pricing Data Catalog (May 22, 2026)
- **Goal**: Populate the verified pricing data arrays for all 8 target AI tools.
- **Achievements**:
  - Implemented typescript models inside `types/index.ts` defining structures for `ToolEntry`, `Plan`, `ToolDefinition`, `ToolRecommendation`, and `AuditResult`.
  - Built `lib/pricing-data.ts` cataloging verified plan features, per-seat pricing, and team metrics for Cursor, GitHub Copilot, Claude, ChatGPT, Anthropic API, OpenAI API, Gemini, and Windsurf.
- **Technical Insight**: Discovered that OpenAI ChatGPT Enterprise plans do not have public standard pricing. Factored a realistic estimated team average pricing of $60/seat with proper notes, verifying matching benchmarks.

---

## Day 3: Deterministic Audit Engine & Test Scenarios (May 23, 2026)
- **Goal**: Build the offline rules engine and establish early test coverage with Vitest.
- **Achievements**:
  - Designed the core deterministic rules inside `lib/audit-engine.ts`.
  - Coded dedicated spend evaluation criteria: tiny-team downgrades from Team/Business plans, list-price discrepancy adjustments, Cursor-to-Claude conversions for non-technical clients, ChatGPT Enterprise downgrades for <50 seats, and general overlapping service redundancy detectors (paying for both Claude Pro and ChatGPT Plus).
  - Established unit test suite under `tests/audit-engine.test.ts` and `tests/pricing-data.test.ts`. Verified all tests passing locally with green metrics.

---

## Day 4: Backend Schema & REST Integrations (May 24, 2026)
- **Goal**: Build Supabase DB tables and hook up backend transaction API endpoints.
- **Achievements**:
  - Created the PostgreSQL migrations schemas for Supabase, complete with indexes for fast URL lookups (`public_token`) and lead analytics.
  - Coded `app/api/audit/route.ts` with honeypot security safeguards and custom in-memory IP rate-limiters.
  - Coded `app/api/summary/route.ts` parsing raw calculations into Claude 3.5 Haiku prompts. Included robust default fallback engine.
  - Coded `app/api/lead/route.ts` enabling transaction mail transmissions through Resend.

---

## Day 5: Frontend Design, Layout, & Form States (May 25, 2026)
- **Goal**: Assemble high-fidelity visual forms and layouts.
- **Achievements**:
  - Set up a premium unified dark theme (`#0f172a` primary, `#10b981` emerald green success accents) inside globals/tailwind configurations.
  - Coded `components/SavingsHero.tsx` rendering animated monthly/annual counters.
  - Created modular interactive form fields (`components/AuditForm.tsx` and `components/ToolRow.tsx`) with instant local storage synchronization to prevent loss of user data on refresh.
  - Tested client-side state recovery hooks locally, yielding zero frame drop rendering.

---

## Day 6: Audit Dashboards, Shareable Links, & OG Meta Optimization (May 26, 2026)
- **Goal**: Build the audit outcomes dashboard and optimize public link sharing previews.
- **Achievements**:
  - Created `components/AuditResults.tsx` and `components/LeadCapture.tsx`.
  - Programmed the dynamic server-side dynamic route `app/audit/[id]/page.tsx` utilizing dynamic Next.js Metadata generators.
  - Configured custom Open Graph tags, ensuring high-fidelity social link previews (card summaries, headers, and descriptions) display on X, Slack, or LinkedIn.
  - Added a responsive clipboard-copy button with custom feedback states.

---

## Day 7: Vitest QA Verification & Production Build Validation (May 27, 2026)
- **Goal**: Run complete test suits and finalize compilation checks.
- **Achievements**:
  - Validated all 13 test scenarios in Vitest, resolving any mock response constraints.
  - Ran `npm run build` validating production compilation. Resolved a minor dynamic dynamic SSR route mismatch by adjusting URL checks.
  - Finalized GTM, economics, metrics, and prompts markdown specifications. Prepared the repository for review.
