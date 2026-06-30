'use client';

import React, { useRef, useState } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'fuchsia' | 'cyan' | 'emerald' | 'amber' | 'primary' | 'subdued';
  enableTilt?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  glowColor = 'primary',
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
      // Max tilt angle in degrees (very subtle for Stripe styling)
      const maxTilt = 2;
      const angleX = ((yc - y) / yc) * maxTilt; 
      const angleY = ((x - xc) / xc) * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${angleX.toFixed(2)}deg) rotateY(${angleY.toFixed(2)}deg) translateY(-2px)`;
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

  // Map glowColor to soft Stripe colors (subtle lights)
  const glowStyles = {
    fuchsia: 'rgba(83, 58, 253, 0.04)',
    cyan: 'rgba(83, 58, 253, 0.04)',
    emerald: 'rgba(16, 185, 129, 0.04)',
    amber: 'rgba(245, 158, 11, 0.04)',
    primary: 'rgba(83, 58, 253, 0.04)',
    subdued: 'rgba(83, 58, 253, 0.02)',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-white border border-[#e3e8ee] rounded-2xl p-6 shadow-[rgba(0,55,112,0.08)_0_1px_3px] hover:border-[#a8c3de] hover:shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px] transition-all duration-300 ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), border-color 0.3s ease, box-shadow 0.3s ease',
        willChange: 'transform',
      }}
      {...props}
    >
      {/* Subtle Indigo Glow Spot */}
      <div
        className="pointer-events-none absolute transition-opacity duration-500 rounded-full"
        style={{
          width: '260px',
          height: '260px',
          background: `radial-gradient(circle, ${glowStyles[glowColor] || glowStyles.primary} 0%, transparent 70%)`,
          left: `${coords.x - 130}px`,
          top: `${coords.y - 130}px`,
          opacity: isHovered ? 1 : 0,
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Internal Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
