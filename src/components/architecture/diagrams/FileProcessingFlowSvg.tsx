import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const FileProcessingFlowSvg: React.FC<SvgProps> = ({ theme }) => {
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
    blue: isDark ? '#93c5fd' : '#1e40af',
    blueBg: isDark ? '#17223b' : '#dbeafe',
  };

  return (
    <svg
      viewBox="0 0 940 480"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-file"
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

      {/* Stage 1: File Ingestion */}
      <g transform="translate(30, 160)">
        <rect width="180" height="150" rx="14" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <rect width="180" height="32" rx="14" fill={colors.primaryBg} />
        <text x="90" y="21" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          STAGE 1: FILE INGESTION
        </text>
        <text x="90" y="58" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          FileUploadDropzone
        </text>
        <text x="90" y="75" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Drag-and-Drop or File Picker
        </text>
        <line x1="20" y1="95" x2="160" y2="95" stroke={colors.nodeBorder} strokeWidth="1" />
        <text x="90" y="115" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.blue}>
          MIME Type Validation
        </text>
        <text x="90" y="132" textAnchor="middle" fontSize="9.5" fill={colors.textMuted}>
          Max Size Check (e.g. 25MB)
        </text>
      </g>

      <path d="M 210 235 L 265 235" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-file)" />

      {/* Stage 2: Memory Read */}
      <g transform="translate(270, 160)">
        <rect width="180" height="150" rx="14" fill={colors.blueBg} stroke={colors.blue} strokeWidth="2" />
        <text x="90" y="25" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.blue}>
          STAGE 2: BROWSER RAM
        </text>
        <text x="90" y="60" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          FileReader / ArrayBuffer
        </text>
        <text x="90" y="80" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          file.arrayBuffer()
        </text>
        <text x="90" y="100" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          In-Memory Byte Stream
        </text>
        <rect x="25" y="115" width="130" height="24" rx="12" fill={colors.nodeBg} />
        <text x="90" y="131" textAnchor="middle" fontWeight="600" fontSize="9.5" fill={colors.blue}>
          Zero Network Payload
        </text>
      </g>

      <path d="M 450 235 L 505 235" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-file)" />

      {/* Stage 3: Specialized Engine Processing */}
      <g transform="translate(510, 80)">
        <rect width="190" height="310" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <rect width="190" height="32" rx="16" fill={isDark ? '#1e1e2d' : '#f1f5f9'} />
        <text x="95" y="21" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          STAGE 3: CLIENT ENGINES
        </text>

        <g transform="translate(15, 48)">
          <rect width="160" height="65" rx="10" fill={colors.primaryBg} />
          <text x="12" y="20" fontWeight="700" fontSize="11" fill={colors.primary}>
            PDF Processing Engine
          </text>
          <text x="12" y="36" fontSize="9.5" fill={colors.textMain}>
            pdf-lib (Merge, Split, Extract)
          </text>
          <text x="12" y="52" fontSize="9" fill={colors.textMuted}>
            pdfjs-dist (Canvas Rendering)
          </text>
        </g>

        <g transform="translate(15, 130)">
          <rect width="160" height="65" rx="10" fill={colors.blueBg} />
          <text x="12" y="20" fontWeight="700" fontSize="11" fill={colors.blue}>
            Image Studio Engine
          </text>
          <text x="12" y="36" fontSize="9.5" fill={colors.textMain}>
            HTML5 2D Canvas Context
          </text>
          <text x="12" y="52" fontSize="9" fill={colors.textMuted}>
            browser-image-compression
          </text>
        </g>

        <g transform="translate(15, 212)">
          <rect width="160" height="65" rx="10" fill={colors.greenBg} />
          <text x="12" y="20" fontWeight="700" fontSize="11" fill={colors.green}>
            WebCrypto & QR Engine
          </text>
          <text x="12" y="36" fontSize="9.5" fill={colors.textMain}>
            crypto.subtle.digest (SHA-256)
          </text>
          <text x="12" y="52" fontSize="9" fill={colors.textMuted}>
            qrcode & jsqr libraries
          </text>
        </g>
      </g>

      <path d="M 700 235 L 745 235" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-file)" />

      {/* Stage 4: Output Blob & Download */}
      <g transform="translate(750, 160)">
        <rect width="160" height="150" rx="14" fill={colors.greenBg} stroke={colors.green} strokeWidth="2" />
        <text x="80" y="25" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.green}>
          STAGE 4: EXPORT & REVOKE
        </text>
        <text x="80" y="58" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          Blob Generation
        </text>
        <text x="80" y="78" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          URL.createObjectURL()
        </text>
        <text x="80" y="96" textAnchor="middle" fontSize="10" fill={colors.textMuted}>
          Synthesized Anchor Click
        </text>
        <line x1="20" y1="110" x2="140" y2="110" stroke={colors.green} strokeWidth="1" opacity="0.4" />
        <text x="80" y="130" textAnchor="middle" fontWeight="600" fontSize="9.5" fill={colors.green}>
          URL.revokeObjectURL()
        </text>
      </g>
    </svg>
  );
};
