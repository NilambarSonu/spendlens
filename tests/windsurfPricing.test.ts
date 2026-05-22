// tests/windsurfPricing.test.ts
import { calculateWindsurfPricing } from '@/lib/pricing';

describe('Windsurf pricing edge cases', () => {
  test('zero users yields zero cost', () => {
    expect(calculateWindsurfPricing(0, 10)).toBe(0);
  });
  test('negative users treated as zero', () => {
    expect(calculateWindsurfPricing(-5, 10)).toBe(0);
  });
});
