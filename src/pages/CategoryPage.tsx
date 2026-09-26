import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../data/tools';
import { ToolGrid } from '../components/tools/ToolGrid';
import { EmptyState } from '../components/tools/EmptyState';
import { DynamicIcon } from '../components/common/DynamicIcon';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = CATEGORIES.find((c) => c.id === slug);
  const categoryTools = TOOLS.filter((t) => t.category === slug);

  if (!category) {
    return (
      <div className="py-12">
        <EmptyState
          title="Category Not Found"
          description="The category you're looking for doesn't exist in ToolNest."
          actionText="Explore All Tools"
          onAction={() => (window.location.href = '/tools')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-light-muted dark:text-dark-muted">
        <Link to="/" className="hover:text-brand-purple dark:hover:text-brand-accentLight">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <Link to="/tools" className="hover:text-brand-purple dark:hover:text-brand-accentLight">
          Categories
        </Link>
        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
        <span className="text-light-text dark:text-dark-text font-medium">{category.name}</span>
      </nav>

      {/* Category Banner */}
      <div className="p-8 rounded-3xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <DynamicIcon name={category.icon} className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                Utility Suite
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-light-text dark:text-white">
              {category.name}
            </h1>
            <p className="text-sm text-light-muted dark:text-neutral-400 mt-1 max-w-xl">
              {category.description}
            </p>
          </div>
        </div>

        <Link
          to="/tools"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-light-border dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-light-text dark:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          All Categories
        </Link>
      </div>

      {/* Category Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-light-text dark:text-dark-text">
            Available Utilities ({categoryTools.length})
          </h2>
        </div>

        <ToolGrid tools={categoryTools} />
      </div>
    </div>
  );
};
