import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { auditId, auditData } = await req.json();

    if (!auditData) {
      return NextResponse.json({ error: 'Audit data required' }, { status: 400 });
    }

    let summary: string;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[Gemini AI Summary] GEMINI_API_KEY is not configured. Generating fallback summary.');
      summary = generateFallbackSummary(auditData);
    } else {
      const startTime = Date.now();
      console.log('[Gemini AI Summary] Requesting live synthesis from Google Gemini API (gemini-2.5-flash)...');
      
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a concise financial advisor specializing in AI tool spend optimization.

Generate a 150-180 word personalized audit summary for this startup based on these facts:

Team size: ${auditData.teamSize || auditData.input?.teamSize} people
Primary use case: ${auditData.primaryUseCase || auditData.input?.primaryUseCase}
Current monthly AI spend: $${auditData.totalMonthlySpend}
Identified monthly savings: $${auditData.totalMonthlySavings}
Key recommendations: ${(auditData.recommendations || [])
  .filter((r: { action: string }) => r.action !== 'keep')
  .map((r: { toolName: string; reasoning: string }) => `${r.toolName}: ${r.reasoning}`)
  .slice(0, 4)
  .join('; ')}

Write in second person ("your team", "you're paying"). Be specific with dollar amounts and tool names. Explain the biggest saving opportunity clearly. End with one forward-looking sentence about what this saves annually. Do not use bullet points or markdown. Plain paragraph text only. No bold markers like ** in the text.`
                  }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.3
            }
          })
        });

        const data = await response.json();
        const duration = Date.now() - startTime;
        
        if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
          summary = data.candidates[0].content.parts[0].text.trim();
          console.log(`[Gemini AI Summary] Successfully generated live summary in ${duration}ms!`);
        } else {
          console.error(`[Gemini AI Summary] Gemini API returned error after ${duration}ms:`, JSON.stringify(data));
          summary = generateFallbackSummary(auditData);
        }
      } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`[Gemini AI Summary] Gemini API runtime error after ${duration}ms. Returning fallback:`, err);
        summary = generateFallbackSummary(auditData);
      }
    }

    // Update audit record in Neon Postgres with the generated summary
    if (auditId && process.env.DATABASE_URL) {
      try {
        await query(
          `UPDATE audits SET ai_summary = $1 WHERE id = $2`,
          [summary, auditId]
        );
      } catch (dbErr) {
        console.error('Failed to update Neon DB summary field:', dbErr);
      }
    }

    return NextResponse.json({ summary });
  } catch (globalErr) {
    console.error('Global summary route error:', globalErr);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface AuditSummaryInput {
  totalMonthlySavings?: number;
  totalMonthlySpend?: number;
  teamSize?: number;
  primaryUseCase?: string;
  input?: {
    teamSize?: number;
    primaryUseCase?: string;
  };
}

function generateFallbackSummary(auditData: AuditSummaryInput): string {
  const savings = (auditData.totalMonthlySavings ?? 0) as number;
  const spend = (auditData.totalMonthlySpend ?? 0) as number;
  const teamSize = (auditData.teamSize ?? auditData.input?.teamSize ?? 1) as number;
  const useCase = (auditData.primaryUseCase ?? auditData.input?.primaryUseCase ?? 'mixed') as string;
  
  if (savings < 100) {
    return `Your team of ${teamSize} is spending $${spend}/month on AI tools for ${useCase} work, which is well-optimized. Your current stack is a reasonable fit for your use case and team size. Keep monitoring as your usage scales — new plans and alternatives launch frequently in this space.`;
  }
  return `Your team of ${teamSize} is spending $${spend}/month on AI tools but could save $${savings}/month ($${savings * 12}/year) with the right plan adjustments. The biggest opportunity is right-sizing plans to your actual team size and consolidating overlapping subscriptions. These are straightforward changes that won't affect your team's capabilities.`;
}
