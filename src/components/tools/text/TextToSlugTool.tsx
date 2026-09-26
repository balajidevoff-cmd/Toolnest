import React, { useState } from 'react';
import { generateSlug } from '../../../utils/textTransform';
import { Copy, Check, AtSign } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const TextToSlugTool: React.FC = () => {
  const { addToast } = useApp();
  const [inputTitle, setInputTitle] = useState('How to Build a Modern React Application in 2025!');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [copied, setCopied] = useState(false);

  const slug = generateSlug(inputTitle, separator);

  const copySlug = () => {
    if (!slug) return;
    navigator.clipboard.writeText(slug);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Slug copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
            Article Title or Headline
          </label>
          <input
            type="text"
            value={inputTitle}
            onChange={(e) => setInputTitle(e.target.value)}
            placeholder="Enter title here..."
            className="w-full px-4 py-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-base text-light-text dark:text-dark-text focus:outline-none"
          />
        </div>

        {/* Separator selector */}
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-light-muted">Separator:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-light-text dark:text-dark-text">
            <input
              type="radio"
              name="separator"
              checked={separator === '-'}
              onChange={() => setSeparator('-')}
              className="accent-brand-purple"
            />
            <span>Hyphen ( - ) [Recommended for SEO]</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-light-text dark:text-dark-text">
            <input
              type="radio"
              name="separator"
              checked={separator === '_'}
              onChange={() => setSeparator('_')}
              className="accent-brand-purple"
            />
            <span>Underscore ( _ )</span>
          </label>
        </div>
      </div>

      {/* Output Slug Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
            Generated URL Slug
          </span>
          <button
            onClick={copySlug}
            disabled={!slug}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-40"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Slug'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-sm text-light-text dark:text-dark-text break-all select-all">
          {slug || 'Enter title to generate slug'}
        </div>

        <p className="text-[11px] text-light-muted dark:text-dark-muted font-mono">
          https://example.com/posts/{slug || 'your-slug'}
        </p>
      </div>
    </div>
  );
};
