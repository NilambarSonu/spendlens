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

const DEFAULT_ENTRY: ToolEntry = {
  toolId: 'cursor',
  planId: 'pro',
  monthlySpend: 20,
  seats: 1,
};

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
        if (parsed.teamSize) setTeamSize(parsed.teamSize);
        if (parsed.primaryUseCase) setPrimaryUseCase(parsed.primaryUseCase);
        if (parsed.tools && Array.isArray(parsed.tools) && parsed.tools.length > 0) {
          setTools(parsed.tools);
        }
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
        <GlassCard glowColor="fuchsia" className="md:col-span-4 flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <label htmlFor="team-size" className="text-sm font-semibold text-zinc-300 font-sans">
              👥 Team Size
            </label>
            <div className="relative flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1">
              <input
                id="team-size"
                type="number"
                min="1"
                max="10000"
                value={teamSize}
                onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-12 bg-transparent text-right text-xs font-bold text-[#D946EF] focus:outline-none font-mono"
              />
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider ml-1 font-mono">seats</span>
            </div>
          </div>
          <p className="text-xs text-zinc-550 font-sans">
            Used to right-size licenses and enterprise plans.
          </p>
          
          <div className="mt-4 flex flex-col gap-2">
            <input
              type="range"
              min="1"
              max="150"
              value={teamSize > 150 ? 150 : teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value, 10) || 1)}
              className="w-full h-2 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#D946EF] focus:outline-none focus:ring-2 focus:ring-[#D946EF]/20"
              style={{
                background: `linear-gradient(to right, #D946EF 0%, #D946EF ${Math.min(100, (teamSize / 150) * 100)}%, #1e1e24 ${Math.min(100, (teamSize / 150) * 100)}%, #1e1e24 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 font-bold px-0.5">
              <span>1 seat</span>
              <span>75</span>
              <span>150+ seats</span>
            </div>
          </div>
        </GlassCard>

        {/* Primary Use Case */}
        <GlassCard glowColor="cyan" className="md:col-span-8 flex flex-col gap-2.5">
          <span className="text-sm font-semibold text-zinc-300 font-sans">
            🎯 What is your team's primary AI use case?
          </span>
          <p className="text-xs text-zinc-550 font-sans">
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
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-300 focus:outline-none cursor-pointer ${
                  primaryUseCase === uc.id
                    ? 'border-[#D946EF] bg-[#D946EF]/10 text-white shadow-[0_0_15px_rgba(217,70,239,0.15)] ring-2 ring-[#D946EF]/20'
                    : 'border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/50'
                }`}
              >
                <span className="text-sm font-bold tracking-tight font-sans">{uc.label}</span>
                <span className="text-[10px] text-zinc-500 font-normal mt-0.5 font-sans">{uc.desc}</span>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Tool Spend Entries */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-zinc-200 font-sans flex items-center gap-2">
            <span>🛠️</span> AI Tools & Monthly Subscriptions
          </h3>
          <span className="text-xs font-mono font-semibold text-zinc-400 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full">
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
            className="w-full flex items-center justify-center gap-2 border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/30 hover:bg-zinc-900/30 text-zinc-400 hover:text-zinc-200 font-semibold py-4 px-4 rounded-2xl cursor-pointer transition-all duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-zinc-500 transition-colors"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Another AI Tool
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm font-medium animate-pulse-subtle">
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
          className={`w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#D946EF] to-[#A21CAF] hover:from-[#C026D3] hover:to-[#8B1D9F] text-white font-bold py-4 px-10 rounded-full shadow-[0_0_35px_rgba(217,70,239,0.3)] hover:shadow-[0_0_50px_rgba(217,70,239,0.45)] cursor-pointer transition-all duration-300 text-base focus:outline-none hover:-translate-y-0.5 ${
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

