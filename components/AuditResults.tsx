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
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'INR' | 'GBP'>('USD');
  const summaryFetchedRef = useRef(false);

  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, label: 'USD ($)' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR (€)' },
    INR: { symbol: '₹', rate: 83.0, label: 'INR (₹)' },
    GBP: { symbol: '£', rate: 0.79, label: 'GBP (£)' }
  };

  const formatPrice = (amount: number) => {
    const cfg = CURRENCIES[currency];
    return `${cfg.symbol}${Math.round(amount * cfg.rate).toLocaleString()}`;
  };

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
          bg: 'bg-white hover:bg-[#f6f9fc]',
          border: 'border-[#e3e8ee] hover:border-red-200',
          badge: 'bg-red-50 text-red-600 border-red-200',
          label: action === 'downgrade' ? '📉 Downgrade' : '🔄 Switch',
        };
      case 'optimize':
        return {
          bg: 'bg-white hover:bg-[#f6f9fc]',
          border: 'border-[#e3e8ee] hover:border-amber-200',
          badge: 'bg-amber-50 text-amber-750 border-amber-200',
          label: '⚡ Optimize',
        };
      case 'keep':
      default:
        return {
          bg: 'bg-[#f6f9fc]/50 hover:bg-[#f6f9fc]',
          border: 'border-[#e3e8ee] hover:border-[#a8c3de]',
          badge: 'bg-[#e8ebfd] text-[#533afd] border-[#533afd]/10',
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
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-[#533afd] transition-colors focus:outline-none cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 text-zinc-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Form Edit
          </button>
        )}

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-white border border-[#a8c3de] hover:border-[#533afd] text-[#273951] hover:text-[#533afd] px-4.5 py-2.5 rounded-full text-xs font-semibold transition-all duration-150 shadow-sm cursor-pointer hover:-translate-y-0.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-4 h-4 text-[#533afd]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Full Audit CSV
        </button>
      </div>

      {/* Dynamic Billing Controller Capsule */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-5 rounded-xl border border-[#e3e8ee] shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          {/* Billing Terms Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans">
              📅 Billing terms
            </span>
            <div className="relative inline-flex items-center bg-[#f6f9fc] p-1 rounded-full border border-[#e3e8ee]">
              <button
                type="button"
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  !isAnnual ? 'bg-[#533afd] text-white shadow-sm' : 'text-zinc-550 hover:text-[#0d253d]'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isAnnual ? 'bg-[#533afd] text-white shadow-sm' : 'text-zinc-550 hover:text-[#0d253d]'
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Currency Switcher Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-sans">
              🪙 Currency
            </span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'USD' | 'EUR' | 'INR' | 'GBP')}
              className="bg-white border border-[#a8c3de] rounded-md px-3 py-1.5 text-xs font-semibold text-[#273951] hover:text-[#0d253d] transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#533afd]"
            >
              {Object.entries(CURRENCIES).map(([key, cfg]) => (
                <option key={key} value={key} className="bg-white text-[#273951]">
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isAnnual ? (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-zinc-500 font-sans">
              Apply 20% Annual Contract Discount:
            </span>
            <button
              type="button"
              onClick={() => setApplyAnnualDiscount(!applyAnnualDiscount)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                applyAnnualDiscount ? 'bg-[#533afd]' : 'bg-[#e3e8ee]'
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
          <div className="text-xs text-zinc-450 font-sans">
            💡 Switch to <strong className="text-zinc-550">Annual</strong> to model typical SaaS contract discounts
          </div>
        )}
      </div>

      {/* Savings Hero Counter */}
      <SavingsHero
        monthlySavings={isAnnual ? displayTotalSavings / 12 : displayTotalSavings}
        annualSavings={isAnnual ? displayTotalSavings : displayTotalSavings * 12}
        totalSpend={isAnnual ? displayTotalSpend / 12 : displayTotalSpend}
        isOptimal={result.isOptimal}
        currencySymbol={CURRENCIES[currency].symbol}
        currencyRate={CURRENCIES[currency].rate}
      />

      {/* 3D Visual Budget Impact Analyser Graph */}
      {!result.isOptimal && (
        <GlassCard glowColor="subdued" className="md:p-8 relative overflow-hidden bg-white border border-[#e3e8ee] rounded-xl shadow-sm">
          <div className="absolute right-0 top-0 translate-y-[-20%] translate-x-[20%] w-56 h-56 bg-[#e8ebfd]/10 rounded-full blur-3xl pointer-events-none" />
          <h4 className="text-xs font-semibold text-[#533afd] uppercase tracking-wider mb-5 flex items-center gap-2 font-sans">
            <span>📊</span> Visual Budget Optimization Model
          </h4>
          
          <div className="space-y-5">
            {/* Current Spend Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#273951] font-sans">
                <span>Current Stack Spend</span>
                <span className="font-mono font-tabular text-[#0d253d]">{formatPrice(displayTotalSpend)}{isAnnual ? '/yr' : '/mo'}</span>
              </div>
              <div className="h-4 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee] relative">
                <div
                  className="h-full bg-[#0d253d] rounded-full transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Optimized Spend Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#273951] font-sans">
                <span>Optimized Spend (Plan adjustments)</span>
                <span className="font-mono font-tabular text-[#533afd]">{formatPrice(displayProjectedSpend)}{isAnnual ? '/yr' : '/mo'}</span>
              </div>
              <div className="h-4 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee] relative">
                <div
                  className="h-full bg-[#533afd] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(8, 100 - savingsPercentage)}%` }}
                />
              </div>
            </div>

            {/* Reclaimed Budget */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-[#273951] font-sans">
                <span className="flex items-center gap-1.5">
                  Reclaimed Budget <span className="text-[10px] bg-emerald-50 text-[#10b981] border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono font-bold">{savingsPercentage}% Saved</span>
                </span>
                <span className="font-mono font-tabular text-[#10b981]">+{formatPrice(displayTotalSavings)}{isAnnual ? '/yr' : '/mo'} ✨</span>
              </div>
              <div className="h-4 bg-[#f6f9fc] rounded-full overflow-hidden border border-[#e3e8ee] relative">
                <div
                  className="h-full bg-[#10b981] rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(5, savingsPercentage)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-5 text-[10px] text-zinc-400 font-medium font-sans flex items-center gap-1.5 justify-center">
            <span>💡</span> Projections are based on precise real-world seat limits and direct marketplace rates.
          </div>
        </GlassCard>
      )}

      {/* High Spend Startups Scale Offer Callout */}
      {result.isHighSavings && (
        <div className="relative overflow-hidden bg-[#f5e9d4] text-[#0d253d] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e3e8ee]">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 opacity-10 pointer-events-none scale-150">
            💸
          </div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <span className="inline-block px-3 py-1 bg-[#0d253d]/10 text-[#0d253d] text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
                ⚡ Premium Scale Offer
              </span>
              <h3 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-[#0d253d]">
                Unlock up to 40% more savings on premium AI tools
              </h3>
              <p className="text-[#273951] font-sans text-sm md:text-base mt-2 max-w-xl leading-relaxed">
                As a high-spend startup, you can buy bulk tokens and enterprise credits for Cursor, Claude, and OpenAI via <strong className="text-[#0d253d]">Credex</strong> at custom discounted rates.
              </p>
            </div>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0d253d] hover:bg-[#1c1e54] text-white font-semibold px-6 py-3 rounded-full shadow-sm transition-all duration-150 hover:-translate-y-0.5 shrink-0 text-sm md:text-base button-on-dark-pill"
            >
              Get Bulk AI Discounts →
            </a>
          </div>
        </div>
      )}

      {/* Interactive Per-Tool Breakdown */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#0d253d] px-1 font-sans">
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
                className={`flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl border ${styles.bg} ${styles.border} transition-all duration-200 gap-6`}
              >
                <div className="space-y-2 max-w-2xl">
                  {/* Tool name, colorful icon, and action tag */}
                  <div className="flex flex-wrap items-center gap-3">
                    <ToolIcon toolId={rec.toolId} size={24} className="hover:scale-105 transition-transform" />
                    <span className="text-lg font-bold text-[#0d253d] font-sans">{rec.toolName}</span>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase border tracking-wider ${styles.badge}`}>
                      {styles.label}
                    </span>
                    {rec.action !== 'keep' && (
                      <span className="text-xs font-mono text-zinc-400">
                        {rec.currentPlan} ➔ {rec.recommendedPlan || rec.recommendedTool}
                      </span>
                    )}
                  </div>
                  
                  {/* Human readable reasoning */}
                  <p className="text-sm text-[#273951] font-sans leading-relaxed font-light">
                    {rec.reasoning}
                  </p>
                </div>

                {/* Savings summary */}
                <div className="mt-4 md:mt-0 text-left md:text-right shrink-0 bg-[#f6f9fc] p-4 rounded-xl border border-[#e3e8ee] min-w-[140px]">
                  {recSavings > 0 ? (
                    <>
                      <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5 font-sans">
                        {isAnnual ? 'Annual Savings' : 'Monthly Savings'}
                      </p>
                      <p className="text-2xl font-semibold text-[#533afd] font-display font-tabular">
                        {formatPrice(recSavings)}
                        <span className="text-xs font-normal text-zinc-400 font-sans">/{isAnnual ? 'yr' : 'mo'}</span>
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 font-tabular mt-1">
                        paying: {formatPrice(recProj)}/{isAnnual ? 'yr' : 'mo'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-[10px] font-semibold text-[#64748d] uppercase tracking-wider mb-0.5 font-sans">
                        Status
                      </p>
                      <p className="text-base font-bold text-[#f59e0b] font-sans">
                        Optimal Spend
                      </p>
                      <p className="text-[10px] font-mono text-zinc-400 font-tabular mt-1">
                        paying: {formatPrice(recSpend)}/{isAnnual ? 'yr' : 'mo'}
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
      <GlassCard glowColor="primary" className="md:p-8 relative overflow-hidden bg-white border border-[#e3e8ee] rounded-xl shadow-sm">
        <div className="absolute right-0 bottom-0 translate-y-8 translate-x-8 w-40 h-40 bg-[#e8ebfd]/10 rounded-full blur-2xl pointer-events-none" />
        <h4 className="text-xs font-semibold text-[#533afd] uppercase tracking-wider mb-3 font-sans">
          ✨ Gemini AI Analysis Summary
        </h4>

        {loadingSummary ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-100 rounded-full w-full" />
            <div className="h-4 bg-zinc-100 rounded-full w-5/6" />
            <div className="h-4 bg-zinc-100 rounded-full w-4/5" />
          </div>
        ) : (
          <p className="text-[#273951] text-base leading-relaxed mb-0 font-sans font-light">
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
