'use client';

import React, { useState, useEffect } from 'react';
import type { AuditInput, ToolEntry, UseCase, ToolId } from '@/types';
import { TOOL_DEFINITIONS } from '@/lib/pricing-data';
import ToolRow from './ToolRow';
import GlassCard from './GlassCard';

interface AuditFormProps {
  onSubmit: (input: AuditInput) => void;
  isLoading: boolean;
}

export default function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [teamSize, setTeamSize] = useState<number>(3);
  const [primaryUseCase, setPrimaryUseCase] = useState<UseCase>('mixed');
  const [tools, setTools] = useState<ToolEntry[]>([
    { toolId: 'cursor', planId: 'pro', monthlySpend: 20, seats: 1 },
  ]);
  const [website, setWebsite] = useState<string>(''); // Honeypot field
  const [error, setError] = useState<string | null>(null);
 
  // Restore form state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('spendlens_form_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        const timer = setTimeout(() => {
          if (parsed.teamSize) setTeamSize(parsed.teamSize);
          if (parsed.primaryUseCase) setPrimaryUseCase(parsed.primaryUseCase);
          if (parsed.tools && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
            setTools(parsed.tools);
          }
        }, 0);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn('Failed to restore form state from localStorage:', e);
    }
  }, []);

  // Save state to localStorage on every change
  useEffect(() => {
    try {
      const stateToSave = {
        teamSize,
        primaryUseCase,
        tools,
      };
      localStorage.setItem('spendlens_form_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('Failed to save form state to localStorage:', e);
    }
  }, [teamSize, primaryUseCase, tools]);

  const handleAddTool = () => {
    if (tools.length >= 15) {
      setError('You can add a maximum of 15 tools to audit at once.');
      return;
    }
    setError(null);
    
    // Find next unused tool
    const currentToolIds = tools.map((t) => t.toolId);
    const allToolIds: ToolId[] = [
      'cursor',
      'github_copilot',
      'claude',
      'chatgpt',
      'anthropic_api',
      'openai_api',
      'gemini',
      'windsurf',
      'midjourney',
      'perplexity',
      'v0',
      'elevenlabs',
      'notion_ai',
      'deepl',
      'jasper',
    ];
    const unusedId = allToolIds.find((id) => !currentToolIds.includes(id)) || 'cursor';
    const def = TOOL_DEFINITIONS[unusedId];
    const defaultPlanId = def && def.plans.length > 0 ? def.plans[0].id : 'free';

    setTools([
      ...tools,
      {
        toolId: unusedId,
        planId: defaultPlanId,
        monthlySpend: 0,
        seats: 1,
      },
    ]);
  };

  const handleUpdateTool = (index: number, updated: ToolEntry) => {
    setError(null);
    const nextTools = [...tools];
    nextTools[index] = updated;
    setTools(nextTools);
  };

  const handleRemoveTool = (index: number) => {
    setError(null);
    if (tools.length === 1) {
      setError('You must have at least one tool to run an audit.');
      return;
    }
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (teamSize < 1) {
      setError('Team size must be at least 1 person.');
      return;
    }

    if (tools.length === 0) {
      setError('Please add at least one AI tool to audit.');
      return;
    }

    // Submit with honeypot field
    onSubmit({
      teamSize,
      primaryUseCase,
      tools,
    } as AuditInput & { website?: string });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Honeypot field (hidden from real users) */}
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Grid Container for Team Info & Use Cases */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Team Size */}
        <GlassCard glowColor="primary" className="md:col-span-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <label htmlFor="team-size" className="text-sm font-semibold text-[#0d253d] font-sans">
              👥 Team Size
            </label>
            <div className="relative flex items-center bg-white border border-[#a8c3de] rounded-md px-2.5 py-1">
              <input
                id="team-size"
                type="number"
                min="1"
                max="10000"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-transparent text-right text-xs font-semibold text-[#533afd] focus:outline-none font-mono"
              />
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider ml-1 font-mono">seats</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500 font-sans">
            Used to right-size licenses and enterprise plans.
          </p>
          
          <div className="mt-4 flex flex-col gap-2">
            <input
              type="range"
              min="1"
              max="150"
              value={teamSize > 150 ? 150 : teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value, 10) || 1)}
              className="w-full h-1.5 bg-[#e3e8ee] rounded-lg appearance-none cursor-pointer accent-[#533afd] focus:outline-none focus:ring-2 focus:ring-[#533afd]/10"
              style={{
                background: `linear-gradient(to right, #533afd 0%, #533afd ${Math.min(100, (teamSize / 150) * 100)}%, #e3e8ee ${Math.min(100, (teamSize / 150) * 100)}%, #e3e8ee 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold px-0.5">
              <span>1 seat</span>
              <span>75</span>
              <span>150+ seats</span>
            </div>
          </div>
        </GlassCard>

        {/* Primary Use Case */}
        <GlassCard glowColor="subdued" className="md:col-span-8 flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-[#0d253d] font-sans">
            🎯 What is your team&apos;s primary AI use case?
          </span>
          <p className="text-xs text-[#64748d] font-sans">
            Helps verify if tools match your actual workflow capability needs.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-2">
            {[
              { id: 'coding', label: '💻 Code', desc: 'Dev & Engineering' },
              { id: 'writing', label: '✍️ Writing', desc: 'Copy & Content' },
              { id: 'data', label: '📊 Data', desc: 'Analytics & SQL' },
              { id: 'research', label: '🔍 Research', desc: 'Analysis & Search' },
              { id: 'mixed', label: '🌀 Mixed', desc: 'General usage' },
            ].map((uc) => (
              <button
                key={uc.id}
                type="button"
                onClick={() => setPrimaryUseCase(uc.id as UseCase)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 focus:outline-none cursor-pointer ${
                  primaryUseCase === uc.id
                    ? 'border-[#533afd] bg-[#e8ebfd] text-[#533afd] font-semibold shadow-sm ring-2 ring-[#533afd]/10'
                    : 'border-[#e3e8ee] bg-[#f6f9fc] text-[#273951] hover:border-[#a8c3de] hover:bg-white'
                }`}
              >
                <span className="text-sm font-bold tracking-tight font-sans">{uc.label}</span>
                <span className={`text-[10px] font-normal mt-0.5 font-sans ${primaryUseCase === uc.id ? 'text-[#533afd]/80' : 'text-[#64748d]'}`}>{uc.desc}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Tool Spend Entries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-[#0d253d] font-sans flex items-center gap-2">
            <span>🛠️</span> AI Tools & Monthly Subscriptions
          </h3>
          <span className="text-xs font-mono font-semibold text-[#273951] bg-[#f6f9fc] border border-[#e3e8ee] px-3 py-1 rounded-full">
            {tools.length} / 15 Added
          </span>
        </div>

        <div className="space-y-3">
          {tools.map((entry, idx) => (
            <ToolRow
              key={`${entry.toolId}-${idx}`}
              index={idx}
              entry={entry}
              onUpdate={handleUpdateTool}
              onRemove={handleRemoveTool}
              selectedToolIds={tools.map((t) => t.toolId)}
            />
          ))}
        </div>

        {/* Add Another Tool Button */}
        {tools.length < 15 && (
          <button
            type="button"
            onClick={handleAddTool}
            className="w-full flex items-center justify-center gap-2 border border-dashed border-[#a8c3de] hover:border-[#533afd] bg-white hover:bg-[#f6f9fc] text-[#64748d] hover:text-[#533afd] font-semibold py-4 px-4 rounded-xl cursor-pointer transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-zinc-400 transition-colors"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Another AI Tool
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold animate-pulse-subtle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 text-red-500 shrink-0"
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

      {/* Submit Button */}
      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2.5 bg-[#533afd] hover:bg-[#4434d4] active:bg-[#2e2b8c] text-white font-semibold py-4 px-10 rounded-full shadow-sm hover:shadow-md cursor-pointer transition-all duration-150 text-base focus:outline-none hover:-translate-y-0.5 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Auditing Your Spend...
            </>
          ) : (
            <>
              Run My Audit
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 transition-transform group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
