import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const SystemOverviewSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    bg: isDark ? '#090914' : '#ffffff',
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    primary: isDark ? '#a78bfa' : '#6d28d9',
    primaryBg: isDark ? '#292344' : '#ede9fe',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    edge: isDark ? '#a1a1b5' : '#94a3b8',
    accentGreen: isDark ? '#86efac' : '#166534',
    accentGreenBg: isDark ? '#143422' : '#dcfce7',
    accentAmber: isDark ? '#fcd34d' : '#92400e',
    accentAmberBg: isDark ? '#372a11' : '#fef3c7',
  };

  return (
    <svg
      viewBox="0 0 940 500"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-sys"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={colors.edge} />
        </marker>
        <linearGradient id="primary-grad-sys" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={isDark ? '#7c3aed' : '#6d28d9'} />
          <stop offset="100%" stopColor={isDark ? '#a78bfa' : '#8b5cf6'} />
        </linearGradient>
      </defs>

      {/* Layer 1: User & Entry */}
      <g transform="translate(40, 200)">
        <rect
          width="160"
          height="90"
          rx="14"
          fill={colors.primaryBg}
          stroke={colors.primary}
          strokeWidth="2"
        />
        <circle cx="80" cy="35" r="16" fill={colors.primary} opacity="0.2" />
        <text x="80" y="39" textAnchor="middle" fontSize="16">👤</text>
        <text x="80" y="62" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          User Client Session
        </text>
        <text x="80" y="76" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Modern Web Browser
        </text>
      </g>

      {/* Arrow: User -> Router */}
      <path
        d="M 200 245 L 260 245"
        fill="none"
        stroke={colors.edge}
        strokeWidth="2"
        markerEnd="url(#arrow-sys)"
      />

      {/* Layer 2: Router & Central Registry */}
      <g transform="translate(265, 140)">
        <rect
          width="180"
          height="210"
          rx="16"
          fill={colors.nodeBg}
          stroke={colors.nodeBorder}
          strokeWidth="2"
        />
        <rect width="180" height="36" rx="16" fill={isDark ? '#1a1a2c' : '#f1f5f9'} />
        <text x="90" y="23" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          🧭 APPLICATION ROUTER
        </text>
        <text x="90" y="65" textAnchor="middle" fontWeight="700" fontSize="13" fill={colors.textMain}>
          React Router v7
        </text>
        <text x="90" y="82" textAnchor="middle" fontSize="11" fill={colors.textMuted}>
          Dynamic Slug Resolution
        </text>

        <line x1="20" y1="105" x2="160" y2="105" stroke={colors.nodeBorder} strokeWidth="1" />

        <text x="90" y="130" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          Tool Registry (40)
        </text>
        <text x="90" y="148" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          src/data/tools.ts
        </text>

        <rect x="25" y="165" width="130" height="26" rx="13" fill={colors.primaryBg} />
        <text x="90" y="182" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.primary}>
          Zero Server Dependency
        </text>
      </g>

      {/* Arrow: Router -> Workspace */}
      <path
        d="M 445 245 L 505 245"
        fill="none"
        stroke={colors.edge}
        strokeWidth="2"
        markerEnd="url(#arrow-sys)"
      />

      {/* Layer 3: Utilities Cluster */}
      <g transform="translate(510, 40)">
        <rect
          width="210"
          height="410"
          rx="18"
          fill={colors.nodeBg}
          stroke={colors.nodeBorder}
          strokeWidth="2"
        />
        <text x="105" y="32" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.primary}>
          TOOL WORKSPACE & SUITES
        </text>
        <text x="105" y="48" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Client-side execution modules
        </text>

        {/* 6 Suite Mini Cards */}
        {[
          { y: 65, title: '📄 PDF & Document Studio', sub: 'pdf-lib & pdfjs-dist' },
          { y: 125, title: '🖼️ Image & Media Studio', sub: 'HTML5 Canvas & Compression' },
          { y: 185, title: '⚡ QR & Dev Utilities', sub: 'WebCrypto, Base64, JSON' },
          { y: 245, title: '🧮 Math & Calculators', sub: 'CGPA, Scientific, Units' },
          { y: 305, title: '✍️ Text & Typography', sub: 'Safe Markdown, Slugs' },
          { y: 365, title: '🛡️ Privacy & Security', sub: 'Entropy & Cryptography' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(15, ${item.y})`}>
            <rect
              width="180"
              height="50"
              rx="10"
              fill={isDark ? '#1a1a2e' : '#f8fafc'}
              stroke={colors.nodeBorder}
              strokeWidth="1"
            />
            <text x="12" y="22" fontWeight="700" fontSize="11" fill={colors.textMain}>
              {item.title}
            </text>
            <text x="12" y="38" fontSize="9.5" fill={colors.textMuted}>
              {item.sub}
            </text>
          </g>
        ))}
      </g>

      {/* Arrow: Workspace -> Browser APIs */}
      <path
        d="M 720 245 L 775 245"
        fill="none"
        stroke={colors.edge}
        strokeWidth="2"
        markerEnd="url(#arrow-sys)"
      />

      {/* Layer 4: Browser Sandboxed APIs */}
      <g transform="translate(780, 110)">
        <rect
          width="140"
          height="270"
          rx="16"
          fill={colors.accentGreenBg}
          stroke={colors.accentGreen}
          strokeWidth="2"
        />
        <text x="70" y="30" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.accentGreen}>
          LOCAL BROWSER APIS
        </text>
        <text x="70" y="46" textAnchor="middle" fontSize="9" fill={colors.textMuted}>
          Sandboxed Hardware
        </text>

        <g transform="translate(12, 65)">
          <rect width="116" height="38" rx="8" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <text x="58" y="24" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.textMain}>
            HTML5 Canvas
          </text>
        </g>
        <g transform="translate(12, 115)">
          <rect width="116" height="38" rx="8" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <text x="58" y="24" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.textMain}>
            W3C Web Crypto
          </text>
        </g>
        <g transform="translate(12, 165)">
          <rect width="116" height="38" rx="8" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <text x="58" y="24" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.textMain}>
            ArrayBuffers / Blobs
          </text>
        </g>
        <g transform="translate(12, 215)">
          <rect width="116" height="38" rx="8" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <text x="58" y="24" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.textMain}>
            LocalStorage
          </text>
        </g>
      </g>

      {/* Return Loop: Direct File Download to User */}
      <path
        d="M 850 380 C 850 480, 120 480, 120 295"
        fill="none"
        stroke={colors.accentGreen}
        strokeWidth="2"
        strokeDasharray="6 4"
        markerEnd="url(#arrow-sys)"
      />
      <rect x="380" y="455" width="220" height="24" rx="12" fill={colors.accentGreenBg} stroke={colors.accentGreen} />
      <text x="490" y="471" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.accentGreen}>
        Instant Local Download (No Cloud Upload)
      </text>
    </svg>
  );
};
