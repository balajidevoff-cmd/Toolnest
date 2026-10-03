import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const ThemeArchitectureSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    primary: isDark ? '#a78bfa' : '#6d28d9',
    primaryBg: isDark ? '#292344' : '#ede9fe',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    edge: isDark ? '#a1a1b5' : '#94a3b8',
    red: isDark ? '#fda4af' : '#b91c1c',
    redBg: isDark ? '#3c181d' : '#fee2e2',
    green: isDark ? '#86efac' : '#166534',
    greenBg: isDark ? '#143422' : '#dcfce7',
  };

  return (
    <svg
      viewBox="0 0 940 500"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-theme"
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

      {/* Top Banner: Before vs After Audit */}
      <g transform="translate(30, 20)">
        <rect width="420" height="90" rx="14" fill={colors.redBg} stroke={colors.red} strokeWidth="1.5" />
        <text x="20" y="26" fontWeight="700" fontSize="11" fill={colors.red}>
          ORIGINAL ROOT CAUSE (AUDIT FINDING)
        </text>
        <text x="20" y="46" fontSize="10" fill={colors.textMain}>
          • Inappropriate hardcoded text-white, text-neutral-300 on white backgrounds
        </text>
        <text x="20" y="62" fontSize="10" fill={colors.textMain}>
          • Hover states turning text white in light mode (e.g. hover:text-white)
        </text>
        <text x="20" y="78" fontSize="10" fill={colors.textMain}>
          • Low contrast text-neutral-400 (2.8:1 ratio, failing WCAG AA 4.5:1)
        </text>
      </g>

      <g transform="translate(490, 20)">
        <rect width="420" height="90" rx="14" fill={colors.greenBg} stroke={colors.green} strokeWidth="1.5" />
        <text x="20" y="26" fontWeight="700" fontSize="11" fill={colors.green}>
          ENGINEERED RESOLUTION (WCAG AA COMPLIANT)
        </text>
        <text x="20" y="46" fontSize="10" fill={colors.textMain}>
          • Centralized CSS Design Tokens (:root & [data-theme="dark"])
        </text>
        <text x="20" y="62" fontSize="10" fill={colors.textMain}>
          • High-contrast semantic tokens: --background, --foreground, --surface
        </text>
        <text x="20" y="78" fontSize="10" fill={colors.textMain}>
          • Zero flash of wrong theme via early head detection script in index.html
        </text>
      </g>

      {/* Center Flow: Theme State & Propagation */}
      {/* 1. User Action */}
      <g transform="translate(30, 150)">
        <rect width="180" height="90" rx="14" fill={colors.primaryBg} stroke={colors.primary} strokeWidth="2" />
        <text x="90" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          1. THEME SELECTION
        </text>
        <text x="90" y="52" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          Header / Mobile Toggle
        </text>
        <text x="90" y="70" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          toggleTheme() in AppContext
        </text>
      </g>

      <path d="M 210 195 L 265 195" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-theme)" />

      {/* 2. Storage & State */}
      <g transform="translate(270, 150)">
        <rect width="180" height="90" rx="14" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="90" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          2. PERSISTENCE
        </text>
        <text x="90" y="52" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          LocalStorage & React State
        </text>
        <text x="90" y="70" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          saveStoredTheme(&apos;dark&apos; | &apos;light&apos;)
        </text>
      </g>

      <path d="M 450 195 L 505 195" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-theme)" />

      {/* 3. DOM & ColorScheme Synchronization */}
      <g transform="translate(510, 140)">
        <rect width="200" height="110" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <text x="100" y="25" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          3. DOM SYNCHRONIZATION
        </text>
        <rect x="15" y="38" width="170" height="20" rx="4" fill={isDark ? '#1e1e2d' : '#f1f5f9'} />
        <text x="100" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill={colors.textMain}>
          classList.toggle(&apos;dark&apos;)
        </text>
        <rect x="15" y="62" width="170" height="20" rx="4" fill={isDark ? '#1e1e2d' : '#f1f5f9'} />
        <text x="100" y="76" textAnchor="middle" fontSize="9" fontWeight="600" fill={colors.textMain}>
          setAttribute(&apos;data-theme&apos;, theme)
        </text>
        <rect x="15" y="86" width="170" height="20" rx="4" fill={isDark ? '#1e1e2d' : '#f1f5f9'} />
        <text x="100" y="100" textAnchor="middle" fontSize="9" fontWeight="600" fill={colors.textMain}>
          style.colorScheme = theme
        </text>
      </g>

      <path d="M 710 195 L 755 195" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-theme)" />

      {/* 4. CSS Design Tokens Layer */}
      <g transform="translate(760, 140)">
        <rect width="150" height="110" rx="16" fill={colors.primaryBg} stroke={colors.primary} strokeWidth="2" />
        <text x="75" y="25" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          4. CSS TOKENS
        </text>
        <text x="75" y="48" textAnchor="middle" fontSize="9.5" fill={colors.textMain}>--background</text>
        <text x="75" y="64" textAnchor="middle" fontSize="9.5" fill={colors.textMain}>--foreground</text>
        <text x="75" y="80" textAnchor="middle" fontSize="9.5" fill={colors.textMain}>--surface & --card</text>
        <text x="75" y="96" textAnchor="middle" fontSize="9.5" fill={colors.textMain}>--primary & --ring</text>
      </g>

      {/* Downward Branch: Component Adoption */}
      <path d="M 835 250 L 835 300 L 470 300 L 470 325" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-theme)" />

      {/* Layer 5: Component Surfaces */}
      <g transform="translate(140, 330)">
        <rect width="660" height="130" rx="18" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <text x="330" y="26" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.primary}>
          5. COMPLETE ADAPTATION ACROSS THE ENTIRE ECOSYSTEM
        </text>

        <g transform="translate(20, 42)">
          <rect width="140" height="70" rx="10" fill={isDark ? '#1a1a2e' : '#f8fafc'} stroke={colors.nodeBorder} />
          <text x="70" y="26" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Navigation & Dock
          </text>
          <text x="70" y="44" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
            Search, Pills, Dropdown
          </text>
          <text x="70" y="58" textAnchor="middle" fontSize="9.5" fill={colors.green}>
            High Contrast Active
          </text>
        </g>

        <g transform="translate(180, 42)">
          <rect width="140" height="70" rx="10" fill={isDark ? '#1a1a2e' : '#f8fafc'} stroke={colors.nodeBorder} />
          <text x="70" y="26" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Cards & Text
          </text>
          <text x="70" y="44" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
            All 40 Tool Cards
          </text>
          <text x="70" y="58" textAnchor="middle" fontSize="9.5" fill={colors.green}>
            Legible Descriptions
          </text>
        </g>

        <g transform="translate(340, 42)">
          <rect width="140" height="70" rx="10" fill={isDark ? '#1a1a2e' : '#f8fafc'} stroke={colors.nodeBorder} />
          <text x="70" y="26" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Forms & Inputs
          </text>
          <text x="70" y="44" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
            Inputs, Textareas, Selects
          </text>
          <text x="70" y="58" textAnchor="middle" fontSize="9.5" fill={colors.green}>
            Native Controls Themed
          </text>
        </g>

        <g transform="translate(500, 42)">
          <rect width="140" height="70" rx="10" fill={isDark ? '#1a1a2e' : '#f8fafc'} stroke={colors.nodeBorder} />
          <text x="70" y="26" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Architecture Center
          </text>
          <text x="70" y="44" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
            All SVG Nodes & Edges
          </text>
          <text x="70" y="58" textAnchor="middle" fontSize="9.5" fill={colors.green}>
            Dynamic Vector Color
          </text>
        </g>
      </g>
    </svg>
  );
};
