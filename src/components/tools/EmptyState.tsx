import React from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-light-border dark:border-dark-border bg-light-card/40 dark:bg-dark-card/30">
      <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple dark:text-brand-accentLight mx-auto flex items-center justify-center mb-4">
        {icon || <SearchX className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-semibold text-light-text dark:text-dark-text mb-1">
        {title}
      </h3>
      <p className="text-xs text-light-muted dark:text-dark-muted max-w-sm mx-auto mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
