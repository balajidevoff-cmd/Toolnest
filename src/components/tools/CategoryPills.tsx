import React from 'react';
import { ToolCategory } from '../../types';
import { CATEGORIES } from '../../data/tools';

interface CategoryPillsProps {
  selectedCategory: ToolCategory | 'all';
  onSelectCategory: (category: ToolCategory | 'all') => void;
  counts?: Record<string, number>;
  align?: 'left' | 'center';
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
  align = 'center',
}) => {
  return (
    <div
      className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1 ${
        align === 'center' ? 'sm:justify-center flex-wrap' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
          selectedCategory === 'all'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md border border-slate-900 dark:border-white'
            : 'bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white shadow-xs'
        }`}
      >
        All {counts?.all !== undefined ? `(${counts.all})` : ''}
      </button>

      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        const count = counts?.[category.id];

        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md border border-slate-900 dark:border-white'
                : 'bg-white dark:bg-[#141419] border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white shadow-xs'
            }`}
          >
            {category.name} {count !== undefined ? `(${count})` : ''}
          </button>
        );
      })}
    </div>
  );
};

