'use client';

import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'history'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [myAudits, setMyAudits] = useState<any[]>([]);

  // Fetch past audits if authenticated and in history tab
  useEffect(() => {
    if (mode === 'history') {
      fetchMyAudits();
    }
  }, [mode]);

  const fetchMyAudits = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/my-audits');
      const data = await res.json();
      if (res.ok) {
        setMyAudits(data.audits || []);
      } else {
        setError(data.error || 'Failed to load audit history.');
      }
    } catch {
      setError('Network error loading history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' 
      ? { email, password } 
      : { email, password, companyName, role };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        setMode('history');
      } else {
        setError(data.error || 'Authentication failed.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300">
      <div className="w-full max-w-xl relative animate-fade-in-up">
        {/* Background glow behind modal */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10 rounded-3xl blur-2xl -z-10" />

        <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Your Neon Account'}
              {mode === 'history' && 'Your Audit History'}
            </h3>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-800/60 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all duration-200 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs font-semibold">
              {error}
            </div>
          )}

          {mode !== 'history' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-all"
                  placeholder="name@company.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-all"
                  placeholder="Min 6 characters"
                />
              </div>

              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Company</label>
                    <input 
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-all"
                      placeholder="Acme Inc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Your Role</label>
                    <input 
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/60 transition-all"
                      placeholder="CTO / Founder"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-extrabold rounded-xl py-3 text-sm transition-all duration-300 shadow-[0_4px_15px_rgba(219,70,239,0.3)] disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors underline"
                >
                  {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs text-zinc-400 font-bold">Past Scans</span>
                <button 
                  onClick={fetchMyAudits}
                  className="text-xs text-primary hover:underline font-bold"
                >
                  Refresh
                </button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-sm text-zinc-500">Loading your history...</div>
              ) : myAudits.length === 0 ? (
                <div className="py-8 text-center text-sm text-zinc-500">
                  No past audits found. Complete an audit to save it to your profile!
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {myAudits.map((audit) => (
                    <a
                      key={audit.id}
                      href={`/audit/${audit.publicToken}`}
                      className="block p-3.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all hover:bg-zinc-850/60"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-white uppercase tracking-tight">
                          {audit.primaryUseCase} Stack ({audit.teamSize} seats)
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {new Date(audit.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs font-semibold">
                        <span className="text-zinc-400">
                          Spend: <strong className="text-white">${audit.totalMonthlySpend}/mo</strong>
                        </span>
                        <span className="text-emerald-400">
                          Savings: <strong>${audit.totalMonthlySavings}/mo</strong>
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors underline"
                >
                  Log into another account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
