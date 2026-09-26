import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-3xl bg-brand-purple/10 text-brand-purple dark:text-brand-accentLight mx-auto flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-light-text dark:text-dark-text tracking-tight">
          404 — Page Not Found
        </h1>
        <p className="text-sm text-light-muted dark:text-dark-muted">
          We couldn&apos;t locate the utility or page you were looking for. It may have been moved or renamed.
        </p>
      </div>

      <div className="pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Homepage
        </Link>
      </div>
    </div>
  );
};
