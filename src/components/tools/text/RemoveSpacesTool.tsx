import React, { useState } from 'react';
import { cleanWhitespace } from '../../../utils/textTransform';
import { Copy, Trash2, Check, Sparkles } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const RemoveSpacesTool: React.FC = () => {
  const { addToast } = useApp();
  const [text, setText] = useState('  This   is    an   example    with   extra   spaces\n\n\nand   redundant   blank   lines.  ');
  const [removeExtraSpaces, setRemoveExtraSpaces] = useState(true);
  const [removeEmptyLines, setRemoveEmptyLines] = useState(true);
  const [trimLines, setTrimLines] = useState(true);
  const [copied, setCopied] = useState(false);

  const cleaned = cleanWhitespace(text, {
    removeExtraSpaces,
    removeEmptyLines,
    trimLines,
  });

  const applyClean = () => {
    setText(cleaned);
    addToast({
      type: 'success',
      message: 'Cleaned text applied to editor!',
    });
  };

  const copyCleaned = () => {
    navigator.clipboard.writeText(cleaned);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Cleaned text copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Options checklist */}
      <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs">
        <label className="flex items-center gap-2 cursor-pointer font-medium text-light-text dark:text-dark-text">
          <input
            type="checkbox"
            checked={removeExtraSpaces}
            onChange={(e) => setRemoveExtraSpaces(e.target.checked)}
            className="rounded accent-brand-purple"
          />
          <span>Collapse Multiple Spaces to Single Space</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-light-text dark:text-dark-text">
          <input
            type="checkbox"
            checked={removeEmptyLines}
            onChange={(e) => setRemoveEmptyLines(e.target.checked)}
            className="rounded accent-brand-purple"
          />
          <span>Remove Empty Blank Lines</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer font-medium text-light-text dark:text-dark-text">
          <input
            type="checkbox"
            checked={trimLines}
            onChange={(e) => setTrimLines(e.target.checked)}
            className="rounded accent-brand-purple"
          />
          <span>Trim Leading & Trailing Line Spaces</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Raw Input
            </label>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text with messy spaces..."
            className="w-full p-3.5 rounded-xl font-mono text-xs bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              Cleaned Preview
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={applyClean}
                className="text-xs text-brand-purple hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Replace Input</span>
              </button>
              <button
                onClick={copyCleaned}
                disabled={!cleaned}
                className="text-xs text-brand-purple hover:underline flex items-center gap-1 disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <textarea
            rows={10}
            readOnly
            value={cleaned}
            placeholder="Cleaned output..."
            className="w-full p-3.5 rounded-xl font-mono text-xs bg-black/[0.04] dark:bg-black/40 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </div>
  );
};
