import React, { useState } from 'react';
import {
  toTitleCase,
  toSentenceCase,
  toAlternatingCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
} from '../../../utils/textTransform';
import { Copy, Check, Trash2 } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const CaseConverterTool: React.FC = () => {
  const { addToast } = useApp();
  const [text, setText] = useState('Transform any text into multiple casing conventions easily.');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const applyCase = (converted: string) => {
    setText(converted);
    addToast({
      type: 'success',
      message: 'Casing converted!',
    });
  };

  const copyToClipboard = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    addToast({
      type: 'success',
      message: 'Copied to clipboard!',
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const conversions = [
    { id: 'upper', label: 'UPPERCASE', transform: () => text.toUpperCase() },
    { id: 'lower', label: 'lowercase', transform: () => text.toLowerCase() },
    { id: 'title', label: 'Title Case', transform: () => toTitleCase(text) },
    { id: 'sentence', label: 'Sentence case', transform: () => toSentenceCase(text) },
    { id: 'camel', label: 'camelCase', transform: () => toCamelCase(text) },
    { id: 'kebab', label: 'kebab-case', transform: () => toKebabCase(text) },
    { id: 'snake', label: 'snake_case', transform: () => toSnakeCase(text) },
    { id: 'alt', label: 'aLtErNaTiNg cAsE', transform: () => toAlternatingCase(text) },
  ];

  return (
    <div className="space-y-6">
      {/* Editor */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Text to Convert
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
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or write text here..."
          className="w-full p-3.5 rounded-xl text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
        />
      </div>

      {/* Conversion Actions Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Click button to apply directly, or copy individual results:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {conversions.map((conv) => {
            const preview = conv.transform();
            return (
              <div
                key={conv.id}
                className="p-3.5 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex flex-col justify-between gap-3 hover:border-brand-purple/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-light-text dark:text-dark-text">
                      {conv.label}
                    </span>
                    <button
                      onClick={() => copyToClipboard(preview, conv.id)}
                      className="text-light-muted hover:text-brand-purple p-1"
                      title="Copy this case"
                    >
                      {copiedKey === conv.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-light-muted dark:text-dark-muted truncate mt-1">
                    {preview || 'Empty'}
                  </p>
                </div>

                <button
                  onClick={() => applyCase(preview)}
                  className="w-full py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.05] hover:bg-brand-purple hover:text-white text-xs font-semibold text-light-text dark:text-dark-text transition-colors"
                >
                  Apply to Editor
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
