import React from 'react';
import { ToolCategory } from '../../types';
import { CATEGORIES } from '../../data/tools';

interface CategoryPillsProps {
  selectedCategory: ToolCategory | 'all';
  onSelectCategory: (category: ToolCategory | 'all') => void;
  counts?: Record<string, number>;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedCategory,
  onSelectCategory,
  counts,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
          selectedCategory === 'all'
            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/50'
            : 'bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 text-light-muted dark:text-neutral-400 hover:text-light-text dark:hover:text-white hover:border-purple-500/40'
        }`}
      >
        All Utilities {counts?.all !== undefined ? `(${counts.all})` : ''}
      </button>

      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        const count = counts?.[category.id];

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
              isSelected
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border border-purple-400/50'
                : 'bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 text-light-muted dark:text-neutral-400 hover:text-light-text dark:hover:text-white hover:border-purple-500/40'
            }`}
          >
            {category.name} {count !== undefined ? `(${count})` : ''}
          </button>
        );
      })}
    </div>
  );
};
