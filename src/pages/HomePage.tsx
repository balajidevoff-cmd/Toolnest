import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Clock,
  Trash2,
} from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolCategory } from '../types';
import { filterTools } from '../utils/search';
import { CategoryPills } from '../components/tools/CategoryPills';
import { ToolGrid } from '../components/tools/ToolGrid';
import { ToolCard } from '../components/tools/ToolCard';
import { EmptyState } from '../components/tools/EmptyState';
import { useApp } from '../context/AppContext';

export const HomePage: React.FC = () => {
  const { recentTools, clearRecent } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  const popularSuggestions = [
    { label: 'PDF Compressor', query: 'PDF Compressor' },
    { label: 'Image Resizer', query: 'Image Resizer' },
    { label: 'QR Generator', query: 'QR Generator' },
    { label: 'CGPA Calculator', query: 'CGPA Calculator' },
    { label: 'JSON Formatter', query: 'JSON Formatter' },
    { label: 'Passphrase Generator', query: 'Passphrase' },
  ];

  // Filter tools
  const filteredTools = filterTools(TOOLS, {
    query: searchQuery,
    category: selectedCategory,
  });

  const recentToolItems = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is typeof TOOLS[0] => t !== undefined);

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* Compact Hero Section */}
      <section className="relative text-center pt-2 pb-2 sm:pt-4 sm:pb-3 px-2">
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[220px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
        </div>

        {/* Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20 mb-2.5">
          <span>✨ 100% Free • Free Uploads up to 1024 MB (1 GB) • Zero Cloud Storage</span>
        </div>

        {/* Compact Editorial Headline */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-tight select-none">
          Every tool you need in{' '}
          <span className="editorial-pill align-middle mx-1 py-0.5 px-2.5 sm:px-3 text-lg sm:text-2xl font-semibold tracking-tight">
            one place
          </span>
        </h1>

        {/* Minimal Subtitle */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-neutral-400 max-w-xl mx-auto">
          {TOOLS.length} fast, 100% free client-side utilities with generous free 1024 MB file uploads. Zero server tracking, zero sign-in.
        </p>

        {/* Compact Central Search Bar */}
        <div className="mt-3.5 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 dark:text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 40 utilities (e.g. compress pdf, resize image, word count)..."
              className="w-full pl-10 pr-20 py-2 sm:py-2.5 rounded-full bg-white dark:bg-[#15151c] border border-slate-200/90 dark:border-white/10 focus:border-purple-500/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 text-xs sm:text-sm shadow-md shadow-black/5 dark:shadow-black/20 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-neutral-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/10 rounded-full cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick search chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-[11px] text-slate-500 dark:text-neutral-400">
            <span className="font-medium text-[11px]">Quick:</span>
            {popularSuggestions.slice(0, 5).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setSearchQuery(item.query)}
                className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.05] hover:bg-purple-100 dark:hover:bg-white/10 text-slate-600 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white border border-slate-200 dark:border-white/[0.08] transition-colors text-[11px] font-medium cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Used Section (Only displayed when the user has actually used utilities - otherwise 100% hidden) */}
      {recentToolItems.length > 0 && (
        <section className="space-y-3 p-4 sm:p-5 rounded-xl bg-purple-50/40 dark:bg-white/[0.02] border border-purple-200/50 dark:border-white/[0.08] animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-1 border-b border-purple-200/40 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-purple-600/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Recently Used
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                  {recentToolItems.length}
                </span>
              </h2>
            </div>
            <button
              type="button"
              onClick={clearRecent}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {recentToolItems.slice(0, 5).map((tool) => (
              <ToolCard key={`recent-${tool.id}`} tool={tool} />
            ))}
          </div>
        </section>
      )}

      {/* Main Utilities Catalog - Direct iLovePDF Style Directory */}
      <section className="space-y-4">
        {/* Category Filter Pills (Centered directly below search) */}
        <div className="flex flex-col items-center justify-center">
          <CategoryPills
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            align="center"
          />
        </div>

        {/* Results Count & Filter Reset Bar */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-neutral-400 text-[11px]">
            {selectedCategory === 'all' && !searchQuery
              ? `All Utilities (${filteredTools.length})`
              : `Showing ${filteredTools.length} ${filteredTools.length === 1 ? 'utility' : 'utilities'}`}
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="font-semibold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer text-xs"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* 5-Column Responsive Tool Cards Grid */}
        {filteredTools.length > 0 ? (
          <ToolGrid tools={filteredTools} />
        ) : (
          <EmptyState
            title="No utilities matched your search"
            description={`We couldn't find any tool matching "${searchQuery}". Try a different keyword or reset filters.`}
            actionText="Reset Filters"
            onAction={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
          />
        )}
      </section>

      {/* DETAILED EXPLANATIONS AT THE BOTTOM (Remaining Explaining) */}
      <section className="pt-12 sm:pt-16 border-t border-slate-200/80 dark:border-white/[0.08] space-y-12">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
            <Sparkles className="w-3 h-3" />
            <span>Complete Architecture & Documentation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Comprehensive Utility Suite Reference
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400">
            In-depth documentation of all 6 specialized utility categories and their client-side processing mechanics.
          </p>
        </div>

        {/* 6 Category Deep-Dive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. PDF & Documents */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm">
              PDF
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              PDF & Document Studio
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Enables local assembly, extraction, restructuring, and previewing of portable document formats with free file uploads up to 1024 MB (1 GB). Operates using client-side JavaScript PDF parsers and Canvas rasterization with zero cloud transmission.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>PDF Merger: Order and bind multiple documents</li>
              <li>PDF Splitter: Extract isolated pages or ranges</li>
              <li>PDF Compressor: Restructure object dictionaries</li>
              <li>Images to PDF: Convert albums into unified PDFs</li>
            </ul>
          </div>

          {/* 2. Image Studio */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
              IMG
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Image & Media Processing
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              High-performance graphics manipulation supporting files up to 1024 MB utilizing hardware-accelerated HTML5 Canvas 2D contexts. Scale, crop, recompress, and read camera metadata without server upload latency.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Image Resizer: Exact pixel or percentage scaling</li>
              <li>Image Compressor: Tunable lossy/lossless quality</li>
              <li>Format Converter: WebP, PNG, and JPEG transcoding</li>
              <li>Cropper: Interactive ratio framing and exports</li>
            </ul>
          </div>

          {/* 3. QR & Code */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              DEV
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Developer & Code Utilities
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Essential development aids including QR code matrix generation, JSON formatting and validation, live regular expression testing with group capture, and RFC4122 v4 UUID synthesis.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>QR Generator & Reader: Instant matrix decoding</li>
              <li>JSON Formatter: Syntax tree validation & indentation</li>
              <li>Regex Tester: Real-time pattern matching engine</li>
              <li>Base64 & URL: Web transmission encoding</li>
            </ul>
          </div>

          {/* 4. Calculators */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
              CALC
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Calculators & Math Engine
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Precision arithmetic and conversion utilities powered by safe tokenized mathematical parsing without unsafe code execution. Covers college grading, taxation, dates, and metric conversions.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Scientific Math: Safe tokenized formula parser</li>
              <li>CGPA Calculator: Multi-semester credit weighting</li>
              <li>GST & Percentage: Financial rates and margins</li>
              <li>Unit & Storage: Data byte & physical conversions</li>
            </ul>
          </div>

          {/* 5. Text & Writing */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
              TXT
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Text & Writing Workflows
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Real-time linguistic statistics, text cleaning, casing transformations, and formatted Markdown rendering. All typography is processed locally in browser memory with zero tracking.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Word Counter: Words, characters, and reading time</li>
              <li>Case Converter: Title, Camel, Kebab, and Snake</li>
              <li>Remove Spaces: Clean redundant whitespace lines</li>
              <li>Markdown Preview: Real-time rendered document view</li>
            </ul>
          </div>

          {/* 6. Privacy & Security */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
              SEC
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Privacy & Security Guard
            </h3>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              High-entropy secret generation backed by the browser's native window.crypto CSPRNG. Generates passwords, memorable multi-word passphrases, and computes SHA-256 file checksums.
            </p>
            <ul className="text-xs text-slate-500 dark:text-neutral-400 space-y-1 list-disc list-inside">
              <li>Password Generator: High-entropy character mixes</li>
              <li>Passphrase Generator: Multi-word dictionary security</li>
              <li>Strength Estimator: Bit entropy calculation</li>
              <li>Checksum Verifier: SHA-256 file verification</li>
            </ul>
          </div>
        </div>

        {/* Why TOVIX Architecture Core Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 pt-4">
          <div className="p-5 rounded-xl bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Zero Paywalls
            </h4>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              All 40 utilities are 100% free with generous 1024 MB (1 GB) upload limits and no quotas or feature locks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Client-Side Isolation
            </h4>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Files up to 1024 MB are processed locally in RAM and never transmitted to or stored on remote servers.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Zero Sign-In Friction
            </h4>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              No account creation, emails, or passwords required. Instant utility access.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-[#141419] border border-slate-200/80 dark:border-white/[0.08] shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Clean & Ad-Free
            </h4>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Free from intrusive video ads, trackers, cookie banners, or telemetry scripts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

