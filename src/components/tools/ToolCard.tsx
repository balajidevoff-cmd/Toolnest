import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowUpRight, Sparkles } from 'lucide-react';
import { ToolMetadata } from '../../types';
import { useApp } from '../../context/AppContext';
import { DynamicIcon } from '../common/DynamicIcon';

interface ToolCardProps {
  tool: ToolMetadata;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useApp();
  const favorite = isFavorite(tool.id);

  // Dynamic styling for iconic badges directly inspired by the iLovePDF design in Image 2
  const getIconTheme = () => {
    // PDF to Word / Word to PDF
    if (tool.slug === 'pdf-to-word' || tool.slug === 'word-to-pdf') {
      return {
        bg: 'bg-[#2563EB] text-white shadow-blue-500/20',
        letter: 'W',
      };
    }
    // PDF to Excel / Excel to PDF
    if (tool.slug === 'pdf-to-excel' || tool.slug === 'excel-to-pdf') {
      return {
        bg: 'bg-[#059669] text-white shadow-emerald-500/20',
        letter: 'X',
      };
    }
    // PDF to PowerPoint / PowerPoint to PDF
    if (tool.slug === 'pdf-to-powerpoint' || tool.slug === 'powerpoint-to-pdf') {
      return {
        bg: 'bg-[#EA580C] text-white shadow-orange-500/20',
        letter: 'P',
      };
    }
    // PDF to Markdown
    if (tool.slug === 'pdf-to-markdown') {
      return {
        bg: 'bg-[#9333EA] text-white shadow-purple-500/20',
        letter: '#',
      };
    }
    // Merge PDF & Split PDF
    if (tool.slug === 'pdf-merger' || tool.slug === 'pdf-splitter') {
      return {
        bg: 'bg-[#E11D48] text-white shadow-rose-500/20',
        letter: null,
      };
    }
    // Compress PDF
    if (tool.slug === 'pdf-compressor') {
      return {
        bg: 'bg-[#10B981] text-white shadow-emerald-500/20',
        letter: null,
      };
    }
    // Images to PDF & PDF Preview
    if (tool.slug === 'images-to-pdf' || tool.slug === 'pdf-preview') {
      return {
        bg: 'bg-[#E11D48] text-white shadow-rose-500/20',
        letter: null,
      };
    }

    // Suite defaults
    switch (tool.category) {
      case 'pdf-documents':
        return {
          bg: 'bg-[#E11D48] text-white shadow-rose-500/20',
          letter: null,
        };
      case 'image-studio':
        return {
          bg: 'bg-[#0D9488] text-white shadow-teal-500/20',
          letter: null,
        };
      case 'qr-code':
        return {
          bg: 'bg-[#7C3AED] text-white shadow-purple-500/20',
          letter: null,
        };
      case 'calculators':
        return {
          bg: 'bg-[#D97706] text-white shadow-amber-500/20',
          letter: null,
        };
      case 'text-writing':
        return {
          bg: 'bg-[#059669] text-white shadow-emerald-500/20',
          letter: null,
        };
      case 'privacy-security':
        return {
          bg: 'bg-[#4F46E5] text-white shadow-indigo-500/20',
          letter: null,
        };
      default:
        return {
          bg: 'bg-purple-600 text-white shadow-purple-500/20',
          letter: null,
        };
    }
  };

  const iconTheme = getIconTheme();

  return (
    <Link
      to={tool.route}
      className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/[0.08] hover:border-purple-500/50 dark:hover:border-purple-500/50 shadow-xs hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 dark:hover:bg-[#181822] transition-all duration-200 hover:-translate-y-0.5 block text-left"
    >
      <div>
        {/* Top bar: Iconic Badge and Favorite toggle */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all duration-200 group-hover:scale-105 shadow-sm shrink-0 ${iconTheme.bg}`}
          >
            {iconTheme.letter ? (
              <span className="font-black text-sm tracking-tight">{iconTheme.letter}</span>
            ) : (
              <DynamicIcon name={tool.icon} className="w-4 h-4 text-white" />
            )}
          </div>

          <div className="flex items-center gap-1 relative z-10">
            {tool.badge === 'new' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-500/15 text-blue-600 dark:text-blue-400">
                New
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(tool.id);
              }}
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                favorite
                  ? 'text-rose-500 bg-rose-500/15'
                  : 'text-slate-400 dark:text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-white/5'
              }`}
              aria-label={favorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
            >
              <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
          {tool.name}
        </h3>

        {/* Minimal Explanation */}
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-snug">
          {tool.description}
        </p>
      </div>
    </Link>
  );
};


