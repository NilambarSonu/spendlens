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
      <div className="relative overflow-hidden rounded-3xl bg-[#121214]/80 backdrop-blur-xl text-white p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-zinc-800/80 text-center">
        {/* Subtle decorative fuchsia and cyan glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#D946EF]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#22D3EE]/5 rounded-full blur-3xl pointer-events-none" />
        
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 mb-6 uppercase tracking-wider">
          ✨ Stack Optimized
        </span>
        
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent font-sans">
          Your AI stack is already highly optimized!
        </h2>
        
        <p className="max-w-xl mx-auto text-zinc-400 text-base md:text-lg mb-0 font-sans">
          Excellent work. Your monthly spend of <strong className="text-[#22D3EE] font-mono">{formatVal(totalSpend)}</strong> is perfectly aligned with your team size and use case. Keep monitoring as your usage scales.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#121214]/80 backdrop-blur-xl text-white p-8 md:p-12 shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-zinc-800/80">
      {/* Dynamic gradients for wow factor */}
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-[#D946EF]/15 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-[#22D3EE]/10 rounded-full blur-3xl pointer-events-none" />
 
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-mono font-semibold bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/20 mb-6 uppercase tracking-wider">
            📈 High Savings Unlocked
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 font-sans leading-tight">
            See where your budget is <span className="bg-gradient-to-r from-[#D946EF] to-[#22D3EE] bg-clip-text text-transparent">leaking</span>.
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-lg font-sans">
            We found simple plan changes and subscription consolidation that could reduce your spend by <strong className="text-[#22D3EE] font-mono">{Math.round((monthlySavings / (totalSpend || 1)) * 100)}%</strong>.
          </p>
        </div>
 
        <div className="flex flex-col sm:flex-row gap-6 md:gap-8 bg-zinc-950/60 p-6 md:p-8 rounded-2xl border border-zinc-800/80 backdrop-blur-sm shadow-inner min-w-[280px] sm:min-w-[360px] justify-around">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase mb-1 font-sans">
              Monthly Savings
            </p>
            <p className="text-4xl md:text-5xl font-black text-[#22D3EE] tracking-tight font-sans">
              {formatVal(monthlySavings)}
              <span className="text-base font-normal text-zinc-500">/mo</span>
            </p>
            <p className="text-xs text-zinc-500 mt-2 font-mono">
              Current: {formatVal(totalSpend)}/mo
            </p>
          </div>
 
          <div className="hidden sm:block w-[1px] bg-zinc-800/80 self-stretch" />
 
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-bold text-zinc-500 tracking-wider uppercase mb-1 font-sans">
              Annual Savings
            </p>
            <p className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#22D3EE] to-[#FACC15] bg-clip-text text-transparent tracking-tight font-sans animate-pulse-subtle">
              {formatVal(annualSavings)}
              <span className="text-base font-normal text-zinc-500">/yr</span>
            </p>
            <p className="text-xs text-zinc-500 mt-2 font-mono">
              Direct drop-in value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

