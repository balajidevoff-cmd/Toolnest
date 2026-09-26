import React, { useState } from 'react';
import { Search, Replace, Copy, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const TextReplaceTool: React.FC = () => {
  const { addToast } = useApp();
  const [content, setContent] = useState(
    'The quick brown fox jumps over the lazy dog. The fox was fast and the dog was sleepy.'
  );
  const [findTerm, setFindTerm] = useState('fox');
  const [replaceTerm, setReplaceTerm] = useState('wolf');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [copied, setCopied] = useState(false);

  // Compute match count
  const countOccurrences = (): number => {
    if (!findTerm || !content) return 0;
    try {
      let pattern = findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(pattern, flags);
      const matches = content.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  };

  const handleReplaceAll = () => {
    if (!findTerm) return;
    try {
      let pattern = findTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (wholeWord) pattern = `\\b${pattern}\\b`;
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(pattern, flags);
      const occurrences = (content.match(regex) || []).length;

      const newContent = content.replace(regex, replaceTerm);
      setContent(newContent);

      addToast({
        type: 'success',
        message: `Replaced ${occurrences} occurrence(s)!`,
      });
    } catch {
      addToast({
        type: 'error',
        message: 'Could not perform replacement.',
      });
    }
  };

  const matchCount = countOccurrences();

  const copyResult = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Text copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search and Replace inputs */}
      <div className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Find Term
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-muted" />
              <input
                type="text"
                value={findTerm}
                onChange={(e) => setFindTerm(e.target.value)}
                placeholder="Word or phrase to find..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Replace With
            </label>
            <div className="relative">
              <Replace className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-purple" />
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                placeholder="Replacement text..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Options and Action button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-light-border dark:border-dark-border text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-light-text dark:text-dark-text font-medium">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded accent-brand-purple"
              />
              <span>Match Case</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-light-text dark:text-dark-text font-medium">
              <input
                type="checkbox"
                checked={wholeWord}
                onChange={(e) => setWholeWord(e.target.checked)}
                className="rounded accent-brand-purple"
              />
              <span>Whole Word Only</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-light-muted">
              Found: <strong className="text-brand-purple">{matchCount}</strong> match(es)
            </span>
            <button
              onClick={handleReplaceAll}
              disabled={matchCount === 0}
              className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm disabled:opacity-40 transition-colors"
            >
              Replace All ({matchCount})
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Document Content
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={copyResult}
              className="text-xs text-brand-purple hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => setContent('')}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type or paste your text here..."
          className="w-full p-4 rounded-xl text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
};
