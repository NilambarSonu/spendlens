'use client';

import React, { useRef, useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'fuchsia' | 'cyan' | 'emerald' | 'amber';
  enableTilt?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  glowColor = 'fuchsia',
  enableTilt = true,
  ...props
}: GlassCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Relative coordinates
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    if (enableTilt) {
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      // Max tilt angle in degrees
      const maxTilt = 4;
      const angleX = ((yc - y) / yc) * maxTilt; 
      const angleY = ((x - xc) / xc) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${angleX.toFixed(2)}deg) rotateY(${angleY.toFixed(2)}deg) translateY(-4px)`;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    }
  };

  // Map glowColor to tailwind radial colors
  const glowStyles = {
    fuchsia: 'rgba(217, 70, 239, 0.15)',
    cyan: 'rgba(34, 211, 238, 0.15)',
    emerald: 'rgba(34, 197, 94, 0.15)',
    amber: 'rgba(245, 158, 11, 0.15)',
  };

  const borderGlowColors = {
    fuchsia: 'hover:border-[#D946EF]/40',
    cyan: 'hover:border-[#22D3EE]/40',
    emerald: 'hover:border-[#22C55E]/40',
    amber: 'hover:border-[#F59E0B]/40',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-[#121214]/80 backdrop-blur-xl border border-zinc-800/80 rounded-3xl p-6 shadow-xl transition-all duration-300 ${borderGlowColors[glowColor]} ${
        isHovered ? 'shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : ''
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease, box-shadow 0.3s ease',
        willChange: 'transform',
      }}
      {...props}
    >
      {/* 3D Holographic Glow Spot */}
      <div
        className="absolute pointer-events-none transition-opacity duration-500 rounded-full"
        style={{
          width: '260px',
          height: '260px',
          background: `radial-gradient(circle, ${glowStyles[glowColor]} 0%, transparent 70%)`,
          left: `${coords.x - 130}px`,
          top: `${coords.y - 130}px`,
          opacity: isHovered ? 1 : 0,
          mixBlendMode: 'screen',
        }}
      />
      
      {/* Internal Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
