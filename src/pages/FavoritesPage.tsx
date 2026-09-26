import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';
import { ToolGrid } from '../components/tools/ToolGrid';
import { EmptyState } from '../components/tools/EmptyState';

export const FavoritesPage: React.FC = () => {
  const { favorites } = useApp();

  const favoriteTools = TOOLS.filter((tool) => favorites.includes(tool.id));

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-semibold tracking-wider uppercase text-rose-400">
          <Heart className="w-3.5 h-3.5 fill-rose-400" />
          <span>Personal Bookmarks</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-light-text dark:text-white">
          Saved{' '}
          <span className="editorial-pill text-xl sm:text-3xl font-medium mx-1 py-0.5 px-3">
            Favorites
          </span>
        </h1>
        <p className="text-sm text-light-muted dark:text-neutral-400 max-w-xl">
          Quickly access your pinned utilities. Saved locally inside your browser storage for instant workflow continuity.
        </p>
      </div>

      {favoriteTools.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
              {favoriteTools.length} {favoriteTools.length === 1 ? 'saved tool' : 'saved tools'}
            </span>
          </div>
          <ToolGrid tools={favoriteTools} />
        </div>
      ) : (
        <EmptyState
          icon={<Heart className="w-6 h-6 text-rose-500" />}
          title="No favorites saved yet"
          description="Click the heart icon on any tool card or workspace to pin it here for quick everyday access."
          actionText="Browse All Tools"
          onAction={() => (window.location.href = '/tools')}
        />
      )}
    </div>
  );
};
