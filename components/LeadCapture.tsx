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
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      console.error('Lead Capture submission error:', err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <GlassCard glowColor="emerald" className="text-center max-w-xl mx-auto font-sans">
        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 animate-pulse-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="w-6 h-6 text-[#10b981]"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h4 className="text-lg font-bold text-[#0d253d] mb-2 font-sans">Audit Saved Successfully!</h4>
        <p className="text-sm text-[#273951] mb-0 font-sans leading-relaxed">
          Check your inbox. We have dispatched a summary of your results and your custom dashboard link.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard glowColor="primary" className="max-w-xl mx-auto font-sans">
      <h3 className="text-lg font-bold text-[#0d253d] mb-2 font-sans flex items-center gap-2">
        <span>📬</span> Save Your Custom Savings Report
      </h3>
      <p className="text-sm text-[#64748d] mb-6 font-sans leading-relaxed">
        Enter your details to save your <strong className="text-[#10b981] font-tabular">${totalMonthlySavings}/mo</strong> savings report, receive optimization notifications when tool list prices drop, and get this audit via email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lead-email" className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">
            Email Address <span className="text-[#533afd] font-sans">*</span>
          </label>
          <input
            id="lead-email"
            type="email"
            required
            placeholder="ceo@yourstartup.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-[#a8c3de] rounded-md px-3.5 py-2.5 text-sm text-[#0d253d] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all font-sans shadow-sm"
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
              className="w-full bg-white border border-[#a8c3de] rounded-md px-3.5 py-2.5 text-sm text-[#0d253d] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all font-sans shadow-sm"
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
              className="w-full bg-white border border-[#a8c3de] rounded-md px-3.5 py-2.5 text-sm text-[#0d253d] placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/10 focus:border-[#533afd] transition-all font-sans shadow-sm"
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            ⚠️ {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center bg-[#533afd] hover:bg-[#4434d4] active:bg-[#2e2b8c] text-white font-semibold py-3 px-6 rounded-full shadow-sm hover:shadow-md cursor-pointer transition-all duration-150 text-sm hover:-translate-y-0.5 focus:outline-none ${
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
