import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search,
  Moon,
  Sun,
  Heart,
  Menu,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, TOOLS } from '../../data/tools';

export const Header: React.FC = () => {
  const { theme, toggleTheme, favorites, setSearchModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [convertDropdownOpen, setConvertDropdownOpen] = useState(false);
  const location = useLocation();

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const closeMobile = () => {
    setMobileMenuOpen(false);
    setCategoriesDropdownOpen(false);
    setConvertDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-light-bg/90 dark:bg-[#0c0c0e]/85 border-b border-light-border dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group focus:outline-none" onClick={closeMobile}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-brand-purple to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-purple/20 group-hover:scale-105 transition-transform font-black text-base">
            <Layers className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg leading-tight tracking-tight text-light-text dark:text-white group-hover:text-purple-400 transition-colors">
                TOVIX
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {TOOLS.length} Tools
              </span>
            </div>
            <span className="text-[10px] font-medium text-light-muted dark:text-neutral-400 hidden sm:inline">
              Everyday digital utility suite
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
          <Link
            to="/"
            className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Home
          </Link>

          <Link
            to="/tools/pdf-merger"
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Merge PDF
          </Link>

          <Link
            to="/tools/pdf-splitter"
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Split PDF
          </Link>

          <Link
            to="/tools/pdf-compressor"
            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Compress PDF
          </Link>

          {/* Convert PDF dropdown */}
          <div className="relative">
            <button
              onClick={() => setConvertDropdownOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setConvertDropdownOpen(false), 200)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-expanded={convertDropdownOpen}
            >
              Convert PDF
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {convertDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-52 p-2 rounded-2xl bg-light-card dark:bg-[#15151c] border border-light-border dark:border-white/10 shadow-2xl z-50 animate-in fade-in duration-100">
                <Link
                  to="/tools/pdf-to-word"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  📄 PDF to Word (.doc)
                </Link>
                <Link
                  to="/tools/word-to-pdf"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  📝 Word / Text to PDF
                </Link>
                <Link
                  to="/tools/pdf-to-excel"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  📊 PDF to Excel / CSV
                </Link>
                <Link
                  to="/tools/pdf-to-markdown"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  #️⃣ PDF to Markdown
                </Link>
                <Link
                  to="/tools/images-to-pdf"
                  className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300"
                >
                  🖼️ Images to PDF
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/tools"
            className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/tools')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            All Utilities
          </Link>

          {/* Categories Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setCategoriesDropdownOpen(false), 200)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              aria-expanded={categoriesDropdownOpen}
              aria-haspopup="true"
            >
              Suites
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {categoriesDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl bg-light-card dark:bg-[#15151c] border border-light-border dark:border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories/${cat.id}`}
                    onClick={() => setCategoriesDropdownOpen(false)}
                    className="block px-3 py-2 rounded-xl text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/architecture"
            className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/architecture')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Architecture
          </Link>

          <Link
            to="/favorites"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/favorites')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
            Favorites
            {favorites.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          <Link
            to="/recent"
            className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/recent')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            Recent
          </Link>

          <Link
            to="/about"
            className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-semibold ${
              isActive('/about')
                ? 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border border-purple-500/30'
                : 'text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            About
          </Link>
        </nav>

        {/* Right side actions: Privacy guarantee badge, Quick search button, Theme Toggle, Mobile Hamburger */}
        <div className="flex items-center gap-2">
          {/* Privacy & No-Login Badge - Compact & Non-wrapping */}
          <span className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            100% Free & Local
          </span>
          {/* Quick Search Trigger */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-light-border dark:border-white/10 bg-slate-100 dark:bg-white/[0.05] hover:border-purple-500/50 text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white transition-all text-xs"
            aria-label="Quick search tools"
          >
            <Search className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden lg:inline text-xs">Search tools...</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-400">
              {isMac ? '⌘K' : 'Ctrl+K'}
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-light-border dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-full border border-light-border dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            onClick={closeMobile}
            className="block px-3 py-2 rounded-lg font-medium text-slate-800 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/tools"
            onClick={closeMobile}
            className="block px-3 py-2 rounded-lg font-medium text-slate-800 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5"
          >
            All Tools
          </Link>
          <Link
            to="/architecture"
            onClick={closeMobile}
            className="block px-3 py-2 rounded-lg font-medium text-purple-700 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold"
          >
            Architecture Center
          </Link>
          <Link
            to="/favorites"
            onClick={closeMobile}
            className="flex items-center justify-between px-3 py-2 rounded-lg font-medium text-slate-800 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Favorites
            </span>
            {favorites.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-purple text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            to="/recent"
            onClick={closeMobile}
            className="block px-3 py-2 rounded-lg font-medium text-slate-800 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Recent Tools
          </Link>

          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            <span className="px-3 text-xs font-semibold text-slate-500 dark:text-dark-muted uppercase tracking-wider">
              Categories
            </span>
            <div className="mt-1 space-y-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.id}`}
                  onClick={closeMobile}
                  className="block px-3 py-1.5 rounded-lg text-sm text-slate-800 dark:text-dark-text hover:bg-slate-100 dark:hover:bg-white/5"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-light-border dark:border-dark-border">
            <Link
              to="/about"
              onClick={closeMobile}
              className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text"
            >
              About TOVIX
            </Link>
            <Link
              to="/privacy"
              onClick={closeMobile}
              className="block px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-dark-muted hover:text-slate-900 dark:hover:text-dark-text"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
