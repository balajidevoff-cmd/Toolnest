import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const DataFlowSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    primary: isDark ? '#a78bfa' : '#6d28d9',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    blue: isDark ? '#93c5fd' : '#1e40af',
    blueBg: isDark ? '#17223b' : '#dbeafe',
    amber: isDark ? '#fcd34d' : '#92400e',
    amberBg: isDark ? '#372a11' : '#fef3c7',
    red: isDark ? '#fda4af' : '#b91c1c',
    redBg: isDark ? '#3c181d' : '#fee2e2',
    green: isDark ? '#86efac' : '#166534',
    greenBg: isDark ? '#143422' : '#dcfce7',
  };

  return (
    <svg
      viewBox="0 0 940 480"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Box 1: Volatile Browser Memory (RAM) */}
      <g transform="translate(30, 40)">
        <rect width="280" height="400" rx="16" fill={colors.redBg} stroke={colors.red} strokeWidth="2" />
        <text x="140" y="32" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.red}>
          TRANSIENT BROWSER RAM
        </text>
        <text x="140" y="50" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Immediately discarded on tab close / refresh
        </text>

        {[
          { title: 'Uploaded Files & PDFs', desc: 'Held in Blob memory for manipulation' },
          { title: 'Images & Canvas Buffers', desc: 'Raw RGBA ImageData and compressed bytes' },
          { title: 'Passwords & Passphrases', desc: 'Generated entropy strings; never saved' },
          { title: 'JSON & Code Documents', desc: 'Parsed trees & formatted text in state' },
          { title: 'Temporary Object URLs', desc: 'blob:http://... wiped with revokeObjectURL' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(15, ${75 + idx * 62})`}>
            <rect width="250" height="52" rx="10" fill={colors.nodeBg} stroke={colors.nodeBorder} />
            <text x="12" y="22" fontWeight="700" fontSize="11" fill={colors.textMain}>
              {item.title}
            </text>
            <text x="12" y="38" fontSize="9.5" fill={colors.textMuted}>
              {item.desc}
            </text>
          </g>
        ))}
      </g>

      {/* Box 2: LocalStorage Boundary */}
      <g transform="translate(330, 40)">
        <rect width="280" height="400" rx="16" fill={colors.blueBg} stroke={colors.blue} strokeWidth="2" />
        <text x="140" y="32" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.blue}>
          PERSISTED LOCALSTORAGE
        </text>
        <text x="140" y="50" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Stored on device via browser key-value API
        </text>

        {[
          { title: 'toolsnest_theme', desc: "'dark' | 'light' user preference setting" },
          { title: 'toolsnest_favorites', desc: 'Array of bookmarked tool slugs (e.g. pdf-merger)' },
          { title: 'toolsnest_recent_tools', desc: 'IDs of last 20 opened utilities' },
          { title: 'safeStorage Fallback', desc: 'In-memory Map fallback if storage restricted' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(15, ${75 + idx * 75})`}>
            <rect width="250" height="62" rx="10" fill={colors.nodeBg} stroke={colors.nodeBorder} />
            <text x="12" y="24" fontWeight="700" fontSize="11" fill={colors.primary}>
              {item.title}
            </text>
            <text x="12" y="44" fontSize="9.5" fill={colors.textMuted}>
              {item.desc}
            </text>
          </g>
        ))}
      </g>

      {/* Box 3: Zero-Upload Boundary */}
      <g transform="translate(630, 40)">
        <rect
          width="280"
          height="400"
          rx="16"
          fill={colors.greenBg}
          stroke={colors.green}
          strokeWidth="2"
        />
        <text x="140" y="32" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.green}>
          EXTERNAL NETWORK BOUNDARY
        </text>
        <text x="140" y="50" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Strict zero-leakage security posture
        </text>

        <g transform="translate(20, 80)">
          <rect width="240" height="85" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <circle cx="28" cy="30" r="12" fill={colors.green} opacity="0.2" />
          <text x="28" y="34" textAnchor="middle" fontSize="12" fill={colors.green}>✓</text>
          <text x="50" y="28" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Zero Server Uploads
          </text>
          <text x="50" y="44" fontSize="9.5" fill={colors.textMuted}>
            No document, PDF, or picture
          </text>
          <text x="50" y="58" fontSize="9.5" fill={colors.textMuted}>
            ever transmitted across the wire
          </text>
        </g>

        <g transform="translate(20, 180)">
          <rect width="240" height="85" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <circle cx="28" cy="30" r="12" fill={colors.green} opacity="0.2" />
          <text x="28" y="34" textAnchor="middle" fontSize="12" fill={colors.green}>✓</text>
          <text x="50" y="28" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Zero Telemetry / Trackers
          </text>
          <text x="50" y="44" fontSize="9.5" fill={colors.textMuted}>
            No Google Analytics, Meta Pixel,
          </text>
          <text x="50" y="58" fontSize="9.5" fill={colors.textMuted}>
            or third-party tracking scripts
          </text>
        </g>

        <g transform="translate(20, 280)">
          <rect width="240" height="85" rx="12" fill={colors.nodeBg} stroke={colors.nodeBorder} />
          <circle cx="28" cy="30" r="12" fill={colors.green} opacity="0.2" />
          <text x="28" y="34" textAnchor="middle" fontSize="12" fill={colors.green}>✓</text>
          <text x="50" y="28" fontWeight="700" fontSize="11" fill={colors.textMain}>
            Zero Database Records
          </text>
          <text x="50" y="44" fontSize="9.5" fill={colors.textMuted}>
            No user accounts, sessions,
          </text>
          <text x="50" y="58" fontSize="9.5" fill={colors.textMuted}>
            or persistent backend data stores
          </text>
        </g>
      </g>
    </svg>
  );
};
