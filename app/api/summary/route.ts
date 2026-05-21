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
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
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

Generate a 80-100 word personalized audit summary for this startup based on these facts:

Team size: ${auditData.teamSize || auditData.input?.teamSize} people
Primary use case: ${auditData.primaryUseCase || auditData.input?.primaryUseCase}
Current monthly AI spend: $${auditData.totalMonthlySpend}
Identified monthly savings: $${auditData.totalMonthlySavings}
Key recommendations: ${(auditData.recommendations || [])
  .filter((r: { action: string }) => r.action !== 'keep')
  .map((r: { toolName: string; reasoning: string }) => `${r.toolName}: ${r.reasoning}`)
  .slice(0, 3)
  .join('; ')}

Write in second person ("your team", "you're paying"). Be specific about numbers. End with one forward-looking sentence. Do not use bullet points. Plain paragraph only. Keep it professional, premium, and actionable. Do not add markdown styles or bold markers like ** inside the text, just plain text.`
                  }
                ]
              }
            ],
            generationConfig: {
              maxOutputTokens: 150,
              temperature: 0.2
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
      } catch (err: any) {
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

function generateFallbackSummary(auditData: Record<string, any>): string {
  const savings = (auditData.totalMonthlySavings ?? 0) as number;
  const spend = (auditData.totalMonthlySpend ?? 0) as number;
  const teamSize = (auditData.teamSize ?? auditData.input?.teamSize ?? 1) as number;
  const useCase = (auditData.primaryUseCase ?? auditData.input?.primaryUseCase ?? 'mixed') as string;
  
  if (savings < 100) {
    return `Your team of ${teamSize} is spending $${spend}/month on AI tools for ${useCase} work, which is well-optimized. Your current stack is a reasonable fit for your use case and team size. Keep monitoring as your usage scales — new plans and alternatives launch frequently in this space.`;
  }
  return `Your team of ${teamSize} is spending $${spend}/month on AI tools but could save $${savings}/month ($${savings * 12}/year) with the right plan adjustments. The biggest opportunity is right-sizing plans to your actual team size and consolidating overlapping subscriptions. These are straightforward changes that won't affect your team's capabilities.`;
}
