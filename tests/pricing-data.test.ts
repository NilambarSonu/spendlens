import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS } from '@/lib/pricing-data';

describe('Pricing Data Catalog', () => {
  it('contains exactly the 15 mandatory AI tool definitions', () => {
    const keys = Object.keys(TOOL_DEFINITIONS);
    expect(keys).toContain('cursor');
    expect(keys).toContain('github_copilot');
    expect(keys).toContain('claude');
    expect(keys).toContain('chatgpt');
    expect(keys).toContain('anthropic_api');
    expect(keys).toContain('openai_api');
    expect(keys).toContain('gemini');
    expect(keys).toContain('windsurf');
    expect(keys).toContain('midjourney');
    expect(keys).toContain('perplexity');
    expect(keys).toContain('v0');
    expect(keys).toContain('elevenlabs');
    expect(keys).toContain('notion_ai');
    expect(keys).toContain('deepl');
    expect(keys).toContain('jasper');
    expect(keys.length).toBe(15);
  });

  it('contains valid price plans with non-negative prices per seat', () => {
    Object.values(TOOL_DEFINITIONS).forEach((tool) => {
      expect(tool.plans.length).toBeGreaterThan(0);
      tool.plans.forEach((plan) => {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.pricePerSeat).toBeGreaterThanOrEqual(0);
        expect(plan.features.length).toBeGreaterThan(0);
        expect(plan.officialPricingUrl).toMatch(/^https:\/\//);
        expect(plan.verifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });

  it('verifies Cursor plans are correct', () => {
    const cursor = TOOL_DEFINITIONS.cursor;
    const hobby = cursor.plans.find((p) => p.id === 'hobby');
    const pro = cursor.plans.find((p) => p.id === 'pro');
    const business = cursor.plans.find((p) => p.id === 'business');

    expect(hobby?.pricePerSeat).toBe(0);
    expect(pro?.pricePerSeat).toBe(20);
    expect(business?.pricePerSeat).toBe(40);
  });

  it('verifies ChatGPT plans are correct', () => {
    const chatgpt = TOOL_DEFINITIONS.chatgpt;
    const free = chatgpt.plans.find((p) => p.id === 'free');
    const plus = chatgpt.plans.find((p) => p.id === 'plus');
    const team = chatgpt.plans.find((p) => p.id === 'team');
    const enterprise = chatgpt.plans.find((p) => p.id === 'enterprise');

    expect(free?.pricePerSeat).toBe(0);
    expect(plus?.pricePerSeat).toBe(20);
    expect(team?.pricePerSeat).toBe(30);
    expect(enterprise?.pricePerSeat).toBe(60);
  });
});
