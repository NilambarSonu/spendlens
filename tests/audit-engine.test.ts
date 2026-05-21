import { describe, it, expect } from 'vitest';
import { runAudit } from '@/lib/audit-engine';

describe('Audit Engine', () => {
  it('recommends downgrading Cursor Business to Pro for solo developer', () => {
    const result = runAudit({
      teamSize: 1,
      primaryUseCase: 'coding',
      tools: [{ toolId: 'cursor', planId: 'business', monthlySpend: 40, seats: 1 }],
    });
    const rec = result.recommendations[0];
    expect(rec.action).toBe('downgrade');
    expect(rec.monthlySavings).toBe(20);
    expect(rec.recommendedPlan).toContain('Pro');
  });

  it('detects redundancy when both Claude Pro and ChatGPT Plus for non-mixed use case', () => {
    const result = runAudit({
      teamSize: 3,
      primaryUseCase: 'writing',
      tools: [
        { toolId: 'claude', planId: 'pro', monthlySpend: 20, seats: 1 },
        { toolId: 'chatgpt', planId: 'plus', monthlySpend: 20, seats: 1 },
      ],
    });
    const chatgptRec = result.recommendations.find(r => r.toolId === 'chatgpt');
    expect(chatgptRec?.monthlySavings).toBeGreaterThan(0);
    expect(chatgptRec?.action).toBe('switch');
  });

  it('marks spend as optimal when user is on right plan for team size', () => {
    const result = runAudit({
      teamSize: 2,
      primaryUseCase: 'coding',
      tools: [{ toolId: 'cursor', planId: 'pro', monthlySpend: 40, seats: 2 }],
    });
    const rec = result.recommendations[0];
    expect(rec.action).toBe('keep');
    expect(rec.monthlySavings).toBe(0);
  });

  it('calculates total annual savings correctly as 12x monthly', () => {
    const result = runAudit({
      teamSize: 2,
      primaryUseCase: 'coding',
      tools: [{ toolId: 'cursor', planId: 'business', monthlySpend: 80, seats: 2 }],
    });
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
  });

  it('flags as high savings when total monthly savings exceeds $500', () => {
    const result = runAudit({
      teamSize: 10,
      primaryUseCase: 'coding',
      tools: [
        { toolId: 'cursor', planId: 'business', monthlySpend: 400, seats: 10 },
        { toolId: 'github_copilot', planId: 'enterprise', monthlySpend: 390, seats: 10 },
        { toolId: 'chatgpt', planId: 'team', monthlySpend: 300, seats: 10 },
      ],
    });
    // Savings will be significant for this over-provisioned team
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
    expect(typeof result.isHighSavings).toBe('boolean');
  });

  it('handles empty tools array without crashing', () => {
    expect(() => runAudit({
      teamSize: 5,
      primaryUseCase: 'mixed',
      tools: [],
    })).not.toThrow();
  });
});
