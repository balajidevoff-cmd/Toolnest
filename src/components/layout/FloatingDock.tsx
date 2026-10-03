import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Heart,
  Layers,
  Clock,
  ArrowUp,
  ChevronUp,
  ChevronDown,
  Info,
  Grid,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS } from '../../data/tools';
import { filterTools } from '../../utils/search';

export const FloatingDock: React.FC = () => {
  const { favorites, setSearchModalOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [promptQuery, setPromptQuery] = useState('');
  const [isPromptExpanded, setIsPromptExpanded] = useState(true);
  const [quickMatches, setQuickMatches] = useState<typeof TOOLS>([]);

  const handlePromptChange = (val: string) => {
    setPromptQuery(val);
    if (val.trim().length > 1) {
      const matches = filterTools(TOOLS, { query: val }).slice(0, 3);
      setQuickMatches(matches);
    } else {
      setQuickMatches([]);
    }
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptQuery.trim()) {
      setSearchModalOpen(true);
      return;
    }
    const matches = filterTools(TOOLS, { query: promptQuery });
    if (matches.length > 0) {
      navigate(matches[0].route);
      setPromptQuery('');
      setQuickMatches([]);
    } else {
      setSearchModalOpen(true);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-[95vw] w-auto pointer-events-auto">
      {/* Quick Search Dropdown Suggestion Popup (if user typed something in dock prompt) */}
      {quickMatches.length > 0 && (
        <div className="w-full sm:w-[480px] p-2 rounded-2xl bg-white/95 dark:bg-[#141419]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl mb-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>Instant Utility Matches</span>
            <span className="text-[10px] text-purple-600 dark:text-editorial-yellow font-medium">Press Enter to Launch Top Result</span>
          </div>
          <div className="space-y-1">
            {quickMatches.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  navigate(tool.route);
                  setPromptQuery('');
                  setQuickMatches([]);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white transition-colors group"
              >
                <div className="truncate">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-editorial-yellow transition-colors">
                    {tool.name}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-neutral-400 block truncate">
                    {tool.description}
                  </span>
                </div>
                <ArrowUp className="w-3.5 h-3.5 rotate-45 text-slate-400 dark:text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-editorial-yellow shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Pill Dock Bar */}
      <div className="flex flex-col items-center p-1.5 rounded-[26px] bg-white/95 dark:bg-[#121216]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-dock transition-all">
        {/* Upper segmented navigation pill cluster */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-medium">
          {/* Logo Pill */}
          <Link
            to="/"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-white/10 hover:bg-purple-200 dark:hover:bg-white/20 text-purple-700 dark:text-white font-black text-sm tracking-tighter transition-all"
            title="TOVIX Home"
          >
            T.
          </Link>

          {/* Quick nav pills */}
          <Link
            to="/tools"
            className={`px-3 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/tools')
                ? 'bg-purple-100 dark:bg-white/15 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Tools
          </Link>

          <Link
            to="/architecture"
            className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/architecture')
                ? 'bg-purple-100 dark:bg-white/15 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Arch
          </Link>

          <Link
            to="/favorites"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
              isActive('/favorites')
                ? 'bg-purple-100 dark:bg-white/15 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400 dark:text-neutral-400'}`} />
            <span className="hidden sm:inline">Saved</span>
            {favorites.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] text-white flex items-center justify-center font-bold">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link
            to="/recent"
            className={`hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full transition-all text-xs font-medium ${
              isActive('/recent')
                ? 'bg-purple-100 dark:bg-white/15 text-purple-700 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-neutral-400" />
            <span>Recent</span>
          </Link>

          {/* The signature spotlight button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 rounded-full bg-[#fde047] hover:bg-[#facc15] text-[#121214] font-bold text-xs tracking-tight shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {/* Prompt Expand/Collapse button */}
          <button
            onClick={() => setIsPromptExpanded(!isPromptExpanded)}
            className="p-1.5 rounded-full text-slate-400 dark:text-neutral-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            title={isPromptExpanded ? 'Minimize prompt bar' : 'Expand prompt bar'}
          >
            {isPromptExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Lower interactive prompt bar */}
        {isPromptExpanded && (
          <form
            onSubmit={handlePromptSubmit}
            className="w-full sm:w-[420px] md:w-[480px] mt-1.5 pt-1.5 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 px-2"
          >
            <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-neutral-800 text-purple-700 dark:text-editorial-yellow flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-purple-700 dark:text-[#fde047]" />
            </div>

            <input
              type="text"
              value={promptQuery}
              onChange={(e) => handlePromptChange(e.target.value)}
              placeholder="Tell me what you need to do... (e.g. compress pdf)"
              className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-400 focus:outline-none"
            />

            <kbd className="hidden sm:inline text-[10px] font-mono text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>

            <button
              type="submit"
              className="w-6 h-6 rounded-full bg-purple-600 dark:bg-white/10 hover:bg-purple-700 dark:hover:bg-white/20 text-white flex items-center justify-center transition-colors shrink-0"
              title="Launch tool"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
