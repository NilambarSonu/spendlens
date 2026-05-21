import React, { useState } from 'react';
import GlassCard from './GlassCard';

interface LeadCaptureProps {
  auditId: string;
  publicToken: string;
  totalMonthlySavings: number;
  onSuccess: () => void;
}

export default function LeadCapture({
  auditId,
  publicToken,
  totalMonthlySavings,
  onSuccess,
}: LeadCaptureProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError('Please provide a valid email address.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          publicToken,
          email,
          companyName,
          role,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save lead');
      }

      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      console.error('Lead Capture submission error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <GlassCard glowColor="emerald" className="text-center max-w-xl mx-auto font-sans">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 animate-pulse-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6 text-emerald-400"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-zinc-100 mb-2 font-sans">Audit Saved Successfully!</h4>
        <p className="text-sm text-zinc-400 mb-0 font-sans leading-relaxed">
          Check your inbox. We have dispatched a summary of your results and your custom dashboard link.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard glowColor="fuchsia" className="max-w-xl mx-auto font-sans">
      <h3 className="text-lg font-bold text-zinc-200 mb-2 font-sans flex items-center gap-2">
        <span>📬</span> Save Your Custom Savings Report
      </h3>
      <p className="text-sm text-zinc-500 mb-6 font-sans leading-relaxed">
        Enter your details to save your audit, receive optimization notifications when tool list prices drop, and get this audit via email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-email" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
            Email Address <span className="text-[#D946EF] font-sans">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            required
            placeholder="ceo@yourstartup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#D946EF]/20 focus:border-[#D946EF] transition-all font-sans"
          />
        </div>

        {/* Two column grid for optional parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lead-company" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Company Name
            </label>
            <input
              id="lead-company"
              type="text"
              placeholder="VibeCode Inc"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#D946EF]/20 focus:border-[#D946EF] transition-all font-sans"
            />
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="lead-role" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
              Your Role
            </label>
            <input
              id="lead-role"
              type="text"
              placeholder="Founder / CTO"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#D946EF]/20 focus:border-[#D946EF] transition-all font-sans"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-semibold text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-3 animate-pulse-subtle">
            ⚠️ {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center bg-gradient-to-r from-[#D946EF] to-[#A21CAF] hover:from-[#C026D3] hover:to-[#8B1D9F] text-white font-bold py-3 px-6 rounded-full shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:shadow-[0_0_35px_rgba(217,70,239,0.35)] cursor-pointer transition-all duration-300 text-sm hover:-translate-y-0.5 focus:outline-none ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            'Save Audit & Get Report'
          )}
        </button>
      </form>
    </GlassCard>
  );
}

