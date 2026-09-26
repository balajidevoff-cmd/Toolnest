import { ToolCategory, ToolMetadata } from '../types';

export interface FilterOptions {
  query?: string;
  category?: ToolCategory | 'all';
  sortBy?: 'alphabetical' | 'popular' | 'default';
}

export function filterTools(tools: ToolMetadata[], options: FilterOptions): ToolMetadata[] {
  const { query = '', category = 'all', sortBy = 'default' } = options;
  const cleanQuery = query.trim().toLowerCase();

  let filtered = tools.filter((tool) => {
    // Category match
    if (category !== 'all' && tool.category !== category) {
      return false;
    }

    // Query match
    if (cleanQuery) {
      const nameMatch = tool.name.toLowerCase().includes(cleanQuery);
      const descMatch = tool.description.toLowerCase().includes(cleanQuery);
      const catMatch = tool.category.toLowerCase().includes(cleanQuery);
      const keywordMatch = tool.keywords.some((k) => k.toLowerCase().includes(cleanQuery));

      if (!nameMatch && !descMatch && !catMatch && !keywordMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  if (sortBy === 'alphabetical') {
    filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'popular') {
    filtered = [...filtered].sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
  }

  return filtered;
}
