export type ToolId =
  | 'cursor'
  | 'github_copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic_api'
  | 'openai_api'
  | 'gemini'
  | 'windsurf'
  | 'midjourney'
  | 'perplexity'
  | 'v0'
  | 'elevenlabs'
  | 'notion_ai'
  | 'deepl'
  | 'jasper';

// Use case categories
export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

// A single tool entry from the user's form
export interface ToolEntry {
  toolId: ToolId;
  planId: string;
  monthlySpend: number;  // What user says they pay
  seats: number;
}

// Form input from user
export interface AuditInput {
  teamSize: number;
  primaryUseCase: UseCase;
  tools: ToolEntry[];
}

// A single recommendation for one tool
export interface ToolRecommendation {
  toolId: ToolId;
  toolName: string;
  currentPlan: string;
  currentSpend: number;
  action: 'downgrade' | 'switch' | 'keep' | 'optimize';
  recommendedPlan?: string;
  recommendedTool?: string;
  projectedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  reasoning: string;  // 1-sentence human-readable reason
  confidence: 'high' | 'medium' | 'low';
}

// Complete audit result
export interface AuditResult {
  id: string;
  publicToken: string;
  input: AuditInput;
  recommendations: ToolRecommendation[];
  totalMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
  createdAt: string;
  isHighSavings: boolean;  // true if savings > $500/mo
  isOptimal: boolean;      // true if savings < $100/mo
}

// Plan definition within a tool
export interface Plan {
  id: string;
  name: string;
  pricePerSeat: number;    // USD per seat per month
  isTeamPlan: boolean;
  minSeats?: number;
  maxSeats?: number;
  bestFor: UseCase[];
  features: string[];
  officialPricingUrl: string;
  verifiedDate: string;    // YYYY-MM-DD
}

// Tool definition
export interface ToolDefinition {
  id: ToolId;
  name: string;
  category: 'code_assistant' | 'llm_chat' | 'llm_api';
  plans: Plan[];
  alternatives: ToolId[];  // Tools that can replace this one
}
