import React from 'react';
import { Metadata } from 'next';
import { query } from '@/lib/db';
import AuditResults from '@/components/AuditResults';
import Link from 'next/link';
import { UseCase, ToolEntry, ToolRecommendation } from '@/types';

interface AuditPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Fetch audit data directly from Neon DB using the public token
async function getAuditData(tokenId: string) {
  try {
    const res = await query(
      `SELECT 
        id, 
        public_token, 
        created_at, 
        team_size, 
        primary_use_case, 
        tools, 
        total_monthly_spend, 
        total_monthly_savings, 
        total_annual_savings, 
        recommendations, 
        ai_summary 
      FROM audits 
      WHERE public_token = $1`,
      [tokenId]
    );

    if (!res || res.rowCount === 0) {
      console.warn(`Audit with token ${tokenId} not found in Neon DB.`);
      return null;
    }

    const row = res.rows[0];
    return {
      id: row.id,
      public_token: row.public_token,
      created_at: row.created_at,
      team_size: Number(row.team_size),
      primary_use_case: row.primary_use_case,
      tools: typeof row.tools === 'string' ? JSON.parse(row.tools) : row.tools,
      total_monthly_spend: Number(row.total_monthly_spend),
      total_monthly_savings: Number(row.total_monthly_savings),
      total_annual_savings: Number(row.total_annual_savings),
      recommendations: typeof row.recommendations === 'string'
        ? JSON.parse(row.recommendations)
        : row.recommendations,
      ai_summary: row.ai_summary || null,
    };
  } catch (err) {
    console.error('Failed to query Neon DB for audit:', err);
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

  const savings = Math.round(audit.total_monthly_savings);
  const spend = Math.round(audit.total_monthly_spend);

  return {
    title: `AI Spend Audit — $${savings}/mo savings found | SpendLens`,
    description: `This startup was spending $${spend}/mo on AI subscriptions. SpendLens identified $${savings}/mo in recurring savings. Check the report.`,
    openGraph: {
      title: `AI Spend Audit — $${savings}/mo savings identified`,
      description: `$${spend}/mo current spend · $${savings}/mo savings identified · $${savings * 12}/yr potential savings. View full SpendLens report.`,
      type: 'website',
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://spendlens.nilambarsonu.me'}/audit/${tokenId}`,
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
      <div className="min-h-screen bg-[#f6f9fc] flex flex-col items-center justify-center p-6 text-center font-sans text-[#0d253d]">
        <div className="max-w-md bg-white p-8 rounded-xl border border-[#e3e8ee] shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_10px]">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-8 h-8 text-red-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[#0d253d] mb-3">Audit Report Not Found</h1>
          <p className="text-zinc-500 text-sm mb-6 leading-relaxed">
            The share link you followed is invalid, or the audit record has expired. Run a new audit to get your custom savings report.
          </p>
          <Link
            href="/"
            className="button-primary-pill text-sm shadow-sm"
          >
            Start Free Audit
          </Link>
        </div>
      </div>
    );
  }

  // If stored summary is truncated (too short / no ending punctuation), clear it so
  // the client-side component triggers a fresh full-length Gemini generation.
  function isSummaryComplete(s: string | null): boolean {
    if (!s || s.trim().length < 150) return false;
    const last = s.trim().slice(-1);
    return ['.', '!', '?'].includes(last);
  }

  const storedSummary = audit.ai_summary;
  const cleanSummary = isSummaryComplete(storedSummary) ? storedSummary : undefined;

  // Map database row to AuditResult type expected by AuditResults component
  const mappedResult = {
    id: audit.id,
    publicToken: audit.public_token,
    input: {
      teamSize: audit.team_size,
      primaryUseCase: audit.primary_use_case as UseCase,
      tools: audit.tools as ToolEntry[],
    },
    recommendations: audit.recommendations as ToolRecommendation[],
    totalMonthlySpend: audit.total_monthly_spend,
    totalMonthlySavings: audit.total_monthly_savings,
    totalAnnualSavings: audit.total_annual_savings,
    // Only pass summary if it's complete — otherwise client will regenerate via Gemini
    aiSummary: cleanSummary,
    createdAt: audit.created_at,
    isHighSavings: audit.total_monthly_savings > 500,
    isOptimal: audit.total_monthly_savings < 100,
  };

  return (
    <div className="min-h-screen bg-[#f6f9fc] flex flex-col font-sans text-[#0d253d] selection:bg-[#533afd]/20 selection:text-[#0d253d]">
      {/* Header */}
      <header className="bg-white/80 py-5 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md border-b border-[#e3e8ee]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#533afd] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white text-xl font-bold tracking-tighter select-none font-display">S</span>
            </div>
            <div>
              <span className="font-bold text-[#0d253d] text-lg tracking-tight font-display">SpendLens</span>
              <span className="text-[9px] text-[#64748d] font-bold block leading-none tracking-wider font-mono">BY CREDEX</span>
            </div>
          </Link>
          <Link
            href="/"
            className="button-primary-pill text-xs md:text-sm shadow-sm"
          >
            📊 Run Your Own Free Audit
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="mb-8 bg-[#f5e9d4] border border-[#e3e8ee] p-4 rounded-xl text-center text-xs text-[#0d253d] font-semibold tracking-wider font-sans uppercase shadow-sm">
          👀 You are viewing a shared AI spend audit report
        </div>
        <AuditResults result={mappedResult} />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e3e8ee] bg-[#ffffff] py-16 px-6 text-center text-xs text-[#64748d]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <p>© 2026 SpendLens by Credex. Built with precision for startup efficiency.</p>
          <div className="flex gap-5 font-medium">
            <a href="https://credex.rocks" className="hover:text-[#533afd] transition-colors duration-200">
              Credex Homepage
            </a>
            <span className="text-[#e3e8ee]">|</span>
            <a href="https://cursor.sh" className="hover:text-[#533afd] transition-colors duration-200">
              Cursor
            </a>
            <span className="text-[#e3e8ee]">|</span>
            <a href="https://claude.ai" className="hover:text-[#533afd] transition-colors duration-200">
              Anthropic Claude
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
