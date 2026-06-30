'use client';

import React from 'react';

interface SavingsHeroProps {
  monthlySavings: number;
  annualSavings: number;
  totalSpend: number;
  isOptimal: boolean;
  currencySymbol?: string;
  currencyRate?: number;
}

export default function SavingsHero({
  monthlySavings,
  annualSavings,
  totalSpend,
  isOptimal,
  currencySymbol = '$',
  currencyRate = 1.0,
}: SavingsHeroProps) {
  const formatVal = (val: number) => {
    return `${currencySymbol}${Math.round(val * currencyRate).toLocaleString()}`;
  };

  if (isOptimal) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8ebfd]/40 via-white to-white text-[#0d253d] p-8 md:p-12 shadow-sm border border-[#e3e8ee] text-center">
        {/* Subtle decorative wash */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#e8ebfd]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#f5e9d4]/10 rounded-full blur-3xl pointer-events-none" />
        
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#10b981] border border-emerald-200 mb-6 uppercase tracking-wider">
          ✨ Stack Optimized
        </span>
        
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 font-sans text-[#0d253d]">
          Your AI stack is already highly optimized!
        </h2>
        
        <p className="max-w-xl mx-auto text-[#273951] text-base md:text-lg mb-0 font-sans">
          Excellent work. Your monthly spend of <strong className="text-[#533afd] font-tabular">{formatVal(totalSpend)}</strong> is perfectly aligned with your team size and use case. Keep monitoring as your usage scales.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e8ebfd]/20 via-white to-white text-[#0d253d] p-8 md:p-12 shadow-sm border border-[#e3e8ee]">
      {/* Subtle decorative wash */}
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#e8ebfd]/30 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-[#fde8d7]/20 rounded-full blur-3xl pointer-events-none" />
 
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-[#e8ebfd] text-[#533afd] border border-[#533afd]/20 mb-6 uppercase tracking-wider">
            📈 High Savings Unlocked
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-3 font-display leading-tight text-[#0d253d]">
            See where your budget is <span className="text-[#533afd] font-semibold">leaking</span>.
          </h2>
          <p className="text-[#273951] text-base md:text-lg max-w-lg font-sans font-light leading-relaxed">
            We found simple plan changes and subscription consolidation that could reduce your spend by <strong className="text-[#533afd] font-tabular font-semibold">{Math.round((monthlySavings / (totalSpend || 1)) * 100)}%</strong>.
          </p>
        </div>
 
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 bg-[#f6f9fc] p-6 md:p-8 rounded-xl border border-[#e3e8ee] backdrop-blur-sm shadow-inner min-w-[280px] sm:min-w-[360px] justify-around">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-semibold text-[#64748d] tracking-wider uppercase mb-1 font-sans">
              Monthly Savings
            </p>
            <p className="text-4xl md:text-5xl font-light text-[#533afd] tracking-tight font-display font-tabular">
              {formatVal(monthlySavings)}
              <span className="text-base font-normal text-zinc-400 font-sans">/mo</span>
            </p>
            <p className="text-xs text-zinc-400 mt-2 font-mono font-tabular">
              Current: {formatVal(totalSpend)}/mo
            </p>
          </div>
 
          <div className="hidden sm:block w-[1px] bg-[#e3e8ee] self-stretch" />
 
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-semibold text-[#64748d] tracking-wider uppercase mb-1 font-sans">
              Annual Savings
            </p>
            <p className="text-4xl md:text-5xl font-light text-[#ea2261] tracking-tight font-display font-tabular animate-pulse-subtle">
              {formatVal(annualSavings)}
              <span className="text-base font-normal text-zinc-400 font-sans">/yr</span>
            </p>
            <p className="text-xs text-zinc-400 mt-2 font-mono">
              Direct drop-in value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
