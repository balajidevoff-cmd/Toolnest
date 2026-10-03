import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, ShieldCheck, HelpCircle } from 'lucide-react';
import { ToolMetadata } from '../../types';
import { useApp } from '../../context/AppContext';
import { CATEGORIES, TOOLS } from '../../data/tools';
import { DynamicIcon } from '../common/DynamicIcon';
import { ToolCard } from './ToolCard';

interface ToolWorkspaceLayoutProps {
  tool: ToolMetadata;
  children: React.ReactNode;
}

export const ToolWorkspaceLayout: React.FC<ToolWorkspaceLayoutProps> = ({
  tool,
  children,
}) => {
  const { isFavorite, toggleFavorite, addRecent } = useApp();
  const favorite = isFavorite(tool.id);

  const category = CATEGORIES.find((c) => c.id === tool.category);

  // Record this tool in recent tools and reset scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    addRecent(tool.id);
  }, [tool.id]);

  // Related tools: other tools in same category, up to 3
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
        <Link to="/" className="hover:text-brand-purple dark:hover:text-brand-accentLight transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        {category && (
          <>
            <Link
              to={`/categories/${category.id}`}
              className="hover:text-brand-purple dark:hover:text-brand-accentLight transition-colors"
            >
              {category.name}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </>
        )}
        <span className="text-light-text dark:text-dark-text font-medium">{tool.name}</span>
      </nav>

      {/* Tool Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 text-purple-700 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 shadow-md">
            <DynamicIcon name={tool.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400">
                {category?.name || tool.category}
              </span>
              {tool.isPopular && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-editorial-yellow border border-amber-500/30">
                  POPULAR
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {tool.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Header Actions: Favorite and Privacy badge */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            onClick={() => toggleFavorite(tool.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              favorite
                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                : 'border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white hover:border-purple-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#181820]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{favorite ? 'Saved in Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>
      </div>

      {/* Privacy & Instructions Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 text-xs">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div>
            <span className="font-semibold text-emerald-950 dark:text-white">Privacy Guarantee: </span>
            <span className="text-emerald-800 dark:text-neutral-300">{tool.privacyLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/20 text-xs">
          <HelpCircle className="w-5 h-5 shrink-0 text-purple-600 dark:text-purple-400" />
          <div>
            <span className="font-semibold text-purple-950 dark:text-white">Quick Guide: </span>
            <span className="text-purple-800 dark:text-neutral-300">{tool.shortInstructions}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Workspace */}
      <div className="rounded-3xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 p-6 sm:p-8 shadow-xl">
        {children}
      </div>

      {/* Related Tools */}
      {relatedTools.length > 0 && (
        <div className="pt-6 border-t border-light-border dark:border-dark-border">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">
            More in {category?.name || 'this category'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
