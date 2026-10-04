import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const SecurityThreatModelSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    edge: isDark ? '#a1a1b5' : '#94a3b8',
    red: isDark ? '#fda4af' : '#b91c1c',
    redBg: isDark ? '#3c181d' : '#fee2e2',
    green: isDark ? '#86efac' : '#166534',
    greenBg: isDark ? '#143422' : '#dcfce7',
  };

  const threatPairs = [
    {
      threat: 'T1: Malicious File Payloads (Exploits, RCE)',
      mitigation: 'M1: Pure client sandbox. No backend execution environment exists to exploit.',
    },
    {
      threat: 'T2: Cross-Site Scripting (XSS via Markdown)',
      mitigation: 'M2: Custom renderSafeMarkdown entity escaping + javascript: protocol filter.',
    },
    {
      threat: 'T3: Credential & Password Interception',
      mitigation: 'M3: Web Crypto API randomness. Zero persistence in LocalStorage or network.',
    },
    {
      threat: 'T4: Browser Memory Denial of Service',
      mitigation: 'M4: Generous 1024MB (1GB) client guardrail & explicit URL.revokeObjectURL calls.',
    },
    {
      threat: 'T5: Application Crash via Malformed JSON',
      mitigation: 'M5: Robust try/catch wrappers with user-friendly actionable error banners.',
    },
    {
      threat: 'T6: Untrusted External QR Link Redirection',
      mitigation: 'M6: Decoded QR payloads display raw plain text before user decides to visit.',
    },
  ];

  return (
    <svg
      viewBox="0 0 940 480"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-sec"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={colors.edge} />
        </marker>
      </defs>

      {/* Header labels */}
      <g transform="translate(40, 20)">
        <rect width="400" height="34" rx="8" fill={colors.redBg} stroke={colors.red} />
        <text x="200" y="22" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.red}>
          IDENTIFIED THREAT VECTOR
        </text>
      </g>

      <g transform="translate(500, 20)">
        <rect width="400" height="34" rx="8" fill={colors.greenBg} stroke={colors.green} />
        <text x="200" y="22" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.green}>
          VERIFIED ARCHITECTURAL MITIGATION
        </text>
      </g>

      {/* 6 Threat/Mitigation Rows */}
      {threatPairs.map((pair, idx) => {
        const y = 65 + idx * 64;
        return (
          <g key={idx}>
            {/* Threat Box */}
            <g transform={`translate(40, ${y})`}>
              <rect width="400" height="52" rx="10" fill={colors.nodeBg} stroke={colors.red} strokeWidth="1.5" />
              <text x="16" y="30" fontWeight="600" fontSize="11" fill={colors.textMain}>
                {pair.threat}
              </text>
            </g>

            {/* Connecting Arrow */}
            <path
              d={`M 440 ${y + 26} L 495 ${y + 26}`}
              stroke={colors.edge}
              strokeWidth="2"
              markerEnd="url(#arrow-sec)"
            />

            {/* Mitigation Box */}
            <g transform={`translate(500, ${y})`}>
              <rect width="400" height="52" rx="10" fill={colors.nodeBg} stroke={colors.green} strokeWidth="1.5" />
              <text x="16" y="30" fontWeight="600" fontSize="10.5" fill={colors.green}>
                {pair.mitigation}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};
