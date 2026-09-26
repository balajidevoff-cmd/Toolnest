import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight } from 'lucide-react';
import { ToolMetadata } from '../../types';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';

interface ToolCardProps {
  tool: ToolMetadata;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(tool.id);

  return (
    <div className="group relative flex flex-col justify-between p-5 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/[0.08] hover:border-purple-500/40 dark:hover:border-purple-500/50 shadow-sm hover:shadow-xl hover:shadow-purple-900/10 dark:hover:bg-[#181820] transition-all duration-300 hover:-translate-y-1">
      <div>
        {/* Top bar: Icon and Favorite toggle */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(tool.id);
            }}
            className={`p-2 rounded-full transition-colors ${
              favorite
                ? 'text-rose-500 bg-rose-500/15'
                : 'text-neutral-400 hover:text-rose-400 hover:bg-white/5'
            }`}
            aria-label={favorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
          >
            <Heart className={`w-4 h-4 ${favorite ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Category pill tag */}
        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.03] dark:bg-white/[0.06] border border-light-border dark:border-white/[0.08] text-neutral-400 group-hover:text-purple-300 mb-2">
          {tool.category.replace('-', ' ')}
        </span>

        {/* Title */}
        <h3 className="text-base font-bold text-light-text dark:text-white group-hover:text-purple-400 transition-colors">
          <Link to={tool.route} className="focus:outline-none focus:underline">
            {tool.name}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-light-muted dark:text-neutral-400 mt-2 leading-relaxed line-clamp-2">
          {tool.description}
        </p>
      </div>

      {/* Bottom Action Button */}
      <div className="mt-5 pt-3.5 border-t border-light-border dark:border-white/[0.06] flex items-center justify-between">
        <span className="text-[11px] text-light-muted dark:text-neutral-400 font-medium">
          {tool.isPopular ? '⭐ Popular' : 'Local Sandbox'}
        </span>
        <Link
          to={tool.route}
          className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform"
        >
          Launch
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
