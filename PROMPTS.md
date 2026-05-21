# SpendLens — Anthropic Claude Prompt & Fallback Strategy

This document details the LLM integration strategy, parameters, system instructions, and fallback layers utilized in the SpendLens AI summary API (`app/api/summary/route.ts`).

---

## 1. LLM Client & Model Selection

- **Model**: `claude-3-5-haiku` (or fallback `claude-haiku` / `claude-haiku-4-5`)
- **Tokens**: `max_tokens: 200`
- **Temperature**: `0.3` (selected to reduce variance and ensure concise financial reporting).

---

## 2. API System Prompt & Variables

The prompt is designed to produce a professional, highly readable financial paragraph. It consumes five structured data points passed from our deterministic engine:

### Prompt Configuration

```text
You are a concise financial advisor specializing in AI tool spend optimization.

Generate a 80-100 word personalized audit summary for this startup:

Team size: {teamSize} people
Primary use case: {primaryUseCase}
Current monthly AI spend: ${totalMonthlySpend}
Identified monthly savings: ${totalMonthlySavings}
Key recommendations: {recommendationsSummary}

Write in second person ("your team", "you're paying"). Be specific about numbers. End with one forward-looking sentence. Do not use bullet points. Plain paragraph only.
```

---

## 3. Dynamic Input Mapping Example

When a user submits their audit, the variables resolve as follows:

- **teamSize**: `8`
- **primaryUseCase**: `coding`
- **totalMonthlySpend**: `560`
- **totalMonthlySavings**: `240`
- **recommendationsSummary**: `Cursor: Downgrade from Business to Pro; GitHub Copilot: Downgrade Enterprise to Business.`

### Resulting Output Synthesized by Claude:
> Your team of 8 is currently spending $560/month on developer AI tools for coding workflows. By actioning a few key adjustments, you can unlock $240/month in immediate savings, returning $2,880 annually to your budget. The primary overspends are due to over-provisioned seat tiers: downgrading your 8 Cursor Business seats to Cursor Pro, and swapping Copilot Enterprise for Copilot Business will maintain identical developer capabilities while reducing seats costs. Streamlining these active subscriptions ensures your stack remains highly optimized as you scale.

---

## 4. Double-Guard Local Fallback Logic

To guarantee that the SpendLens app remains 100% functional even under offline conditions, rate-limiting blocks, or missing credentials, a deterministic fallback engine executes immediately if the Anthropic API triggers an exception:

```typescript
function generateFallbackSummary(auditData: Record<string, unknown>): string {
  const savings = auditData.totalMonthlySavings as number;
  const spend = auditData.totalMonthlySpend as number;
  const teamSize = auditData.teamSize as number;
  const useCase = auditData.primaryUseCase as string;
  
  if (savings < 100) {
    return `Your team of ${teamSize} is spending $${spend}/month on AI tools for ${useCase} work, which is well-optimized. Your current stack is a reasonable fit for your use case and team size. Keep monitoring as your usage scales — new plans and alternatives launch frequently in this space.`;
  }
  return `Your team of ${teamSize} is spending $${spend}/month on AI tools but could save $${savings}/month ($${savings * 12}/year) with the right plan adjustments. The biggest opportunity is right-sizing plans to your actual team size and consolidating overlapping subscriptions. These are straightforward changes that won't affect your team's capabilities.`;
}
```

This logic runs on the client server instantly, assuring the user is always presented with a high-fidelity summary block.
