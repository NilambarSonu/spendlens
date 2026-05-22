import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS } from '@/lib/pricing-data';

describe('Windsurf pricing details in catalog', () => {
  it('has a windsurf entry in tool definitions', () => {
    const windsurf = TOOL_DEFINITIONS.windsurf;
    expect(windsurf).toBeDefined();
    expect(windsurf.id).toBe('windsurf');
    expect(windsurf.name).toBe('Windsurf (Codeium)');
  });

  it('contains correctly priced plans', () => {
    const windsurf = TOOL_DEFINITIONS.windsurf;
    const freePlan = windsurf.plans.find(p => p.id === 'free');
    const proPlan = windsurf.plans.find(p => p.id === 'pro');
    const teamsPlan = windsurf.plans.find(p => p.id === 'teams');

    expect(freePlan?.pricePerSeat).toBe(0);
    expect(proPlan?.pricePerSeat).toBe(15);
    expect(teamsPlan?.pricePerSeat).toBe(30);
  });
});
