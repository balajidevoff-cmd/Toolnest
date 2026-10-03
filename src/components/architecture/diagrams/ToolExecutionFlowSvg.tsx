import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const ToolExecutionFlowSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    primary: isDark ? '#a78bfa' : '#6d28d9',
    primaryBg: isDark ? '#292344' : '#ede9fe',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    edge: isDark ? '#a1a1b5' : '#94a3b8',
    green: isDark ? '#86efac' : '#166534',
    greenBg: isDark ? '#143422' : '#dcfce7',
    red: isDark ? '#fda4af' : '#b91c1c',
    redBg: isDark ? '#3c181d' : '#fee2e2',
    amber: isDark ? '#fcd34d' : '#92400e',
    amberBg: isDark ? '#372a11' : '#fef3c7',
  };

  return (
    <svg
      viewBox="0 0 960 480"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-flow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={colors.edge} />
        </marker>
        <marker
          id="arrow-err"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={colors.red} />
        </marker>
      </defs>

      {/* Main Flow: 5 columns */}
      {/* Col 1: Route & Metadata */}
      <g transform="translate(30, 80)">
        <rect width="160" height="70" rx="12" fill={colors.primaryBg} stroke={colors.primary} strokeWidth="1.5" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          1. ROUTE RESOLVES
        </text>
        <text x="80" y="48" textAnchor="middle" fontSize="10.5" fontWeight="600" fill={colors.textMain}>
          /tools/:slug
        </text>
      </g>

      <path d="M 110 150 L 110 195" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      <g transform="translate(30, 200)">
        <rect width="160" height="70" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          2. METADATA LOADED
        </text>
        <text x="80" y="48" textAnchor="middle" fontSize="10.5" fill={colors.textMuted}>
          tools.ts lookup
        </text>
      </g>

      <path d="M 110 270 L 110 315" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      <g transform="translate(30, 320)">
        <rect width="160" height="70" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          3. MOUNT & HISTORY
        </text>
        <text x="80" y="48" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          addStoredRecentTool()
        </text>
      </g>

      {/* Connect Col 1 to Col 2 */}
      <path d="M 190 355 L 245 355" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      {/* Col 2: User Input & Validation */}
      <g transform="translate(250, 320)">
        <rect width="160" height="70" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          4. USER INPUT
        </text>
        <text x="80" y="48" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          File, Text, Sliders, Audio
        </text>
      </g>

      <path d="M 330 320 L 330 275" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      {/* Validation Diamond */}
      <g transform="translate(250, 180)">
        <polygon points="80,0 160,45 80,90 0,45" fill={colors.amberBg} stroke={colors.amber} strokeWidth="1.5" />
        <text x="80" y="42" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.amber}>
          5. VALIDATE
        </text>
        <text x="80" y="56" textAnchor="middle" fontSize="9.5" fill={colors.amber}>
          Type & Size Check
        </text>
      </g>

      {/* Error Branch 1 */}
      <path d="M 250 225 L 180 225 L 180 180" stroke={colors.red} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-err)" />
      <g transform="translate(110, 140)">
        <rect width="120" height="36" rx="8" fill={colors.redBg} stroke={colors.red} />
        <text x="60" y="22" textAnchor="middle" fontWeight="600" fontSize="9.5" fill={colors.red}>
          Invalid Format / Size
        </text>
      </g>

      {/* Connect Col 2 to Col 3 */}
      <path d="M 410 225 L 465 225" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      {/* Col 3: Engine Processing */}
      <g transform="translate(470, 180)">
        <rect width="180" height="90" rx="14" fill={colors.primaryBg} stroke={colors.primary} strokeWidth="2" />
        <text x="90" y="30" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          6. SANDBOX PROCESSING
        </text>
        <text x="90" y="50" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          Local In-Memory Engine
        </text>
        <text x="90" y="68" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
          WASM / Workers / Canvas / PDF
        </text>
      </g>

      <path d="M 560 270 L 560 315" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      {/* Success / Error evaluation */}
      <g transform="translate(480, 320)">
        <polygon points="80,0 160,40 80,80 0,40" fill={colors.greenBg} stroke={colors.green} strokeWidth="1.5" />
        <text x="80" y="38" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.green}>
          7. SUCCESS?
        </text>
        <text x="80" y="52" textAnchor="middle" fontSize="9.5" fill={colors.green}>
          Try / Catch Guard
        </text>
      </g>

      {/* Exception Branch */}
      <path d="M 480 360 L 430 360 L 430 420" stroke={colors.red} strokeWidth="1.5" strokeDasharray="4 3" markerEnd="url(#arrow-err)" />
      <g transform="translate(370, 425)">
        <rect width="130" height="36" rx="8" fill={colors.redBg} stroke={colors.red} />
        <text x="65" y="22" textAnchor="middle" fontWeight="600" fontSize="9" fill={colors.red}>
          Error: Toast Notification
        </text>
      </g>

      {/* Col 4: Output & Preview */}
      <path d="M 640 360 L 695 360" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      <g transform="translate(700, 315)">
        <rect width="160" height="90" rx="14" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="80" y="30" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          8. RESULT GENERATION
        </text>
        <text x="80" y="50" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          Blob / DataURL / String
        </text>
        <text x="80" y="68" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
          Render Preview Canvas
        </text>
      </g>

      <path d="M 780 315 L 780 265" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      {/* Col 5: User Action & Cleanup */}
      <g transform="translate(700, 175)">
        <rect width="160" height="85" rx="14" fill={colors.greenBg} stroke={colors.green} strokeWidth="2" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.green}>
          9. EXPORT & DOWNLOAD
        </text>
        <text x="80" y="48" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          Copy to Clipboard
        </text>
        <text x="80" y="66" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
          Or Browser Download
        </text>
      </g>

      <path d="M 780 175 L 780 135" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-flow)" />

      <g transform="translate(700, 50)">
        <rect width="160" height="80" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="1.5" />
        <text x="80" y="28" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          10. RESOURCE CLEANUP
        </text>
        <text x="80" y="48" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          revokeObjectURL()
        </text>
        <text x="80" y="64" textAnchor="middle" fontSize="9" fill={colors.textMuted}>
          Free In-Memory Buffers
        </text>
      </g>
    </svg>
  );
};
