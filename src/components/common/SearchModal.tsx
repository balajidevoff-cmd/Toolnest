import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TOOLS } from '../../data/tools';
import { filterTools } from '../../utils/search';
import { DynamicIcon } from './DynamicIcon';

export const SearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen } = useApp();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = filterTools(TOOLS, { query }).slice(0, 8);

  useEffect(() => {
    if (searchModalOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchModalOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex].route);
    }
  };

  const handleSelect = (route: string) => {
    setSearchModalOpen(false);
    navigate(route);
  };

  if (!searchModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setSearchModalOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-light-border dark:border-dark-border">
          <Search className="w-5 h-5 text-slate-400 dark:text-dark-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search tools by name, task, keyword (e.g. compress, qr, cgpa)..."
            className="w-full bg-transparent text-slate-900 dark:text-dark-text placeholder:text-slate-400 dark:placeholder:text-dark-muted focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 dark:text-dark-muted hover:text-slate-700 dark:hover:text-dark-text mr-1"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-dark-muted border border-slate-200 dark:border-dark-border">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="flex flex-col gap-1">
              {results.map((tool, idx) => (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.route)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    selectedIndex === idx
                      ? 'bg-purple-100 dark:bg-brand-purple/15 text-purple-800 dark:text-brand-accentLight'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-800 dark:text-dark-text'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedIndex === idx
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-50 dark:bg-white/5 text-purple-700 dark:text-brand-accentLight'
                      }`}
                    >
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-dark-text">
                          {tool.name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-dark-muted">
                          {tool.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-dark-muted truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 shrink-0 text-slate-400 dark:text-dark-muted ml-2 opacity-60" />
                </button>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 dark:text-dark-muted">
              <p className="text-sm">No tools found matching &quot;{query}&quot;</p>
              <p className="text-xs mt-1">Try keywords like PDF, resize, password, or calculator.</p>
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-t border-light-border dark:border-dark-border flex items-center justify-between text-xs text-slate-600 dark:text-dark-muted">
          <span>Navigate with <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-slate-700 dark:text-slate-300">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-slate-700 dark:text-slate-300">↓</kbd></span>
          <span>Select with <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10 font-mono text-slate-700 dark:text-slate-300">Enter</kbd></span>
        </div>
      </div>
    </div>
  );
};
