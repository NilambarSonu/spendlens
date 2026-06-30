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

  // Preloader state
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

      <div className="min-h-screen bg-white flex flex-col font-sans text-[#0d253d] selection:bg-[#533afd]/20 selection:text-[#0d253d] relative overflow-x-hidden">
        {/* Stripe-like Gradient Mesh Hero Backdrop */}
        <div className="absolute top-0 left-0 right-0 h-[580px] overflow-hidden -z-10 bg-white pointer-events-none border-b border-[#e3e8ee]/40">
          <div className="absolute top-[-25%] left-[-15%] w-[65%] h-[90%] rounded-full bg-[#fcf8e3] blur-[130px] opacity-75" />
          <div className="absolute top-[-15%] left-[15%] w-[55%] h-[80%] rounded-full bg-[#fde8d7] blur-[120px] opacity-80" />
          <div className="absolute top-[-35%] right-[-15%] w-[75%] h-[100%] rounded-full bg-[#e8ebfd] blur-[160px] opacity-85" />
          <div className="absolute top-[-20%] right-[15%] w-[55%] h-[90%] rounded-full bg-[#fae8ff] blur-[130px] opacity-80" />
          <div className="absolute top-[-8%] left-[40%] w-[45%] h-[70%] rounded-full bg-[#fee2e2] blur-[110px] opacity-75" />
        </div>

        {/* Header */}
        <header className="bg-transparent py-5 px-6 md:px-12 sticky top-0 z-50 backdrop-blur-md border-b border-[#e3e8ee]/30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#533afd] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold tracking-tighter select-none font-display">S</span>
              </div>
              <div>
                <span className="font-bold text-[#0d253d] text-lg tracking-tight font-display">SpendLens</span>
                <span className="text-[9px] text-[#64748d] font-bold block leading-none tracking-wider font-mono">BY CREDEX</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="hidden sm:inline-flex text-xs font-semibold text-[#0d253d] hover:text-[#533afd] bg-white hover:bg-[#f6f9fc] border border-[#a8c3de] rounded-full px-4 py-2 transition-all cursor-pointer shadow-sm"
                  >
                    💼 {currentUser.companyName || 'My Profile'} Dashboard
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-[#ef4444] hover:bg-red-50 border border-red-200 rounded-full px-4 py-2 transition-all cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-xs font-semibold text-[#273951] hover:text-[#0d253d] bg-white/80 hover:bg-white border border-[#a8c3de] rounded-full px-4 py-2 transition-all cursor-pointer shadow-sm"
                >
                  🔒 Sign In / Register
                </button>
              )}

              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:inline-flex button-primary-pill text-xs md:text-sm shadow-sm"
              >
                Visit Credex Marketplace →
              </a>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-12 md:py-20 relative">
          
          {step === 'form' ? (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Value Proposition Hero */}
              <div className="text-center space-y-5 max-w-3xl mx-auto">
                <h1 className="display-xxl text-[#0d253d]">
                  See exactly where your{' '}
                  <span className="text-[#533afd] font-semibold">
                    AI budget
                  </span>{' '}
                  is leaking.
                </h1>
                <p className="text-[#273951] text-lg max-w-2xl mx-auto leading-relaxed font-light">
                  Free startup AI subscription audit. Zero logins or signup required. See plan optimizations, switch suggestions, and redundancy detections in 2 minutes.
                </p>
              </div>

              {/* Main Form container */}
              <div className="bg-white rounded-2xl p-1 md:p-1.5 shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px] border border-[#e3e8ee]">
                <div className="bg-white rounded-xl p-6 md:p-12">
                  <AuditForm onSubmit={handleRunAudit} isLoading={isLoading} />
                </div>
              </div>

              {/* API level error container */}
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold max-w-xl mx-auto">
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />
    </>
  );
}
