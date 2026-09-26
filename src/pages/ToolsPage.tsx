import React, { useState } from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { TOOLS } from '../data/tools';
import { ToolCategory } from '../types';
import { filterTools } from '../utils/search';
import { CategoryPills } from '../components/tools/CategoryPills';
import { ToolGrid } from '../components/tools/ToolGrid';
import { EmptyState } from '../components/tools/EmptyState';

export const ToolsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'alphabetical' | 'popular'>('default');

  const filteredTools = filterTools(TOOLS, {
    query: searchQuery,
    category: selectedCategory,
    sortBy,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold tracking-wider uppercase text-neutral-400">
          <span>Complete Utility Index</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-light-text dark:text-white">
          Explore All{' '}
          <span className="editorial-pill text-xl sm:text-3xl font-medium mx-1 py-0.5 px-3">
            40 Utilities
          </span>
        </h1>
        <p className="text-sm text-light-muted dark:text-neutral-400 max-w-2xl">
          Search by task, filter by category suite, or sort alphabetically. All utilities operate client-side.
        </p>
      </div>

      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all 40 tools by name or task..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 text-sm text-light-text dark:text-white placeholder:text-light-muted dark:placeholder:text-neutral-400 focus:border-purple-500/80 focus:outline-none shadow-sm"
          />
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-neutral-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'default' | 'alphabetical' | 'popular')}
            className="px-4 py-3 rounded-full bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 text-xs font-medium text-light-text dark:text-white focus:border-purple-500/80 focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="default" className="dark:bg-[#141419]">Default Order</option>
            <option value="alphabetical" className="dark:bg-[#141419]">Alphabetical (A - Z)</option>
            <option value="popular" className="dark:bg-[#141419]">Popular First</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <CategoryPills
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">
          Showing {filteredTools.length} {filteredTools.length === 1 ? 'utility' : 'utilities'}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs text-brand-purple hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Tools Grid or Empty State */}
      {filteredTools.length > 0 ? (
        <ToolGrid tools={filteredTools} />
      ) : (
        <EmptyState
          title="No utilities found"
          description={`No tools match your query "${searchQuery}" in the selected category.`}
          actionText="Reset All Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
          }}
        />
      )}
    </div>
  );
};
