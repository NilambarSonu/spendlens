import React, { useState } from 'react';
import GlassCard from './GlassCard';

interface ShareCardProps {
  publicToken: string;
  totalMonthlySavings: number;
}

export default function ShareCard({ publicToken, totalMonthlySavings }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/audit/${publicToken}`;
    }
    return `https://spendlens.vercel.app/audit/${publicToken}`;
  };

  const handleCopy = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy to clipboard:', e);
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    const title = `AI Spend Audit — $${Math.round(totalMonthlySavings)}/mo savings found!`;
    const text = `I just audited our startup's AI spend using SpendLens. We found $${Math.round(totalMonthlySavings)}/mo in potential savings! Check out our report or run your own.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        console.warn('Web Share failed or cancelled:', err);
      }
    } else {
      // Fallback: Copy link and alert
      handleCopy();
    }
  };

  return (
    <GlassCard glowColor="cyan" className="max-w-xl mx-auto text-center font-sans">
      <h3 className="text-lg font-bold text-zinc-200 mb-2 font-sans flex items-center justify-center gap-2">
        <span>📢</span> Share This Audit
      </h3>
      <p className="text-sm text-zinc-500 mb-6 font-sans leading-relaxed">
        Share these findings with your team, founder, or co-founders to align on your AI budget strategy.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 border font-bold py-3 px-6 rounded-full transition-all duration-300 text-sm cursor-pointer focus:outline-none hover:-translate-y-0.5 ${
            copied
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300'
          }`}
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-4 h-4 text-emerald-400"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Link Copied!
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-zinc-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                />
              </svg>
              Copy Audit Link
            </>
          )}
        </button>

        {/* Dynamic Web Share */}
        <button
          onClick={handleShare}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#D946EF] hover:bg-[#C026D3] text-white font-bold py-3 px-6 rounded-full transition-all duration-300 text-sm cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.25)] hover:-translate-y-0.5 focus:outline-none border-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935-2.186 2.25 2.25 0 00-3.935 2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
            />
          </svg>
          Share Report
        </button>

        {/* X/Twitter direct button */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `Our team audited our AI tool subscriptions and found $${Math.round(
              totalMonthlySavings
            )}/mo in potential savings with SpendLens! Check out the audit: ${getShareUrl()}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 text-[#1DA1F2] font-bold py-3 px-6 rounded-full transition-all duration-300 text-sm cursor-pointer focus:outline-none hover:-translate-y-0.5"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Post to X
        </a>
      </div>
    </GlassCard>
  );
}
