import React from 'react';

interface SvgProps {
  theme?: 'dark' | 'light';
}

export const UserJourneyFlowSvg: React.FC<SvgProps> = () => {
  return (
    <svg
      viewBox="0 0 1000 700"
      className="w-full h-auto max-w-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="ujArrow"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 8 5 L 0 9 z" fill="#6366f1" />
        </marker>
      </defs>

      {/* Row 1: Search & Launch Tool Journey */}
      <g transform="translate(40, 40)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#6366f1" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#4f46e5" className="font-bold text-xs">JOURNEY 1</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Search & Launch</text>

        {/* Steps */}
        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Press Cmd+K</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Open Search Modal</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Type Query</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Realtime Filter</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Select Tool</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Keyboard or Click</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-indigo-50 dark:fill-indigo-950/40" stroke="#818cf8" />
          <text x="70" y="26" textAnchor="middle" className="fill-indigo-700 dark:fill-indigo-300 font-semibold text-[11px]">Navigate Route</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Recorded in Recent List</text>
        </g>
      </g>

      {/* Row 2: PDF Processing Journey */}
      <g transform="translate(40, 145)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#ef4444" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#dc2626" className="font-bold text-xs">JOURNEY 2</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Merge / Split PDF</text>

        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Drop PDF Files</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">HTML5 Drag & Drop</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Reorder Pages</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Custom Page Ranges</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">pdf-lib Merge</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">RAM In-Memory Build</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-emerald-50 dark:fill-emerald-950/40" stroke="#34d399" />
          <text x="70" y="26" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 font-semibold text-[11px]">Instant Download</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Blob saved without upload</text>
        </g>
      </g>

      {/* Row 3: Image Conversion & Crop */}
      <g transform="translate(40, 250)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#10b981" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#059669" className="font-bold text-xs">JOURNEY 3</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Image Compress/Crop</text>

        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Upload Image</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">PNG / JPEG / WebP</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Adjust Sliders</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Quality & Dimensions</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Canvas Render</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Compare Before/After</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-emerald-50 dark:fill-emerald-950/40" stroke="#34d399" />
          <text x="70" y="26" textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-300 font-semibold text-[11px]">Save Optimized File</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Bytes saved metric shown</text>
        </g>
      </g>

      {/* Row 4: Theme Switching */}
      <g transform="translate(40, 355)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#f59e0b" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#d97706" className="font-bold text-xs">JOURNEY 4</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Theme Switcher</text>

        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Click Sun/Moon</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Header or Dock</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Toggle Theme</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">AppContext State Change</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">DOM Mutation</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">class + data-theme sync</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-amber-50 dark:fill-amber-950/40" stroke="#fcd34d" />
          <text x="70" y="26" textAnchor="middle" className="fill-amber-700 dark:fill-amber-300 font-semibold text-[11px]">Instant Repaint</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Persisted in localStorage</text>
        </g>
      </g>

      {/* Row 5: Favorites & History */}
      <g transform="translate(40, 460)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#ec4899" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#db2777" className="font-bold text-xs">JOURNEY 5</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Favorites & Recents</text>

        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Star a Tool</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Click Heart / Star Icon</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Optimistic Update</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Animated Toast Trigger</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Sync LocalStorage</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">toolsnest_favorites</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-pink-50 dark:fill-pink-950/40" stroke="#f472b6" />
          <text x="70" y="26" textAnchor="middle" className="fill-pink-700 dark:fill-pink-300 font-semibold text-[11px]">Dock / Page Pin</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Quick 1-click access</text>
        </g>
      </g>

      {/* Row 6: Architecture & Diagram Exploration */}
      <g transform="translate(40, 565)">
        <rect width="920" height="85" rx="8" className="fill-slate-50 dark:fill-slate-900" stroke="#e2e8f0" strokeWidth="1" />
        <rect x="0" y="0" width="160" height="85" rx="8" fill="#8b5cf6" fillOpacity="0.15" />
        <text x="80" y="38" textAnchor="middle" fill="#7c3aed" className="font-bold text-xs">JOURNEY 6</text>
        <text x="80" y="55" textAnchor="middle" fill="#64748b" className="text-[10px]">Architecture Center</text>

        <g transform="translate(180, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Visit /architecture</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Header / Footer Link</text>
        </g>
        <line x1="305" y1="42" x2="335" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(340, 15)">
          <rect width="120" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="60" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Pick Diagram (A-J)</text>
          <text x="60" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Left Nav & Filter</text>
        </g>
        <line x1="465" y1="42" x2="495" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(500, 15)">
          <rect width="130" height="55" rx="6" className="fill-white dark:fill-slate-800" stroke="#cbd5e1" />
          <text x="65" y="26" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-[11px]">Pan / Zoom / Mode</text>
          <text x="65" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Interactive DiagramViewer</text>
        </g>
        <line x1="635" y1="42" x2="665" y2="42" stroke="#6366f1" strokeWidth="1.5" markerEnd="url(#ujArrow)" />

        <g transform="translate(670, 15)">
          <rect width="140" height="55" rx="6" className="fill-purple-50 dark:fill-purple-950/40" stroke="#c084fc" />
          <text x="70" y="26" textAnchor="middle" className="fill-purple-700 dark:fill-purple-300 font-semibold text-[11px]">Export SVG / MMD</text>
          <text x="70" y="42" textAnchor="middle" className="fill-slate-500 text-[9px]">Download vector or code</text>
        </g>
      </g>
    </svg>
  );
};
