import React from 'react';

interface SvgProps {
  theme: 'dark' | 'light';
}

export const AppArchitectureSvg: React.FC<SvgProps> = ({ theme }) => {
  const isDark = theme === 'dark';

  const colors = {
    nodeBg: isDark ? '#151525' : '#ffffff',
    nodeBorder: isDark ? '#34344d' : '#e2e8f0',
    primary: isDark ? '#a78bfa' : '#6d28d9',
    primaryBg: isDark ? '#292344' : '#ede9fe',
    textMain: isDark ? '#f5f3ff' : '#0f172a',
    textMuted: isDark ? '#b5b5cc' : '#475569',
    edge: isDark ? '#a1a1b5' : '#94a3b8',
    blueBg: isDark ? '#17223b' : '#dbeafe',
    blueText: isDark ? '#93c5fd' : '#1e40af',
  };

  return (
    <svg
      viewBox="0 0 940 520"
      className="w-full h-full max-h-[480px] drop-shadow-sm font-sans"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arrow-app"
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

      {/* Entry node */}
      <g transform="translate(370, 20)">
        <rect width="200" height="60" rx="14" fill={colors.primaryBg} stroke={colors.primary} strokeWidth="2" />
        <text x="100" y="27" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.primary}>
          ENTRY POINT
        </text>
        <text x="100" y="47" textAnchor="middle" fontWeight="600" fontSize="11" fill={colors.textMain}>
          src/main.tsx
        </text>
      </g>

      <path d="M 470 80 L 470 115" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-app)" />

      {/* App & Context Layer */}
      <g transform="translate(250, 120)">
        <rect width="440" height="85" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <rect width="440" height="28" rx="16" fill={isDark ? '#1e1e2d' : '#f1f5f9'} />
        <text x="220" y="19" textAnchor="middle" fontWeight="700" fontSize="11" fill={colors.primary}>
          ROOT PROVIDER & APP ROUTER (src/App.tsx)
        </text>
        
        {/* AppContext pill */}
        <rect x="25" y="40" width="180" height="34" rx="8" fill={colors.primaryBg} />
        <text x="115" y="61" textAnchor="middle" fontWeight="600" fontSize="10.5" fill={colors.primary}>
          AppContext.tsx (Theme, State)
        </text>

        {/* BrowserRouter pill */}
        <rect x="235" y="40" width="180" height="34" rx="8" fill={colors.blueBg} />
        <text x="325" y="61" textAnchor="middle" fontWeight="600" fontSize="10.5" fill={colors.blueText}>
          BrowserRouter (React Router v7)
        </text>
      </g>

      <path d="M 470 205 L 470 235" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-app)" />

      {/* Global AppLayout */}
      <g transform="translate(180, 240)">
        <rect width="580" height="90" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <text x="290" y="24" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.textMain}>
          SHARED GLOBAL SHELL (src/components/layout/AppLayout.tsx)
        </text>

        {/* 5 Shell components */}
        {[
          { x: 20, name: 'Header.tsx' },
          { x: 130, name: 'FloatingDock.tsx' },
          { x: 250, name: 'SearchModal.tsx' },
          { x: 370, name: 'ToastContainer.tsx' },
          { x: 490, name: 'Footer.tsx' },
        ].map((item, idx) => (
          <g key={idx} transform={`translate(${item.x}, 40)`}>
            <rect width="105" height="36" rx="8" fill={isDark ? '#1a1a2e' : '#f8fafc'} stroke={colors.nodeBorder} />
            <text x="52" y="22" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.textMuted}>
              {item.name}
            </text>
          </g>
        ))}
      </g>

      {/* Split to Pages and Workspace */}
      <path d="M 320 330 L 220 375" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-app)" />
      <path d="M 620 330 L 720 375" stroke={colors.edge} strokeWidth="2" markerEnd="url(#arrow-app)" />

      {/* Pages Cluster */}
      <g transform="translate(40, 380)">
        <rect width="360" height="120" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <text x="180" y="25" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.primary}>
          TOP-LEVEL ROUTE PAGES
        </text>
        <g transform="translate(15, 38)">
          {[
            'HomePage.tsx', 'ToolsPage.tsx', 'ArchitecturePage.tsx',
            'CategoryPage.tsx', 'FavoritesPage.tsx', 'RecentPage.tsx',
            'AboutPage.tsx', 'PrivacyPage.tsx', 'NotFoundPage.tsx'
          ].map((page, idx) => {
            const col = idx % 3;
            const row = Math.floor(idx / 3);
            return (
              <g key={idx} transform={`translate(${col * 112}, ${row * 24})`}>
                <rect width="106" height="20" rx="6" fill={isDark ? '#1a1a26' : '#f1f5f9'} />
                <text x="53" y="14" textAnchor="middle" fontSize="9" fontWeight="500" fill={colors.textMain}>
                  {page}
                </text>
              </g>
            );
          })}
        </g>
      </g>

      {/* Tool Workspace Execution Subsystem */}
      <g transform="translate(540, 380)">
        <rect width="360" height="120" rx="16" fill={colors.nodeBg} stroke={colors.nodeBorder} strokeWidth="2" />
        <text x="180" y="25" textAnchor="middle" fontWeight="700" fontSize="12" fill={colors.primary}>
          TOOL WORKSPACE SUBSYSTEM
        </text>
        <g transform="translate(15, 40)">
          <rect width="160" height="30" rx="8" fill={colors.primaryBg} />
          <text x="80" y="19" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.primary}>
            ToolWorkspacePage.tsx
          </text>

          <rect x="170" width="160" height="30" rx="8" fill={colors.blueBg} />
          <text x="250" y="19" textAnchor="middle" fontWeight="600" fontSize="10" fill={colors.blueText}>
            ToolWorkspaceLayout.tsx
          </text>

          <rect y="40" width="330" height="26" rx="6" fill={isDark ? '#1e1e2d' : '#f8fafc'} stroke={colors.nodeBorder} />
          <text x="165" y="57" textAnchor="middle" fontSize="9.5" fontWeight="500" fill={colors.textMuted}>
            Loads registered tool component dynamically via slug
          </text>
        </g>
      </g>
    </svg>
  );
};
