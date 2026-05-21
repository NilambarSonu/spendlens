import { TOOL_DEFINITIONS } from './pricing-data';
import type { AuditInput, AuditResult, ToolRecommendation, ToolEntry } from '@/types';

export function runAudit(input: AuditInput): Omit<AuditResult, 'id' | 'publicToken' | 'aiSummary' | 'createdAt'> {
  const recommendations: ToolRecommendation[] = (input.tools || []).map(tool =>
    analyzeToolSpend(tool, input)
  );

  // Detect duplicate-capability tools (paying for both Claude Pro AND ChatGPT Plus = redundancy)
  const redundancyRecs = detectRedundancy(input.tools || [], input.primaryUseCase);
  redundancyRecs.forEach(rec => {
    const existing = recommendations.find(r => r.toolId === rec.toolId);
    if (existing && rec.monthlySavings > existing.monthlySavings) {
      Object.assign(existing, rec);
    }
  });

  const totalMonthlySpend = (input.tools || []).reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const totalAnnualSavings = totalMonthlySavings * 12;

  return {
    input,
    recommendations,
    totalMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    isHighSavings: totalMonthlySavings > 500,
    isOptimal: totalMonthlySavings < 100,
  };
}

function analyzeToolSpend(entry: ToolEntry, context: AuditInput): ToolRecommendation {
  const toolDef = TOOL_DEFINITIONS[entry.toolId];
  if (!toolDef) throw new Error(`Unknown tool: ${entry.toolId}`);

  const currentPlan = toolDef.plans.find(p => p.id === entry.planId);
  if (!currentPlan) throw new Error(`Unknown plan: ${entry.planId} for ${entry.toolId}`);

  const expectedSpend = currentPlan.pricePerSeat * entry.seats;

  // Rule 1: Team plans for solo/tiny teams
  if (currentPlan.isTeamPlan && entry.seats <= 2 && currentPlan.minSeats && currentPlan.minSeats <= 2) {
    const soloAlternative = toolDef.plans.find(p => !p.isTeamPlan && p.pricePerSeat > 0);
    if (soloAlternative) {
      const projectedSpend = soloAlternative.pricePerSeat * entry.seats;
      const savings = entry.monthlySpend - projectedSpend;
      if (savings > 0) {
        return {
          toolId: entry.toolId,
          toolName: toolDef.name,
          currentPlan: currentPlan.name,
          currentSpend: entry.monthlySpend,
          action: 'downgrade',
          recommendedPlan: soloAlternative.name,
          projectedSpend,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reasoning: `Team plan for ${entry.seats} seat${entry.seats > 1 ? 's' : ''} — ${soloAlternative.name} plan at $${soloAlternative.pricePerSeat}/seat covers the same features for your team size.`,
          confidence: 'high',
        };
      }
    }
  }

  // Rule 2: Overpaying vs expected price (user entered higher than list price)
  if (entry.monthlySpend > expectedSpend * 1.15) {
    return {
      toolId: entry.toolId,
      toolName: toolDef.name,
      currentPlan: currentPlan.name,
      currentSpend: entry.monthlySpend,
      action: 'optimize',
      recommendedPlan: currentPlan.name,
      projectedSpend: expectedSpend,
      monthlySavings: entry.monthlySpend - expectedSpend,
      annualSavings: (entry.monthlySpend - expectedSpend) * 12,
      reasoning: `Your reported spend ($${entry.monthlySpend}/mo) exceeds the list price for this plan ($${expectedSpend}/mo for ${entry.seats} seat${entry.seats > 1 ? 's' : ''}). Review your billing — you may have legacy add-ons or be on an outdated pricing tier.`,
      confidence: 'high',
    };
  }

  // Rule 3: Cursor Business for coding solo dev → switch to Cursor Pro
  if (entry.toolId === 'cursor' && entry.planId === 'business' && entry.seats <= 3 && context.teamSize <= 5) {
    const proPlan = toolDef.plans.find(p => p.id === 'pro')!;
    const projectedSpend = proPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: proPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Cursor Business ($40/seat) adds SSO, admin dashboards, and privacy mode — features a ${context.teamSize}-person team rarely needs. Cursor Pro ($20/seat) covers all coding features. Savings: $${savings}/mo.`,
        confidence: 'high',
      };
    }
  }

  // Rule 4: GitHub Copilot Enterprise for small teams → downgrade to Business
  if (entry.toolId === 'github_copilot' && entry.planId === 'enterprise' && context.teamSize < 25) {
    const bizPlan = toolDef.plans.find(p => p.id === 'business')!;
    const projectedSpend = bizPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: bizPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Copilot Enterprise ($39/seat) adds custom model fine-tuning and PR summaries — worth it at 50+ engineers, overkill for ${context.teamSize} people. Business ($19/seat) covers org management and audit logs.`,
        confidence: 'high',
      };
    }
  }

  // Rule 5: For non-coding use cases, suggest switching from Cursor to Claude Pro
  if (entry.toolId === 'cursor' && context.primaryUseCase !== 'coding' && context.primaryUseCase !== 'mixed') {
    const claudeDef = TOOL_DEFINITIONS['claude'];
    const claudePro = claudeDef.plans.find(p => p.id === 'pro')!;
    const projectedSpend = claudePro.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings >= 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'switch',
        recommendedTool: 'Claude Pro',
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Cursor is optimized for code editing — for ${context.primaryUseCase} work, Claude Pro ($20/seat) offers better performance on your actual use case at the same or lower price.`,
        confidence: 'medium',
      };
    }
  }

  // Rule 6: ChatGPT Enterprise when Team would suffice (< 50 people)
  if (entry.toolId === 'chatgpt' && entry.planId === 'enterprise' && context.teamSize < 50) {
    const teamPlan = toolDef.plans.find(p => p.id === 'team')!;
    const projectedSpend = teamPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: teamPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `ChatGPT Enterprise adds custom data retention policies and dedicated CSM — valuable at 50+ seats. ChatGPT Team at $30/seat gives your ${context.teamSize}-person team shared workspaces and higher limits at a fraction of the cost.`,
        confidence: 'high',
      };
    }
  }

  // Rule 7: Claude Max for writing/mixed use → check if Pro is sufficient
  if (entry.toolId === 'claude' && entry.planId === 'max' && context.primaryUseCase === 'writing') {
    const proPlan = toolDef.plans.find(p => p.id === 'pro')!;
    const projectedSpend = proPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: proPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Claude Max (5x usage) is designed for heavy-volume power users doing data/research. For writing workflows, Claude Pro's usage limits are rarely hit — most writers use under 20% of Pro's allowance. Try Pro for a month.`,
        confidence: 'medium',
      };
    }
  }

  // Rule 8: Midjourney Pro/Mega downgrade to Standard
  if (entry.toolId === 'midjourney' && (entry.planId === 'pro' || entry.planId === 'mega')) {
    const stdPlan = toolDef.plans.find(p => p.id === 'standard')!;
    const projectedSpend = stdPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: stdPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Midjourney Standard ($30/seat) includes 15 hours of Fast GPU time and unlimited relaxed generations, highly sufficient for standard design needs. Save $${savings}/mo by downgrading.`,
        confidence: 'high',
      };
    }
  }

  // Rule 9: Jasper switch to Claude Pro for writing
  if (entry.toolId === 'jasper' && context.primaryUseCase === 'writing') {
    const claudeDef = TOOL_DEFINITIONS['claude'];
    const claudePro = claudeDef?.plans.find(p => p.id === 'pro');
    if (claudePro) {
      const projectedSpend = claudePro.pricePerSeat * entry.seats;
      const savings = entry.monthlySpend - projectedSpend;
      if (savings > 0) {
        return {
          toolId: entry.toolId,
          toolName: toolDef.name,
          currentPlan: currentPlan.name,
          currentSpend: entry.monthlySpend,
          action: 'switch',
          recommendedTool: 'Claude Pro',
          projectedSpend,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reasoning: `Jasper is highly expensive ($${currentPlan.pricePerSeat}/seat) for standard copywriting. Switching to Claude Pro ($20/seat) covers brand voices via Custom Projects while saving $${savings}/mo.`,
          confidence: 'high',
        };
      }
    }
  }

  // Rule 10: Perplexity Enterprise right-sizing
  if (entry.toolId === 'perplexity' && entry.planId === 'enterprise' && context.teamSize < 10) {
    const proPlan = toolDef.plans.find(p => p.id === 'pro')!;
    const projectedSpend = proPlan.pricePerSeat * entry.seats;
    const savings = entry.monthlySpend - projectedSpend;
    if (savings > 0) {
      return {
        toolId: entry.toolId,
        toolName: toolDef.name,
        currentPlan: currentPlan.name,
        currentSpend: entry.monthlySpend,
        action: 'downgrade',
        recommendedPlan: proPlan.name,
        projectedSpend,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reasoning: `Perplexity Enterprise adds SOC2 and admin dashboard capabilities — features small teams under 10 people rarely require. Perplexity Pro ($20/seat) covers all query capabilities.`,
        confidence: 'high',
      };
    }
  }

  // Default: already optimal
  return {
    toolId: entry.toolId,
    toolName: toolDef.name,
    currentPlan: currentPlan.name,
    currentSpend: entry.monthlySpend,
    action: 'keep',
    projectedSpend: entry.monthlySpend,
    monthlySavings: 0,
    annualSavings: 0,
    reasoning: `${toolDef.name} ${currentPlan.name} is well-matched to your team size of ${context.teamSize} and ${context.primaryUseCase} use case. No optimization found.`,
    confidence: 'high',
  };
}

// Detect redundancy: paying for two tools that do the same job
function detectRedundancy(tools: ToolEntry[], useCase: string): ToolRecommendation[] {
  const recs: ToolRecommendation[] = [];
  const hasClaude = tools.find(t => t.toolId === 'claude' && t.planId !== 'free');
  const hasChatGPT = tools.find(t => t.toolId === 'chatgpt' && t.planId !== 'free');

  // Paying for both Claude Pro/Team AND ChatGPT Plus/Team — pick one
  if (hasClaude && hasChatGPT && useCase !== 'mixed') {
    // Recommend keeping Claude (better for writing/research), dropping ChatGPT
    const savings = hasChatGPT.monthlySpend;
    recs.push({
      toolId: 'chatgpt',
      toolName: 'ChatGPT',
      currentPlan: hasChatGPT.planId,
      currentSpend: hasChatGPT.monthlySpend,
      action: 'switch',
      recommendedTool: 'Keep Claude only',
      projectedSpend: 0,
      monthlySavings: savings,
      annualSavings: savings * 12,
      reasoning: `You're paying for both Claude and ChatGPT for ${useCase} work — they overlap significantly. Claude is rated higher for ${useCase} tasks in independent benchmarks. Consolidate to Claude and drop the ChatGPT subscription.`,
      confidence: 'medium',
    });
  }

  return recs;
}
