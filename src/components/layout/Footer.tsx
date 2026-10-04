import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Sparkles, CheckCircle2, Lock } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../../data/tools';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-light-card/60 dark:bg-[#08080a] border-t border-light-border dark:border-white/[0.08] mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
        {/* Prominent 100% Free & Local Banner */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-purple-950/40 border border-slate-200/90 dark:border-purple-500/30 shadow-md shadow-purple-500/5 dark:shadow-purple-900/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                TOVIX is 100% Free, Private & Completely Local — No Cloud or Remote Server Requirements Needed.
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                All document compression, audio/video trimming, format conversions, and cryptographic tools execute strictly inside your client browser memory. Your files never leave your device and zero data is sent to external servers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold whitespace-nowrap shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            100% Client-Side Safe
          </div>
        </div>

        {/* Directory of ALL Tools Grouped by Category */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-light-border dark:border-white/[0.08] pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              All {TOOLS.length} Free Built-in Utilities Directory
            </h3>
            <span className="text-xs text-purple-400 font-medium">Free up to 1024 MB</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 text-xs">
            {CATEGORIES.map((cat) => {
              const catTools = TOOLS.filter((t) => t.category === cat.id);
              return (
                <div key={cat.id} className="space-y-2.5">
                  <Link
                    to={`/categories/${cat.id}`}
                    className="font-bold text-slate-900 dark:text-purple-300 hover:text-purple-600 block transition-colors"
                  >
                    {cat.name}
                  </Link>
                  <ul className="space-y-1.5 text-slate-600 dark:text-neutral-400">
                    {catTools.map((tool) => (
                      <li key={tool.id}>
                        <Link
                          to={tool.route}
                          className="hover:text-purple-600 dark:hover:text-white transition-colors block truncate"
                          title={tool.name}
                        >
                          {tool.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 4-Column Navigation Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8 border-t border-light-border dark:border-white/[0.08]">
          {/* Column 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-sm font-black text-sm">
                T.
              </div>
              <span className="font-bold text-lg text-light-text dark:text-white tracking-tight">
                TOVIX
              </span>
            </Link>
            <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
              Every tool you need in one place. Fast, privacy-first digital utilities designed for students, developers, designers, and creators.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero server upload for local utilities</span>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-400">
              <li>
                <Link to="/" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  All Utilities ({TOOLS.length})
                </Link>
              </li>
              <li>
                <Link to="/architecture" className="hover:text-purple-700 dark:hover:text-white font-semibold transition-colors">
                  Architecture & Diagrams
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  Saved Favorites
                </Link>
              </li>
              <li>
                <Link to="/recent" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  Recently Launched
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Tool Suites
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-400">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/categories/${cat.id}`}
                    className="hover:text-purple-700 dark:hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Platform & Privacy */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Trust & Philosophy
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-neutral-400">
              <li>
                <Link to="/about" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  About TOVIX
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-purple-700 dark:hover:text-white transition-colors">
                  Privacy Policy & Local Sandbox
                </Link>
              </li>
            </ul>
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-editorial-yellow inline mr-1" />
              TOVIX is an independent utility suite. No registration, no ads, no cloud requirement.
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="pt-8 border-t border-light-border dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-neutral-400">
          <p>© {new Date().getFullYear()} TOVIX — Everyday Digital Utility Hub. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for everyday efficiency</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
