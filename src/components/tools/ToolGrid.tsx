import React from 'react';
import { ToolMetadata } from '../../types';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: ToolMetadata[];
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};
