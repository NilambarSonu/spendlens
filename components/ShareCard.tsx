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
    <GlassCard glowColor="primary" className="max-w-xl mx-auto text-center font-sans">
      <h3 className="text-lg font-bold text-[#0d253d] mb-2 font-sans flex items-center justify-center gap-2">
        <span>📢</span> Share This Audit
      </h3>
      <p className="text-sm text-[#64748d] mb-6 font-sans leading-relaxed">
        Share these findings with your team, founder, or co-founders to align on your AI budget strategy.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {/* Copy Link Button */}
        <button
          onClick={handleCopy}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 border font-semibold py-3 px-6 rounded-full transition-all duration-150 text-sm cursor-pointer focus:outline-none hover:-translate-y-0.5 ${
            copied
              ? 'bg-emerald-50 text-[#10b981] border-emerald-200 shadow-sm'
              : 'bg-white hover:bg-[#f6f9fc] border border-[#a8c3de] text-[#273951]'
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
                className="w-4 h-4 text-[#10b981]"
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
                className="w-4 h-4 text-zinc-400"
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#533afd] hover:bg-[#4434d4] text-white font-semibold py-3 px-6 rounded-full transition-all duration-150 text-sm cursor-pointer shadow-sm hover:-translate-y-0.5 focus:outline-none border-none"
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-[#f6f9fc] border border-[#a8c3de] text-[#1DA1F2] font-semibold py-3 px-6 rounded-full transition-all duration-150 text-sm cursor-pointer focus:outline-none hover:-translate-y-0.5"
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
