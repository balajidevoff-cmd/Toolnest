import React from 'react';
import { ToolMetadata } from '../../types';
import { ToolCard } from './ToolCard';

interface ToolGridProps {
  tools: ToolMetadata[];
  className?: string;
}

export const ToolGrid: React.FC<ToolGridProps> = ({ tools, className }) => {
  return (
    <div
      className={
        className ||
        'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5'
      }
    >
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
};

