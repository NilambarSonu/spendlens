'use client';

import React, { useState, useEffect } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

const LOG_MESSAGES = [
  'Initializing SpendLens Secure Sandbox...',
  'Handshaking with Neon Database instances...',
  'Resolving Google AI Studio spend optimization engines...',
  'Validating Resend transactional mail streams...',
  'Configuring secure session layer cookies...',
  'Synchronizing Credex credits discount index...',
  'AI Spend Audit environment ready.'
];

export default function Preloader({ onComplete }: PreloaderProps) {
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Increment log messages sequentially
    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < LOG_MESSAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 500);

    // Smoothly increment progress percentage from 0 to 100 over 3.2s
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        }
        clearInterval(progressInterval);
        return 100;
      });
    }, 30);

    // Fade out and trigger completion after 3.5 seconds total
    const timeout = setTimeout(() => {
      setIsFadingOut(true);
      const completeTimeout = setTimeout(() => {
        onComplete();
      }, 600); // match globals.css fade-out animation duration
      return () => clearTimeout(completeTimeout);
    }, 3500);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[999] bg-[#ffffff] flex flex-col items-center justify-center p-6 select-none ${isFadingOut ? 'animate-fade-out' : ''}`}>
      {/* Luxury colorful floating backdrop particles (pastel cream/indigo) */}
      <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] bg-[#e8ebfd]/40 rounded-full blur-3xl animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[#f5e9d4]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#e8ebfd]/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Spinner Ring & Logo */}
      <div className="relative mb-12 flex items-center justify-center">
        {/* Glowing Outer Ring (Clockwise) */}
        <div className="w-36 h-36 rounded-full border border-zinc-100 flex items-center justify-center animate-spin-slow absolute">
          <div className="w-32 h-32 rounded-full border-t border-l border-[#533afd]/20 shadow-[0_0_15px_rgba(83,58,253,0.05)]" />
        </div>

        {/* Glowing Inner Ring (Counter-Clockwise) */}
        <div className="w-28 h-28 rounded-full border border-zinc-100 flex items-center justify-center animate-spin-counter-clockwise absolute">
          <div className="w-24 h-24 rounded-full border-b border-r border-[#665efd]/30 shadow-[0_0_15px_rgba(102,94,253,0.05)]" />
        </div>
        
        {/* Glow Spherical Central Pulse */}
        <div className="w-16 h-16 bg-gradient-to-tr from-[#533afd] to-[#665efd] rounded-2xl flex items-center justify-center shadow-[0_4px_20px_rgba(83,58,253,0.3)] animate-logo-3d z-10">
          <span className="-rotate-45 text-white font-black text-3xl font-display select-none animate-text-heartbeat block">S</span>
        </div>
      </div>

      {/* Progress Bar & High-Tech Text logs */}
      <div className="w-full max-w-md space-y-6 text-center z-10">
        <div>
          <h2 className="text-3xl font-black text-[#0d253d] tracking-tight font-display mb-1">
            SpendLens
          </h2>
          <p className="text-[10px] text-zinc-400 font-extrabold tracking-[0.25em] uppercase font-mono mb-6">
            BY CREDEX · STACK AUDITOR
          </p>
        </div>

        {/* Custom Progress Bar */}
        <div className="w-full h-1 bg-[#e3e8ee] rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#533afd] via-[#665efd] to-[#533afd] transition-all duration-100 ease-out shadow-[0_0_8px_rgba(83,58,253,0.3)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>

        {/* Loading Logs */}
        <div className="h-6 flex items-center justify-center">
          <span className="text-xs text-[#273951] font-medium font-mono tracking-tight animate-pulse-subtle">
            &gt;_ {LOG_MESSAGES[logIndex]}
          </span>
        </div>

        <div className="text-[10px] text-zinc-400 font-bold font-mono">
          SYSTEM COMPONENT ACTIVE · {progress}%
        </div>
      </div>
    </div>
  );
}
