'use client';

import React, { useState, useEffect } from 'react';
import type { AuditInput, AuditResult } from '@/types';
import AuditForm from '@/components/AuditForm';
import AuditResults from '@/components/AuditResults';
import Preloader from '@/components/Preloader';
import AuthModal from '@/components/AuthModal';

interface UserProfile {
  id: string;
  email: string;
  companyName?: string | null;
  role?: string | null;
}

export default function Home() {
  const [step, setStep] = useState<'form' | 'results'>('form');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Luxury Preloader state
  const [isPreloaderActive, setIsPreloaderActive] = useState<boolean>(true);

  // Authentication states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Check user session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error('Failed to resolve active auth session:', err));
  }, []);

  const handleRunAudit = async (input: AuditInput & { website?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            teamSize: input.teamSize,
            primaryUseCase: input.primaryUseCase,
            tools: input.tools,
          },
          website: input.website || '', // Honeypot field support
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete audit');
      }

      // Re-map API result structure to match full AuditResult definition
      const auditResult: AuditResult = {
        id: data.auditId,
        publicToken: data.publicToken,
        input: {
          teamSize: input.teamSize,
          primaryUseCase: input.primaryUseCase,
          tools: input.tools,
        },
        recommendations: data.result.recommendations,
        totalMonthlySpend: data.result.totalMonthlySpend,
        totalMonthlySavings: data.result.totalMonthlySavings,
        totalAnnualSavings: data.result.totalAnnualSavings,
        aiSummary: data.result.aiSummary,
        createdAt: new Date().toISOString(),
        isHighSavings: data.result.isHighSavings,
        isOptimal: data.result.isOptimal,
      };

      setResult(auditResult);
      setStep('results');
      
      // Scroll to top of results smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Audit calculation error:', err);
      const message = err instanceof Error ? err.message : 'Failed to execute audit. Please check your network and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setCurrentUser(null);
        setIsAuthModalOpen(false);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      {isPreloaderActive && <Preloader onComplete={() => setIsPreloaderActive(false)} />}

      <div className="min-h-screen bg-gradient-to-b from-[#09090b] via-[#121214] to-[#09090b] flex flex-col font-sans text-zinc-100 selection:bg-primary/30 selection:text-white">
        {/* Header */}
        <header className="bg-[#09090b]/85 backdrop-blur-lg border-b border-zinc-800/60 py-4 px-6 md:px-12 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/favicon.png" 
                alt="SpendLens Logo" 
                className="w-10 h-10 object-contain rounded-xl shadow-[0_0_15px_rgba(217,70,239,0.2)]" 
              />
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight font-display">SpendLens</span>
                <span className="text-[10px] text-zinc-500 font-bold block leading-none tracking-wider font-mono">BY CREDEX</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hidden sm:inline-flex text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl px-4 py-2 transition-all cursor-pointer"
                  >
                    💼 {currentUser.companyName || 'My Profile'} Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-bold text-danger hover:text-white hover:bg-danger/20 border border-danger/30 rounded-xl px-4 py-2 transition-all cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/80 border border-zinc-700/50 rounded-xl px-4 py-2 transition-all cursor-pointer"
                >
                  🔒 Sign In / Register
                </button>
              )}

              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex text-xs md:text-sm font-bold text-accent hover:text-white bg-accent/10 border border-accent/30 rounded-full px-5 py-2.5 hover:bg-accent/20 hover:border-accent/50 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.1)]"
              >
                Visit Credex Marketplace →
              </a>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 relative">
          {/* Dynamic neon flows background blur */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none -z-10" />
          
          {step === 'form' ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Value Proposition Hero */}
              <div className="text-center space-y-5 max-w-3xl mx-auto">
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.05] font-tagline">
                  See exactly where your{' '}
                  <span className="bg-gradient-to-r from-primary via-[#e879f9] to-accent bg-clip-text text-transparent">
                    AI budget
                  </span>{' '}
                  is leaking.
                </h1>
                <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  Free startup AI subscription audit. Zero logins or signup required. See plan optimizations, switch suggestions, and redundancy detections in 2 minutes.
                </p>
              </div>

              {/* Main Form container */}
              <div className="bg-zinc-900/30 rounded-[32px] border border-zinc-800/40 p-1 md:p-1.5 shadow-2xl backdrop-blur-xl">
                <div className="bg-[#121214] rounded-[28px] p-6 md:p-12 border border-zinc-800/60 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  <AuditForm onSubmit={handleRunAudit} isLoading={isLoading} />
                </div>
              </div>

              {/* API level error container */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-danger/10 border border-danger/25 text-danger text-sm font-semibold animate-pulse-subtle max-w-xl mx-auto">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5 shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                    />
                  </svg>
                  {error}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {result && <AuditResults result={result} onBackToForm={handleBackToForm} />}
            </div>
          )}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </>
  );
}
