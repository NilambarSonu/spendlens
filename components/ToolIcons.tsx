import React from 'react';
import type { ToolId } from '@/types';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export function ToolIcon({ toolId, className = '', size = 20, ...props }: { toolId: ToolId; className?: string; size?: number }) {
  const commonProps = {
    className: `shrink-0 transition-transform duration-300 ${className}`,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    ...props
  };

  switch (toolId) {
    case 'cursor':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="cursorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"
            fill="url(#cursorGradient)"
            className="hidden"
          />
          {/* Custom Stylized C logo */}
          <path
            d="M4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8-8-3.58-8-8zm8-5c-2.76 0-5 2.24-5 5s2.24 5 5 5a4.99 4.99 0 004.58-3H14a3 3 0 1 1 0-4h2.58A4.99 4.99 0 0012 7z"
            fill="url(#cursorGradient)"
          />
        </svg>
      );

    case 'github_copilot':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="copilotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85l-.01 2.74c0 .26.18.57.69.48A10 10 0 0012 2z"
            fill="url(#copilotGradient)"
          />
        </svg>
      );

    case 'claude':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="claudeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Anthropic Star Spark */}
          <path
            d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2z"
            fill="url(#claudeGradient)"
          />
        </svg>
      );

    case 'chatgpt':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="chatgptGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <path
            d="M20.37 10.37a5.53 5.53 0 00-.77-4.14 5.61 5.61 0 00-3.32-2.45 5.52 5.52 0 00-4.63.45 5.53 5.53 0 00-3.23 3.32 5.51 5.51 0 00-.45 4.63 5.53 5.53 0 002.45 3.32 5.48 5.48 0 002 .83v3.74a1 1 0 001.71.71l3.03-3.03 2.18-.32a5.51 5.51 0 004.04-6.21zM9.5 8.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm5 3a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"
            fill="url(#chatgptGradient)"
          />
        </svg>
      );

    case 'gemini':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="geminiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="40%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5h-2v-2h2v2zm1.07-5.75l-.9.9c-.73.73-1.17 1.73-1.17 2.85h-2c0-1.66.67-3.16 1.76-4.24l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 1 0-4 0h-2a4 4 0 1 1 8 0c0 1.04-.42 1.99-1.07 2.66z"
            fill="url(#geminiGradient)"
            className="hidden"
          />
          {/* High quality Multi-sparkle Gemini Logo */}
          <path
            d="M12 3a9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9zm0 2.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z"
            fill="url(#geminiGradient)"
            className="hidden"
          />
          {/* Real Google Sparkle Shapes */}
          <path
            d="M12 2a.5.5 0 0 0-.5.5C11.5 6.5 6.5 11.5 2.5 11.5a.5.5 0 0 0 0 1c4 0 9 5 9 9a.5.5 0 0 0 1 0c0-4 5-9 9-9a.5.5 0 0 0 0-1c-4 0-9-5-9-9A.5.5 0 0 0 12 2z"
            fill="url(#geminiGradient)"
          />
        </svg>
      );

    case 'windsurf':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="windsurfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
          </defs>
          {/* Codeium wind-wave cyber logo */}
          <path
            d="M2 12c0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2 2 6.48 2 12zm15-3c.55 0 1 .45 1 1s-.45 1-1 1H7c-.55 0-1-.45-1-1s.45-1 1-1h10zm-2 5c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1-.45-1-1s.45-1 1-1h6z"
            fill="url(#windsurfGradient)"
          />
        </svg>
      );

    case 'anthropic_api':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="anthropicApiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <path
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm-1-13h2v4h-2zm0 6h2v2h-2z"
            fill="url(#anthropicApiGrad)"
          />
        </svg>
      );

    case 'openai_api':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="openaiApiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
            fill="url(#openaiApiGrad)"
          />
        </svg>
      );

    case 'midjourney':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="midjourneyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          {/* Art sailboat canvas logomark */}
          <path
            d="M4 19h16v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1zm2-2a6 6 0 0 1 6-6V5.5L8.5 9h3.5v2H6v6zm8-6v6h4c0-3.31-2.69-6-4-6z"
            fill="url(#midjourneyGradient)"
          />
        </svg>
      );

    case 'perplexity':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="perplexityGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#0891B2" />
            </linearGradient>
          </defs>
          {/* Cyber geometric books/nodes */}
          <path
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"
            fill="url(#perplexityGrad)"
            className="hidden"
          />
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7V7h10v6z"
            fill="url(#perplexityGrad)"
          />
        </svg>
      );

    case 'v0':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="v0Gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>
          {/* Vercel geometric delta with neon green accent */}
          <path
            d="M12 2L2 22h20L12 2zm0 6l6.5 11h-13L12 8z"
            fill="url(#v0Gradient)"
          />
        </svg>
      );

    case 'elevenlabs':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="elevenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
          {/* Voice waves */}
          <path
            d="M6 9h2v6H6V9zm4-3h2v12h-2V6zm4 5h2v4h-2v-4zm4-2h2v6h-2V9z"
            fill="url(#elevenGrad)"
          />
        </svg>
      );

    case 'notion_ai':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="notionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#000000" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#D946EF" />
            </linearGradient>
          </defs>
          <path
            d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 15h-2.5l-3.5-5.5V18H8.5V6H11l3.5 5.5V6H17v12z"
            fill="url(#notionGradient)"
          />
        </svg>
      );

    case 'deepl':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="deeplGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          {/* translation arrows/diamond */}
          <path
            d="M12.89 3a1 1 0 0 0-1.78 0L7.44 10.5h3.06V21h3v-10.5h3.06L12.89 3z"
            fill="url(#deeplGrad)"
          />
        </svg>
      );

    case 'jasper':
      return (
        <svg {...commonProps}>
          <defs>
            <linearGradient id="jasperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          {/* Futuristic ring helmet */}
          <path
            d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"
            fill="url(#jasperGrad)"
          />
          <circle cx="12" cy="12" r="5" fill="url(#jasperGrad)" />
        </svg>
      );

    default:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="10" fill="#a1a1aa" />
        </svg>
      );
  }
}
