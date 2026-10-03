interface SvgProps {
  theme?: 'dark' | 'light';
}

export const DeploymentArchitectureSvg: React.FC<SvgProps> = () => {
  return (
    <svg
      viewBox="0 0 1000 680"
      className="w-full h-auto max-w-full select-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="depDev" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="depCi" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="depCdn" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="depBrowser" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.08" />
        </linearGradient>
        <marker
          id="depArrow"
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

      {/* Development Environment Box */}
      <rect x="40" y="40" width="200" height="600" rx="12" fill="url(#depDev)" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" />
      <text x="140" y="75" textAnchor="middle" fill="#2563eb" className="font-bold text-sm">DEVELOPMENT</text>
      <text x="140" y="95" textAnchor="middle" fill="#64748b" className="text-xs">Local Workstation</text>

      <g transform="translate(60, 120)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#93c5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Vite 6 Dev Server</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">HMR / ESM modules</text>
      </g>

      <g transform="translate(60, 220)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#93c5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">TypeScript & ESLint</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Strict Type Checking</text>
      </g>

      <g transform="translate(60, 320)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#93c5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Vitest Unit Suite</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">30 Unit & Util Tests</text>
      </g>

      <g transform="translate(60, 420)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#93c5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Git Version Control</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Local Feature Branch</text>
      </g>

      {/* CI / CD Pipeline Box */}
      <rect x="280" y="40" width="200" height="600" rx="12" fill="url(#depCi)" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4 4" />
      <text x="380" y="75" textAnchor="middle" fill="#7c3aed" className="font-bold text-sm">CI / CD PIPELINE</text>
      <text x="380" y="95" textAnchor="middle" fill="#64748b" className="text-xs">GitHub Actions / Vercel</text>

      <g transform="translate(300, 120)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Git Push (main)</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Webhook Trigger</text>
      </g>

      <g transform="translate(300, 220)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">CI Test Gate</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">tsc -b && vitest run</text>
      </g>

      <g transform="translate(300, 320)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Vite Production Build</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Rollup Chunk Splitting</text>
      </g>

      <g transform="translate(300, 420)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#c4b5fd" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Static Artifacts (dist/)</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">HTML, JS, CSS, Assets</text>
      </g>

      {/* Global Edge Hosting Box */}
      <rect x="520" y="40" width="200" height="600" rx="12" fill="url(#depCdn)" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
      <text x="620" y="75" textAnchor="middle" fill="#059669" className="font-bold text-sm">EDGE HOSTING</text>
      <text x="620" y="95" textAnchor="middle" fill="#64748b" className="text-xs">Vercel / Cloudflare / Netlify</text>

      <g transform="translate(540, 120)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#86efac" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Global CDN PoPs</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">300+ Edge Locations</text>
      </g>

      <g transform="translate(540, 220)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#86efac" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Security Headers</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">HSTS, CSP, X-Frame</text>
      </g>

      <g transform="translate(540, 320)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#86efac" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Brotli / Gzip Cache</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Immutable static assets</text>
      </g>

      <g transform="translate(540, 420)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#86efac" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Zero Backend Tier</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">0 servers, 0 databases</text>
      </g>

      {/* End User Sandbox Box */}
      <rect x="760" y="40" width="200" height="600" rx="12" fill="url(#depBrowser)" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
      <text x="860" y="75" textAnchor="middle" fill="#d97706" className="font-bold text-sm">CLIENT BROWSER</text>
      <text x="860" y="95" textAnchor="middle" fill="#64748b" className="text-xs">Edge Execution Sandbox</text>

      <g transform="translate(780, 120)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#fcd34d" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">HTTPS Download</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Cached HTML/JS/CSS</text>
      </g>

      <g transform="translate(780, 220)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#fcd34d" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">WASM & Workers</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">pdf-lib, Canvas, WebAPI</text>
      </g>

      <g transform="translate(780, 320)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#fcd34d" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Local Data Privacy</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Files never leave RAM</text>
      </g>

      <g transform="translate(780, 420)">
        <rect width="160" height="70" rx="8" className="fill-white dark:fill-slate-800" stroke="#fcd34d" strokeWidth="1.5" />
        <text x="80" y="32" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Offline Capability</text>
        <text x="80" y="52" textAnchor="middle" className="fill-slate-500 text-[10px]">Runs when disconnected</text>
      </g>

      {/* Connecting Flow Arrows */}
      <line x1="220" y1="455" x2="300" y2="155" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" strokeDasharray="3 3" />
      <line x1="380" y1="190" x2="380" y2="220" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="380" y1="290" x2="380" y2="320" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="380" y1="390" x2="380" y2="420" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="460" y1="455" x2="540" y2="155" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="620" y1="190" x2="620" y2="320" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="700" y1="155" x2="780" y2="155" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="860" y1="190" x2="860" y2="220" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />
      <line x1="860" y1="290" x2="860" y2="320" stroke="#6366f1" strokeWidth="2" markerEnd="url(#depArrow)" />

      {/* Bottom Summary Bar */}
      <g transform="translate(60, 560)">
        <rect width="880" height="60" rx="8" className="fill-slate-100 dark:fill-slate-900" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="30" cy="30" r="10" fill="#10b981" />
        <text x="55" y="27" className="fill-slate-800 dark:fill-slate-100 font-semibold text-xs">Zero Server Infrastructure & Maximum Performance</text>
        <text x="55" y="44" className="fill-slate-500 text-[11px]">Static bundle delivered worldwide via Anycast CDN; computation executes 100% inside browser V8 engine.</text>
      </g>
    </svg>
  );
};
