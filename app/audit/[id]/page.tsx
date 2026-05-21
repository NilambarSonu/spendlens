import React from 'react';
import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import AuditResults from '@/components/AuditResults';
import Link from 'next/link';

interface AuditPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Resilient helper to fetch audit data by public token
async function getAuditData(tokenId: string) {
  const isPlaceholderEnv = 
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY.includes('placeholder');

  if (isPlaceholderEnv) {
    // Return mock fallback for testing / static generations
    return {
      id: 'mock-audit-id',
      public_token: tokenId,
      created_at: new Date().toISOString(),
      team_size: 6,
      primary_use_case: 'coding',
      tools: [
        { toolId: 'cursor', planId: 'business', monthlySpend: 160, seats: 4 },
        { toolId: 'chatgpt', planId: 'plus', monthlySpend: 40, seats: 2 }
      ],
      total_monthly_spend: 200,
      total_monthly_savings: 80,
      total_annual_savings: 960,
      recommendations: [
        {
          toolId: 'cursor',
          toolName: 'Cursor',
          currentPlan: 'Business',
          currentSpend: 160,
          action: 'downgrade',
          recommendedPlan: 'Pro',
          projectedSpend: 80,
          monthlySavings: 80,
          annualSavings: 960,
          reasoning: 'Cursor Business plan ($40/seat) features SSO which a 6-person team does not need. Right-size to Pro ($20/seat) to save $80/mo.',
          confidence: 'high'
        }
      ],
      ai_summary: 'Your team of 6 is spending $200/month on AI tools but could save $80/month ($960/year) by downgrading Cursor to Pro. Your tools are otherwise well-sized.'
    };
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('audits')
      .select('id, public_token, created_at, team_size, primary_use_case, tools, total_monthly_spend, total_monthly_savings, total_annual_savings, recommendations, ai_summary')
      .eq('public_token', tokenId)
      .single();

    if (error || !data) {
      console.warn(`Audit with token ${tokenId} not found in Supabase. Returning null.`);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to query Supabase directly:', err);
    return null;
  }
}

export async function generateMetadata({ params }: AuditPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tokenId = resolvedParams.id;
  const audit = await getAuditData(tokenId);

  if (!audit) {
    return {
      title: 'Audit Not Found | SpendLens',
      description: 'The requested AI spend audit could not be located.',
    };
  }

  const savings = Math.round(Number(audit.total_monthly_savings));
  const spend = Math.round(Number(audit.total_monthly_spend));

  return {
    title: `AI Spend Audit — $${savings}/mo savings found | SpendLens`,
    description: `This startup was spending $${spend}/mo on AI subscriptions. SpendLens identified $${savings}/mo in recurring savings. Check the report.`,
    openGraph: {
      title: `AI Spend Audit — $${savings}/mo savings identified`,
      description: `$${spend}/mo current spend · $${savings}/mo savings identified · $${savings * 12}/yr potential savings. View full SpendLens report.`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://spendlens.vercel.app'}/audit/${tokenId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `AI Spend Audit — $${savings}/mo savings found`,
      description: `This team was spending $${spend}/mo on AI tools and identified $${savings}/mo in savings. Run a free audit.`,
    },
  };
}

export default async function AuditPage({ params }: AuditPageProps) {
  const resolvedParams = await params;
  const tokenId = resolvedParams.id;
  const audit = await getAuditData(tokenId);

  if (!audit) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center font-sans text-zinc-100">
        <div className="max-w-md bg-[#121214] p-8 rounded-[28px] border border-zinc-800/80 shadow-2xl">
          <div className="w-16 h-16 bg-danger/10 border border-danger/35 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8 text-danger"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white mb-3 font-display">Audit Report Not Found</h1>
          <p className="text-zinc-450 text-sm mb-6 leading-relaxed">
            The share link you followed is invalid, or the audit record was pruned. Run a new audit to get your custom savings checklist.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-[#c026d3] text-white font-bold py-3.5 px-7 rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300 text-sm cursor-pointer border border-primary/25"
          >
            Start Free Audit
          </Link>
        </div>
      </div>
    );
  }

  // Map database format back to AuditResult type
  const mappedResult = {
    id: audit.id,
    publicToken: audit.public_token,
    input: {
      teamSize: Number(audit.team_size),
      primaryUseCase: audit.primary_use_case as any,
      tools: audit.tools as any[],
    },
    recommendations: audit.recommendations as any[],
    totalMonthlySpend: Number(audit.total_monthly_spend),
    totalMonthlySavings: Number(audit.total_monthly_savings),
    totalAnnualSavings: Number(audit.total_annual_savings),
    aiSummary: audit.ai_summary || undefined,
    createdAt: audit.created_at,
    isHighSavings: Number(audit.total_monthly_savings) > 500,
    isOptimal: Number(audit.total_monthly_savings) < 100,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#09090b] via-[#121214] to-[#09090b] flex flex-col font-sans text-zinc-100 selection:bg-primary/30 selection:text-white">
      {/* Header */}
      <header className="bg-[#09090b]/85 backdrop-blur-lg border-b border-zinc-800/60 py-4 px-6 md:px-12 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/35 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(217,70,239,0.2)]">
              <span className="text-primary text-xl font-black tracking-tighter font-display">S</span>
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight font-display">SpendLens</span>
              <span className="text-[10px] text-zinc-500 font-bold block leading-none tracking-wider font-mono">BY CREDEX</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs md:text-sm font-bold text-accent hover:text-white bg-accent/10 border border-accent/30 rounded-full px-5 py-2.5 hover:bg-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
          >
            📊 Run Your Own Free Audit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-8 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl text-center text-xs text-zinc-450 font-bold tracking-wider font-mono uppercase shadow-sm">
          👀 You are currently viewing a shared spend audit report.
        </div>
        <AuditResults result={mappedResult} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 bg-[#09090b] py-12 px-6 text-center text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>© 2026 SpendLens by Credex. Built with precision for startup efficiency.</p>
          <div className="flex gap-5 font-medium">
            <a href="https://credex.rocks" className="hover:text-primary transition-colors duration-200">
              Credex Homepage
            </a>
            <span className="text-zinc-850">|</span>
            <a href="https://cursor.sh" className="hover:text-primary transition-colors duration-200">
              Cursor
            </a>
            <span className="text-zinc-850">|</span>
            <a href="https://claude.ai" className="hover:text-primary transition-colors duration-200">
              Anthropic Claude
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
