# SpendLens — Verified AI Tools Pricing Catalog (May 2026)

This document contains standard references, feature boundaries, and sources for the AI pricing matrices modeled inside SpendLens. All records are verified as of **May 21, 2026**.

---

## AI Subscription Standard Pricing Grid

### 1. Cursor (Anysphere)
- **Hobby**: $0/mo. Limited GPT-4o mini completions (2,000 completions/mo).
- **Pro**: $20/user/mo. Unlimited completions, 500 fast requests/mo (GPT-4/Claude 3.5 Sonnet).
- **Business**: $40/user/mo. Adds admin dashboards, SSO, usage analytics, and privacy mode.
- **Source**: [https://cursor.sh/pricing](https://cursor.sh/pricing)

### 2. GitHub Copilot (GitHub)
- **Individual**: $10/user/mo. Basic autocomplete, chat, IDE integration.
- **Business**: $19/user/mo. Organization management, audit logs, policy controls.
- **Enterprise**: $39/user/mo. Fine-tuning, PR summaries, custom knowledge bases.
- **Source**: [https://github.com/features/copilot](https://github.com/features/copilot)

### 3. Claude (Anthropic)
- **Free**: $0/mo. Basic messages, Anthropic Claude 3.5 Sonnet access.
- **Pro**: $20/user/mo. 5x usage limits, Projects, Claude Opus.
- **Max**: $100/user/mo. 20x usage limits, Extended thinking modes.
- **Team**: $30/user/mo (min 5 seats). Shared projects, admin console, higher rate limits.
- **Source**: [https://claude.ai/upgrade](https://claude.ai/upgrade)

### 4. ChatGPT (OpenAI)
- **Free**: $0/mo. GPT-4o mini access.
- **Plus**: $20/user/mo. Full GPT-4o access, DALL-E, data analyst widgets, custom GPTs.
- **Team**: $30/user/mo (min 2 seats). Shared workspaces, admin console, higher limits.
- **Enterprise**: ~$60/user/mo (Estimate). Dedicated CSM, advanced retention, SSO.
- **Source**: [https://openai.com/chatgpt/pricing](https://openai.com/chatgpt/pricing)

### 5. Gemini (Google)
- **Free**: $0/mo. Gemini 1.5 Pro (limited access).
- **Advanced**: $20/user/mo. Gemini Ultra, 1M context, Google One benefits.
- **Workspace Business**: $30/user/mo. Gemini in Docs, Sheets, Gmail, team management.
- **Source**: [https://gemini.google.com/advanced](https://gemini.google.com/advanced)

### 6. Windsurf (Codeium)
- **Free**: $0/mo. Unlimited completions, 5 fast requests/day.
- **Pro**: $15/user/mo. Unlimited fast requests, advanced agentic features.
- **Teams**: $30/user/mo. Org dashboard, team analytics.
- **Source**: [https://windsurf.ai/pricing](https://windsurf.ai/pricing)

---

## Direct API Pricing (Usage-Based Modeling)

For teams leveraging raw API keys directly in their software (LLM API category), SpendLens models standard consumption estimates to highlight savings between models:

### 1. Anthropic API
- **Claude Haiku 3.5**: $0.80 / Million Input Tokens · $4.00 / Million Output Tokens.
- **Claude Sonnet 4**: $3.00 / Million Input Tokens · $15.00 / Million Output Tokens.
- **Claude Opus 4**: $15.00 / Million Input Tokens · $75.00 / Million Output Tokens.
- **Source**: [https://www.anthropic.com/pricing](https://www.anthropic.com/pricing)

### 2. OpenAI API
- **GPT-4o mini**: $0.15 / Million Input Tokens · $0.60 / Million Output Tokens.
- **GPT-4o**: $2.50 / Million Input Tokens · $10.00 / Million Output Tokens.
- **Source**: [https://openai.com/api/pricing](https://openai.com/api/pricing)

---

## Mathematical Verification Rules

Our deterministic audit logic relies on these values:
1. **Redundancy Thresholds**: If a user is paying for both a ChatGPT Pro/Team tier AND a Claude Pro/Team tier for a single-use case (e.g., just `writing` or `research`), we suggest deprecating ChatGPT, saving $20–$30/user/mo.
2. **Tiny Team Overpays**: If team size is $\le 2$ but they pay for Claude Team (which has a 5-seat minimum) or ChatGPT Team (2-seat minimum, but often paid on higher plans), we flag the seat count constraint and recommend individual Pro/Plus configurations instead.
3. **Cursor Business Downgrades**: If team size is under 5 and seats $\le 3$, we trigger a recommendation to downgrade Cursor Business ($40/mo) to Cursor Pro ($20/mo) as admin SSO/dashboard controls are obsolete for small projects.
