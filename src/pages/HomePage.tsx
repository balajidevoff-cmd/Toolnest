import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  ArrowRight,
  Clock,
  Trash2,
  SlidersHorizontal,
} from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolCategory } from '../types';
import { filterTools } from '../utils/search';
import { CategoryPills } from '../components/tools/CategoryPills';
import { ToolGrid } from '../components/tools/ToolGrid';
import { EmptyState } from '../components/tools/EmptyState';
import { useApp } from '../context/AppContext';

import { ShowcaseCardRow } from '../components/home/ShowcaseCardRow';

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

  const popularTools = TOOLS.filter((t) => t.isPopular).slice(0, 8);

  const recentToolItems = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is typeof TOOLS[0] => t !== undefined);

  return (
    <div className="space-y-14 pb-12">
      {/* Hero Section inspired directly by the editorial reference screenshot */}
      <section className="relative text-center pt-8 pb-8 sm:pt-14 sm:pb-12 px-2">
        {/* Glow backdrop */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-neutral-400 mb-6 animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-editorial-yellow" />
          <span>Everyday Digital Utility Hub</span>
        </div>

        {/* Editorial headline matching the exact style of the reference image */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-light-text dark:text-white max-w-5xl mx-auto leading-[1.25] sm:leading-[1.18] select-none">
          ToolNest crafts thoughtful{' '}
          <span className="editorial-pill align-middle mx-1 py-1 px-3 sm:px-5 text-lg sm:text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight">
            digital utilities
          </span>{' '}
          — so naturally your workflow feels effortless{' '}
          <span className="text-editorial-yellow font-black tracking-widest text-2xl sm:text-4xl md:text-5xl">
            ...
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-light-muted dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          40 fast, privacy-first utilities for developers, students, designers, and creators.
          Zero cloud uploads — all computations run safely on your machine.
        </p>

        {/* Central Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-4.5 w-5 h-5 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to accomplish today? (e.g. compress pdf, resize image, calc cgpa)..."
              className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-full bg-light-card dark:bg-[#15151c] border border-light-border dark:border-white/10 focus:border-purple-500/80 text-light-text dark:text-white placeholder:text-light-muted dark:placeholder:text-neutral-400 text-sm sm:text-base shadow-xl shadow-black/20 transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 px-3 py-1 text-xs font-semibold text-light-muted dark:text-neutral-300 hover:text-white bg-black/5 dark:bg-white/10 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          {/* Popular search quick chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 text-xs text-light-muted dark:text-neutral-400">
            <span className="font-medium text-xs">Quick search:</span>
            {popularSuggestions.map((item) => (
              <button
                key={item.label}
                onClick={() => setSearchQuery(item.query)}
                className="px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.05] hover:bg-white/10 hover:text-white border border-light-border dark:border-white/[0.08] transition-colors text-xs font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Suites Showcase Row (Exact visual replica of bottom cards from screenshot) */}
      <ShowcaseCardRow />

      {/* Category Pills Bar */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-light-text dark:text-white">
            <SlidersHorizontal className="w-4 h-4 text-purple-400" />
            <span>Browse by Category</span>
          </div>
          <span className="text-xs text-light-muted dark:text-dark-muted">
            Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
          </span>
        </div>

        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* If search query or category filter is active, show the filtered grid right away */}
      {(searchQuery || selectedCategory !== 'all') ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">
              Search & Filter Results ({filteredTools.length})
            </h2>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs text-brand-purple hover:underline"
            >
              Reset all filters
            </button>
          </div>

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
      ) : (
        <>
          {/* Recently Used Section (Only shown if user has recent tools) */}
          {recentToolItems.length > 0 && (
            <section className="space-y-4 p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
                    Recently Used
                  </h2>
                </div>
                <button
                  onClick={clearRecent}
                  className="flex items-center gap-1.5 text-xs text-light-muted dark:text-dark-muted hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentToolItems.slice(0, 4).map((tool) => (
                  <Link
                    key={tool.id}
                    to={tool.route}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-brand-purple/40 shadow-sm transition-all group"
                  >
                    <div className="truncate mr-2">
                      <p className="font-semibold text-sm text-light-text dark:text-dark-text group-hover:text-brand-purple dark:group-hover:text-brand-accentLight truncate">
                        {tool.name}
                      </p>
                      <p className="text-[11px] text-light-muted dark:text-dark-muted truncate">
                        {tool.category.replace('-', ' ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-light-muted dark:text-dark-muted group-hover:translate-x-1 group-hover:text-brand-purple transition-all shrink-0" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Popular Tools Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-light-text dark:text-dark-text">
                  Popular Tools
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Frequently accessed utilities for students, developers, and designers.
                </p>
              </div>
              <Link
                to="/tools"
                className="text-xs font-semibold text-brand-purple dark:text-brand-accentLight hover:underline flex items-center gap-1"
              >
                View all 40 tools
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ToolGrid tools={popularTools} />
          </section>

          {/* All Tools Section */}
          <section className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-light-text dark:text-dark-text">
                  All Utilities
                </h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-0.5">
                  Complete directory of {TOOLS.length} privacy-focused tools.
                </p>
              </div>
            </div>

            <ToolGrid tools={TOOLS} />
          </section>
        </>
      )}

      {/* Why ToolNest Section */}
      <section className="pt-12 border-t border-light-border dark:border-white/[0.08]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-light-text dark:text-white">
            Engineered for Precision & Privacy
          </h2>
          <p className="text-sm text-light-muted dark:text-neutral-400 mt-2">
            Built for speed, clarity, and zero-compromise respect for your device and data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-purple-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-light-text dark:text-white mb-2">
              Free Everyday Utilities
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              No hidden paywalls, subscription models, or gated features. All 40 tools are freely unlocked.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-emerald-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-light-text dark:text-white mb-2">
              100% Client-Side Sandbox
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              PDFs, photos, hashes, and text are processed in-browser. Your files never hit a remote server.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-indigo-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-light-text dark:text-white mb-2">
              Zero Login Friction
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Solve your problem immediately without filling signup forms, verifying emails, or passwords.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-amber-500/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-light-text dark:text-white mb-2">
              Instant & Ad-Free
            </h3>
            <p className="text-xs text-light-muted dark:text-neutral-400 leading-relaxed">
              Zero pop-ups, zero video commercials, zero telemetry bloat. Just pure, clean utility.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
