import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Workflow, 
  FileText, 
  SunMoon, 
  Database, 
  ShieldCheck, 
  Server, 
  Compass, 
  Cpu, 
  Search, 
  Code2, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DiagramViewer } from '../components/architecture/DiagramViewer';
import { SystemOverviewSvg } from '../components/architecture/diagrams/SystemOverviewSvg';
import { AppArchitectureSvg } from '../components/architecture/diagrams/AppArchitectureSvg';
import { ToolExecutionFlowSvg } from '../components/architecture/diagrams/ToolExecutionFlowSvg';
import { FileProcessingFlowSvg } from '../components/architecture/diagrams/FileProcessingFlowSvg';
import { ThemeArchitectureSvg } from '../components/architecture/diagrams/ThemeArchitectureSvg';
import { DataFlowSvg } from '../components/architecture/diagrams/DataFlowSvg';
import { SecurityThreatModelSvg } from '../components/architecture/diagrams/SecurityThreatModelSvg';
import { DeploymentArchitectureSvg } from '../components/architecture/diagrams/DeploymentArchitectureSvg';
import { UserJourneyFlowSvg } from '../components/architecture/diagrams/UserJourneyFlowSvg';
import { DIAGRAM_SOURCES } from '../components/architecture/diagrams/diagramSources';

interface ArchitectureSection {
  id: string;
  letter: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  renderComponent: (theme: 'dark' | 'light') => React.ReactNode;
  mermaidKey: keyof typeof DIAGRAM_SOURCES;
  docPath: string;
  keyTakeaways: string[];
}

