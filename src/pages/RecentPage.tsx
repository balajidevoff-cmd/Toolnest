import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TOOLS } from '../data/tools';
import { ToolGrid } from '../components/tools/ToolGrid';
import { EmptyState } from '../components/tools/EmptyState';

export const RecentPage: React.FC = () => {
  const { recentTools, clearRecent } = useApp();

  const recentToolItems = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is typeof TOOLS[0] => t !== undefined);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold tracking-wider uppercase text-indigo-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Local History</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-light-text dark:text-white">
            Recently{' '}
            <span className="editorial-pill text-xl sm:text-3xl font-medium mx-1 py-0.5 px-3">
              Launched
            </span>
          </h1>
          <p className="text-sm text-light-muted dark:text-neutral-400 max-w-xl">
            A chronological timeline of utilities you launched on this machine. Never sent to remote servers.
          </p>
        </div>

        {recentToolItems.length > 0 && (
          <button
            onClick={clearRecent}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:bg-rose-500/10 transition-colors shrink-0 self-start sm:self-center"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      {recentToolItems.length > 0 ? (
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            {recentToolItems.length} {recentToolItems.length === 1 ? 'recently used utility' : 'recently used utilities'}
          </span>
          <ToolGrid tools={recentToolItems} />
        </div>
      ) : (
        <EmptyState
          icon={<Clock className="w-6 h-6 text-indigo-500" />}
          title="No recent history"
          description="Whenever you open a tool workspace, it will show up here for fast access."
          actionText="Browse Tools"
          onAction={() => (window.location.href = '/tools')}
        />
      )}
    </div>
  );
};
