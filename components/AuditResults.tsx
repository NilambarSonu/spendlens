'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { AuditResult } from '@/types';
import SavingsHero from './SavingsHero';
import LeadCapture from './LeadCapture';
import ShareCard from './ShareCard';
import { ToolIcon } from './ToolIcons';
import GlassCard from './GlassCard';

interface AuditResultsProps {
  result: AuditResult;
  onBackToForm?: () => void;
}

// A summary is "truncated" if it's too short or doesn't end with sentence-ending punctuation
function isTruncated(s: string | undefined | null): boolean {
  if (!s) return true;
  const trimmed = s.trim();
  if (trimmed.length < 150) return true;
  const lastChar = trimmed[trimmed.length - 1];
  return ![ '.', '!', '?' ].includes(lastChar);
}

export default function AuditResults({ result, onBackToForm }: AuditResultsProps) {
  const needsRegen = isTruncated(result.aiSummary);
  const [aiSummary, setAiSummary] = useState<string | null>(
    needsRegen ? null : (result.aiSummary || null)
  );
  const [loadingSummary, setLoadingSummary] = useState<boolean>(needsRegen || !result.aiSummary);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [applyAnnualDiscount, setApplyAnnualDiscount] = useState<boolean>(true);
  const summaryFetchedRef = useRef(false);

  // Fetch AI summary on mount if missing or truncated
  useEffect(() => {
    if (!needsRegen && result.aiSummary && !summaryFetchedRef.current) return;
    if (summaryFetchedRef.current) return;
    
    const fetchSummary = async () => {
      summaryFetchedRef.current = true;
      setLoadingSummary(true);
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            auditId: result.id,
            auditData: {
              teamSize: result.input.teamSize,
              primaryUseCase: result.input.primaryUseCase,
              totalMonthlySpend: result.totalMonthlySpend,
              totalMonthlySavings: result.totalMonthlySavings,
              recommendations: result.recommendations,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAiSummary(data.summary);
        } else {
          throw new Error('Failed to generate summary');
        }
      } catch (err) {
        console.error('Summary API fail, falling back to local description:', err);
        // Local fallback
        const teamSize = result.input.teamSize;
        const spend = result.totalMonthlySpend;
        const savings = result.totalMonthlySavings;
        const useCase = result.input.primaryUseCase;

        if (result.isOptimal) {
          setAiSummary(
            `Your team of ${teamSize} is spending $${spend}/month on AI tools for ${useCase} work, which is well-optimized. Your current stack is a reasonable fit for your use case and team size. Keep monitoring as your usage scales — new plans and alternatives launch frequently in this space.`
          );
        } else {
          setAiSummary(
            `Your team of ${teamSize} is spending $${spend}/month on AI tools but could save $${savings}/month ($${
              savings * 12
            }/year) with the right plan adjustments. The biggest opportunity is right-sizing plans to your actual team size and consolidating overlapping subscriptions. These are straightforward changes that won't affect your team's capabilities.`
          );
        }
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [result, needsRegen]);

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'downgrade':
      case 'switch':
        return {
          bg: 'bg-zinc-900/30 hover:bg-zinc-900/50',
          border: 'border-red-950/50 hover:border-red-900/50',
          badge: 'bg-red-950/60 text-red-400 border-red-900/40',
          label: action === 'downgrade' ? '📉 Downgrade' : '🔄 Switch',
        };
      case 'optimize':
        return {
          bg: 'bg-zinc-900/30 hover:bg-zinc-900/50',
          border: 'border-amber-950/50 hover:border-amber-900/50',
          badge: 'bg-amber-950/60 text-amber-400 border-amber-900/40',
          label: '⚡ Optimize',
        };
      case 'keep':
      default:
        return {
          bg: 'bg-zinc-900/20 hover:bg-zinc-900/35',
          border: 'border-zinc-800/80 hover:border-zinc-700/80',
          badge: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60',
          label: '✅ Optimal',
        };
    }
  };

  // Calculations for dynamic billing options
  const multiplier = isAnnual ? 12 : 1;
  const annualDiscountFactor = (isAnnual && applyAnnualDiscount) ? 0.8 : 1.0;

  const displayTotalSpend = result.totalMonthlySpend * multiplier;
  
  const displayTotalSavings = result.recommendations.reduce((sum, rec) => {
    const current = rec.currentSpend * multiplier;
    // Apply 20% annual contract discount to optimized plans if toggle active
    const projected = rec.projectedSpend * multiplier * (rec.action !== 'keep' ? annualDiscountFactor : (applyAnnualDiscount && isAnnual ? 0.8 : 1.0));
    return sum + (current - projected);
  }, 0);

  const displayProjectedSpend = Math.max(0, displayTotalSpend - displayTotalSavings);
  const savingsPercentage = displayTotalSpend > 0 ? Math.round((displayTotalSavings / displayTotalSpend) * 100) : 0;

  // CSV Report Generator
  const handleExportCSV = () => {
    const headers = [
      'AI Tool',
      'Current Plan',
      'Seats',
      'Reported Monthly Spend ($)',
      'Recommended Action',
      'Recommended Plan/Tool',
      'Projected Monthly Spend ($)',
      'Monthly Savings ($)',
      'Annual Savings ($)',
      'Optimization Details'
    ];

    const rows = result.recommendations.map(rec => {
      const seats = result.input.tools.find(t => t.toolId === rec.toolId)?.seats || 1;
      return [
        rec.toolName,
        rec.currentPlan,
        seats,
        rec.currentSpend,
        rec.action.toUpperCase(),
        rec.recommendedPlan || rec.recommendedTool || 'Keep Current',
        rec.projectedSpend,
        rec.monthlySavings,
        rec.annualSavings,
        `"${rec.reasoning.replace(/"/g, '""')}"`
      ];
    });

    const summaryRows = [
      ['SpendLens AI Subscription Audit Report'],
      [`Generated: ${new Date().toLocaleDateString()}`],
      [`Team Size: ${result.input.teamSize} seats`],
      [`Primary Use Case: ${result.input.primaryUseCase.toUpperCase()}`],
      [`Total Current Monthly Spend: $${result.totalMonthlySpend}`],
      [`Total Projected Monthly Savings: $${result.totalMonthlySavings}`],
      [`Total Projected Annual Savings: $${result.totalAnnualSavings}`],
      [''],
    ];

    const csvString = [
      ...summaryRows.map(row => row.join(',')),
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SpendLens_Audit_Report_${result.id.slice(0, 8)}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-pulse-subtle [animation-duration:1s] [animation-iteration-count:1]">
      {/* Action Header bar with back button & export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {onBackToForm && (
          <button
            onClick={onBackToForm}
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 text-zinc-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Form Edit
          </button>
        )}

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-[#18181b]/60 border border-zinc-800 hover:border-zinc-700/80 text-zinc-300 hover:text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md cursor-pointer hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 text-[#D946EF]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Full Audit CSV
        </button>
      </div>

      {/* Dynamic Billing Controller Capsule */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121214]/65 backdrop-blur-xl p-5 rounded-3xl border border-zinc-800/80 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-mono">
            📅 Billing terms
          </span>
          <div className="relative inline-flex items-center bg-zinc-950 p-1 rounded-full border border-zinc-800/80">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                !isAnnual ? 'bg-[#D946EF] text-white shadow-lg toggle-glow' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                isAnnual ? 'bg-[#D946EF] text-white shadow-lg toggle-glow' : 'text-zinc-550 hover:text-zinc-300'
              }`}
            >
              Annual
            </button>
          </div>
        </div>

        {isAnnual ? (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-zinc-400 font-sans">
              Apply 20% Annual Contract Discount:
            </span>
            <button
              type="button"
              onClick={() => setApplyAnnualDiscount(!applyAnnualDiscount)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                applyAnnualDiscount ? 'bg-[#22D3EE]' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  applyAnnualDiscount ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ) : (
          <div className="text-xs text-zinc-500 font-medium font-sans">
            💡 Switch to <strong className="text-zinc-400">Annual</strong> to model typical SaaS contract discounts
          </div>
        )}
      </div>

      {/* Savings Hero Counter */}
      <SavingsHero
        monthlySavings={isAnnual ? displayTotalSavings / 12 : displayTotalSavings}
        annualSavings={isAnnual ? displayTotalSavings : displayTotalSavings * 12}
        totalSpend={isAnnual ? displayTotalSpend / 12 : displayTotalSpend}
        isOptimal={result.isOptimal}
      />

      {/* 3D Visual Budget Impact Analyser Graph */}
      {!result.isOptimal && (
        <GlassCard glowColor="cyan" className="md:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-y-[-20%] translate-x-[20%] w-56 h-56 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />
          <h4 className="text-xs font-mono font-bold text-[#22D3EE] uppercase tracking-wider mb-5 flex items-center gap-2">
            <span>📊</span> Visual Budget Optimization Model
          </h4>
          
          <div className="space-y-5">
            {/* Current Spend Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-300 font-sans">
                <span>Current Stack Spend</span>
                <span className="font-mono text-zinc-400">${Math.round(displayTotalSpend)}{isAnnual ? '/yr' : '/mo'}</span>
              </div>
              <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60 relative">
                <div
                  className="h-full bg-gradient-to-r from-[#8B1D9F] to-[#D946EF] rounded-full shadow-[0_0_12px_rgba(217,70,239,0.3)] transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Optimized Spend Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-300 font-sans">
                <span>Optimized Spend (Plan adjustments)</span>
                <span className="font-mono text-[#22D3EE]">${Math.round(displayProjectedSpend)}{isAnnual ? '/yr' : '/mo'}</span>
              </div>
              <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60 relative">
                <div
                  className="h-full bg-gradient-to-r from-[#0E7490] to-[#22D3EE] rounded-full shadow-[0_0_12px_rgba(34,211,238,0.3)] transition-all duration-500"
                  style={{ width: `${Math.max(8, 100 - savingsPercentage)}%` }}
                />
              </div>
            </div>

            {/* Reclaimed Budget */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-zinc-350 font-sans">
                <span className="flex items-center gap-1.5">
                  Reclaimed Budget <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-900/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">{savingsPercentage}% Saved</span>
                </span>
                <span className="font-mono text-[#22C55E]">+${Math.round(displayTotalSavings)}{isAnnual ? '/yr' : '/mo'} ✨</span>
              </div>
              <div className="h-4 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/60 relative">
                <div
                  className="h-full bg-gradient-to-r from-[#15803D] to-[#22C55E] rounded-full shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all duration-500"
                  style={{ width: `${Math.max(5, savingsPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 text-[10px] text-zinc-500 font-medium font-sans flex items-center gap-1.5 justify-center">
            <span>💡</span> Projections are based on precise real-world seat limits and direct marketplace rates.
          </div>
        </GlassCard>
      )}

      {/* High Spend Startups Scale Offer Callout */}
      {result.isHighSavings && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#22D3EE] to-[#D946EF] text-zinc-950 rounded-3xl p-6 md:p-8 shadow-lg border border-cyan-400/20">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none scale-150">
            💸
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-zinc-950/20 text-zinc-950 text-xs font-mono font-bold rounded-full uppercase tracking-wider mb-3">
                ⚡ Premium Scale Offer
              </span>
              <h3 className="text-xl md:text-2xl font-black font-sans tracking-tight">
                Unlock up to 40% more savings on premium AI tools
              </h3>
              <p className="text-zinc-900 font-sans font-medium text-sm md:text-base mt-2 max-w-xl leading-relaxed">
                As a high-spend startup, you can buy bulk tokens and enterprise credits for Cursor, Claude, and OpenAI via <strong className="text-zinc-950">Credex</strong> at custom discounted rates.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-950 hover:bg-zinc-900 text-white font-bold px-6 py-3.5 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5 shrink-0 text-sm md:text-base"
            >
              Get Bulk AI Discounts →
            </a>
          </div>
        </div>
      )}

      {/* Interactive Per-Tool Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-200 px-1 font-sans">
          📊 Per-Tool Subscription Audits
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {result.recommendations.map((rec) => {
            const styles = getActionStyles(rec.action);
            
            // Scaled metrics per tool
            const recSpend = rec.currentSpend * multiplier;
            const recProj = rec.projectedSpend * multiplier * (rec.action !== 'keep' ? annualDiscountFactor : (applyAnnualDiscount && isAnnual ? 0.8 : 1.0));
            const recSavings = Math.max(0, recSpend - recProj);

            return (
              <div
                key={rec.toolId}
                className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl border ${styles.bg} ${styles.border} transition-all duration-300 gap-6`}
              >
                <div className="space-y-2 max-w-2xl">
                  {/* Tool name, colorful icon, and action tag */}
                  <div className="flex flex-wrap items-center gap-3">
                    <ToolIcon toolId={rec.toolId} size={24} className="hover:scale-115 transition-transform" />
                    <span className="text-lg font-black text-zinc-100 font-sans">{rec.toolName}</span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border tracking-wider ${styles.badge}`}>
                      {styles.label}
                    </span>
                    {rec.action !== 'keep' && (
                      <span className="text-xs font-mono text-zinc-500">
                        {rec.currentPlan} ➔ {rec.recommendedPlan || rec.recommendedTool}
                      </span>
                    )}
                  </div>
                  
                  {/* Human readable reasoning */}
                  <p className="text-sm text-zinc-400 font-medium leading-relaxed font-sans">
                    {rec.reasoning}
                  </p>
                </div>

                {/* Savings summary */}
                <div className="mt-4 md:mt-0 text-left md:text-right shrink-0 bg-zinc-950/50 backdrop-blur-sm p-4 rounded-xl border border-zinc-800/80 min-w-[140px]">
                  {recSavings > 0 ? (
                    <>
                      <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                        {isAnnual ? 'Annual Savings' : 'Monthly Savings'}
                      </p>
                      <p className="text-2xl font-black text-[#22D3EE] font-sans">
                        ${Math.round(recSavings)}
                        <span className="text-xs font-normal text-zinc-500">/{isAnnual ? 'yr' : 'mo'}</span>
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 font-medium mt-1">
                        {isAnnual ? `paying: $${Math.round(recProj)}/yr` : `paying: $${Math.round(recProj)}/mo`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider mb-0.5">
                        Status
                      </p>
                      <p className="text-base font-extrabold text-[#FACC15] font-sans">
                        Optimal Spend
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500 font-medium mt-1">
                        paying: ${Math.round(recSpend)}/{isAnnual ? 'yr' : 'mo'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Summary Block */}
      <GlassCard glowColor="fuchsia" className="md:p-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 w-40 h-40 bg-[#D946EF]/5 rounded-full blur-2xl pointer-events-none" />
        <h4 className="text-xs font-mono font-bold text-[#D946EF] uppercase tracking-wider mb-3">
          ✨ Gemini AI Analysis Summary
        </h4>

        {loadingSummary ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-800/50 rounded-full w-full" />
            <div className="h-4 bg-zinc-800/50 rounded-full w-5/6" />
            <div className="h-4 bg-zinc-800/50 rounded-full w-4/5" />
          </div>
        ) : (
          <p className="text-zinc-300 text-base leading-relaxed mb-0 font-medium font-sans">
            {aiSummary}
          </p>
        )}
      </GlassCard>

      {/* Lead Capture and Share Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <LeadCapture
          auditId={result.id}
          publicToken={result.publicToken}
          totalMonthlySavings={result.totalMonthlySavings}
          onSuccess={() => {}}
        />
        <ShareCard
          publicToken={result.publicToken}
          totalMonthlySavings={result.totalMonthlySavings}
        />
      </div>
    </div>
  );
}