export const ArchitecturePage: React.FC = () => {
  const [activeSectionId, setActiveSectionId] = useState<string>('system-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const sections: ArchitectureSection[] = useMemo(() => [
    {
      id: 'system-overview',
      letter: 'A',
      title: 'High-Level System Architecture',
      category: 'Core System',
      badge: 'C4 Context / System',
      description:
        'End-to-end architecture showing the user browser, client-side React 19 SPA, zero-backend isolation, local storage boundaries, and edge hosting on global CDNs.',
      renderComponent: (theme) => <SystemOverviewSvg theme={theme} />,
      mermaidKey: 'system-overview',
      docPath: '/docs/architecture/system-overview.md',
      keyTakeaways: [
        '100% Client-Side Processing: User files, tokens, and keystrokes never leave the client device.',
        'Zero-Backend Footprint: No external database, tracking pixels, or intermediate API servers.',
        'Edge Static Distribution: Sub-50ms static delivery across 300+ global CDN points of presence.'
      ]
    },
    {
      id: 'app-architecture',
      letter: 'B',
      title: 'Detailed Application Architecture',
      category: 'Frontend Architecture',
      badge: 'Component Tree & State',
      description:
        'Complete view of React components, Context providers, routing boundaries, tool catalog metadata, and modular tool workspace integration.',
      renderComponent: (theme) => <AppArchitectureSvg theme={theme} />,
      mermaidKey: 'app-architecture',
      docPath: '/docs/architecture/application-architecture.md',
      keyTakeaways: [
        'Decoupled Tool Catalog: Tools are defined by metadata interfaces with lazy-loaded tool components.',
        'Centralized AppContext: Reactive management of dark/light theme, search, favorites, and recents.',
        'Isolated Workspaces: Every utility renders inside standard ToolWorkspaceLayout with breadcrumbs and privacy badges.'
      ]
    },
    {
      id: 'tool-execution',
      letter: 'C',
      title: 'Tool Execution Flow',
      category: 'Execution Pipeline',
      badge: 'State Machine & Lifecycle',
      description:
        'Visual sequence and state machine from tool invocation to input sanitization, background computation, UI updates, error boundary catching, and result export.',
      renderComponent: (theme) => <ToolExecutionFlowSvg theme={theme} />,
      mermaidKey: 'tool-execution',
      docPath: '/docs/architecture/tool-execution-flow.md',
      keyTakeaways: [
        'Strict Input Guardrails: Early validation prevents memory overflow or unhandled exceptions.',
        'Async State Machine: Idle -> Validating -> Processing -> Success/Error states with progress indicators.',
        'Graceful Error Boundaries: Isolated component crashes never bring down the global application.'
      ]
    },
    {
      id: 'file-processing',
      letter: 'D',
      title: 'File Processing Flow',
      category: 'Data & Processing',
      badge: 'In-Memory Pipeline',
      description:
        'Pipeline for in-memory PDF merging/splitting (pdf-lib), client-side image compression (HTML5 Canvas), and secure blob download mechanics with memory cleanup.',
      renderComponent: (theme) => <FileProcessingFlowSvg theme={theme} />,
      mermaidKey: 'file-processing',
      docPath: '/docs/architecture/file-processing.md',
      keyTakeaways: [
        'Local File Reader: HTML5 File API and Drag & Drop directly stream bytes to ArrayBuffers in RAM.',
        'Zero Network I/O: WASM and native Canvas operations manipulate binary data entirely locally.',
        'Garbage Collection Cleanup: URL.revokeObjectURL() is invoked immediately after download completion.'
      ]
    },
    {
      id: 'theme-system',
      letter: 'E',
      title: 'Theme System Architecture',
      category: 'UI/UX & Accessibility',
      badge: 'Anti-FOUC & WCAG AA',
      description:
        'Dual-token design system spanning CSS custom properties, Tailwind dark: variants, WCAG AA contrast compliance (4.5:1 text, 3:1 graphical), and anti-FOUC initialization.',
      renderComponent: (theme) => <ThemeArchitectureSvg theme={theme} />,
      mermaidKey: 'theme-system',
      docPath: '/docs/architecture/theme-system.md',
      keyTakeaways: [
        'Anti-FOUC Inline Head Script: Checks localStorage and prefers-color-scheme before DOM paint.',
        'Dual-Layer Token Engine: CSS variables (--surface, --foreground, --card) harmonize with Tailwind utilities.',
        'Strict WCAG AA Compliance: 100% of text elements guarantee >= 4.5:1 contrast against light and dark backdrops.'
      ]
    },
    {
      id: 'data-flow',
      letter: 'F',
      title: 'Data Flow & State Architecture',
      category: 'State Management',
      badge: 'Reactive Unidirectional Flow',
      description:
        'Unidirectional data flow diagram demonstrating how state mutations propagate through AppContext, localStorage persistence, and component rerenders.',
      renderComponent: (theme) => <DataFlowSvg theme={theme} />,
      mermaidKey: 'data-flow',
      docPath: '/docs/architecture/data-flow.md',
      keyTakeaways: [
        'Deterministic State Pipeline: User action -> Action Dispatch -> Context Reducer -> LocalStorage -> View Sync.',
        'Storage Key Partitioning: Clean namespacing (`toolsnest_theme`, `toolsnest_favorites`, `toolsnest_recent`).',
        'Defensive Storage Hydration: Safe JSON parsing handles corrupted or outdated storage payloads gracefully.'
      ]
    },
    {
      id: 'security-model',
      letter: 'G',
      title: 'Security & Threat Model',
      category: 'Security & Privacy',
      badge: 'Zero-Trust Client Boundary',
      description:
        'STRIDE threat analysis and browser trust boundaries proving zero data exfiltration, memory isolation, secure sanitization, and strict CSP controls.',
      renderComponent: (theme) => <SecurityThreatModelSvg theme={theme} />,
      mermaidKey: 'security-model',
      docPath: '/docs/architecture/security-and-privacy.md',
      keyTakeaways: [
        'Total Zero-Trust Architecture: No credentials, cookies, or tracking headers exist to compromise.',
        'In-Memory Data Ephemerality: Processed files exist only in V8 heap memory and are wiped on tab close.',
        'Defensive DOM Sanitization: Regex & DOMPurify logic strips malicious scripts from preview outputs.'
      ]
    },
    {
      id: 'deployment-architecture',
      letter: 'H',
      title: 'Deployment & CI/CD Architecture',
      category: 'DevOps & Infrastructure',
      badge: 'Static Edge Deployment',
      description:
        'Continuous integration and deployment workflow from git push to TypeScript validation, Vitest suite, Vite chunk splitting, and Anycast CDN global distribution.',
      renderComponent: (theme) => <DeploymentArchitectureSvg theme={theme} />,
      mermaidKey: 'deployment-architecture',
      docPath: '/docs/architecture/deployment.md',
      keyTakeaways: [
        'Automated CI Quality Gate: Commits must pass strict typechecking (`tsc -b`) and Vitest test suite.',
        'Optimized Dynamic Splitting: Code-split route boundaries prevent bloated initial bundle sizes.',
        'Serverless CDN Edge: Immutable static assets cached globally with Brotli/Gzip compression.'
      ]
    },
    {
      id: 'user-journeys',
      letter: 'I',
      title: 'Core User Journey Flows',
      category: 'User Experience',
      badge: 'Interaction Pathways',
      description:
        'Step-by-step pathways for six core user journeys: Search & Launch, PDF Operations, Image Processing, Theme Toggling, Favorites/Recents, and Architecture Navigation.',
      renderComponent: (theme) => <UserJourneyFlowSvg theme={theme} />,
      mermaidKey: 'user-journeys',
      docPath: '/docs/architecture/user-journeys.md',
      keyTakeaways: [
        'Sub-1-Second Discovery: Global Cmd+K launcher allows instant keyboard navigation to all 40 utilities.',
        'Intuitive 4-Step Pipelines: Standardized Drop -> Configure -> Process -> Download user experience.',
        'Persistent Customization: Starred tools and recent history persist across browser sessions.'
      ]
    }
  ], []);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.badge.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="editorial-pill text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                System Specification
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">v2.1 Architecture Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Architecture & Diagram Center
            </h1>
            <p className="mt-2 text-base text-slate-600 dark:text-slate-400 max-w-3xl">
              Interactive architectural blueprints, state machines, and data pipelines for TOVIX’s client-side utility engine. Every diagram includes pan/zoom controls, SVG export, and live Mermaid specification.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              Explore All Utilities
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Global Architecture KPI Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Privacy Model
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">100% In-Browser</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Zero server uploads or storage</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <Cpu className="w-4 h-4 text-purple-500" />
              Runtime Engine
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">React 19 + Vite 6</div>
            <div className="text-[11px] text-slate-500 mt-0.5">WASM & Canvas acceleration</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <SunMoon className="w-4 h-4 text-amber-500" />
              Accessibility
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">WCAG AA 4.5:1+</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Anti-FOUC dual design token engine</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-blue-500" />
              Modular Tools
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">40 Utilities</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Categorized in 5 core domains</div>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search architecture & diagrams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>

          {/* Section List */}
          <div className="space-y-2">
            {filteredSections.map((sec) => {
              const isActive = sec.id === activeSection.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isActive
                      ? 'bg-purple-500/10 border-purple-500/40 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {sec.letter}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-sm truncate">{sec.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {sec.category} • {sec.badge}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Architecture Documentation Index */}
          <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              Architecture Docs (docs/architecture/)
            </h3>
            <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400">
              <li className="flex items-center justify-between">
                <span>System Overview</span>
                <span className="font-mono text-[10px] text-slate-400">system-overview.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Application Hierarchy</span>
                <span className="font-mono text-[10px] text-slate-400">application-architecture.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tool Execution Lifecycle</span>
                <span className="font-mono text-[10px] text-slate-400">tool-execution-flow.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>File Memory Pipeline</span>
                <span className="font-mono text-[10px] text-slate-400">file-processing.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Theme Design Tokens</span>
                <span className="font-mono text-[10px] text-slate-400">theme-system.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Data & Storage Sync</span>
                <span className="font-mono text-[10px] text-slate-400">data-flow.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>STRIDE Threat Model</span>
                <span className="font-mono text-[10px] text-slate-400">security-and-privacy.md</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Edge CI/CD Pipeline</span>
                <span className="font-mono text-[10px] text-slate-400">deployment.md</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Active Viewer & Explanations */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Section Header */}
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-purple-600 text-white font-bold flex items-center justify-center text-sm shadow">
                  {activeSection.letter}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {activeSection.title}
                </h2>
              </div>
              <span className="editorial-pill text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                {activeSection.badge}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeSection.description}
            </p>
          </div>

          {/* Interactive Diagram Viewer */}
          <DiagramViewer
            id={`diagram-${activeSection.id}`}
            title={`${activeSection.title} (${activeSection.letter})`}
            description={activeSection.description}
            mermaidSource={DIAGRAM_SOURCES[activeSection.mermaidKey] || ''}
          >
            {(theme) => activeSection.renderComponent(theme)}
          </DiagramViewer>

          {/* Key Engineering Takeaways */}
          <div className="p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Key Architectural Guarantees & Constraints
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSection.keyTakeaways.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ArchitecturePage;
