import React, { useState, useMemo } from 'react';
import { AlertCircle, CheckCircle2, Search } from 'lucide-react';

export const RegexTesterTool: React.FC = () => {
  const [pattern, setPattern] = useState('[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}');
  const [flags, setFlags] = useState('gi');
  const [testText, setTestText] = useState(
    'Contact our support at hello@tovix.dev or team@example.org for quick assistance.'
  );

  const { matches, error } = useMemo(() => {
    if (!pattern) return { matches: [], error: null };

    try {
      // Validate flags - only allow g, i, m, s, u, y
      const cleanFlags = flags.replace(/[^gimsuy]/g, '');
      const regex = new RegExp(pattern, cleanFlags.includes('g') ? cleanFlags : cleanFlags + 'g');

      const found: Array<{ index: number; text: string; groups?: string[] }> = [];
      let match: RegExpExecArray | null;

      // Limit match count to prevent browser freezing on infinite loops
      let iterations = 0;
      while ((match = regex.exec(testText)) !== null && iterations < 500) {
        iterations++;
        found.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1),
        });

        // If zero-length match, advance index to avoid infinite loop
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }

      return { matches: found, error: null };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid Regular Expression';
      return { matches: [], error: msg };
    }
  }, [pattern, flags, testText]);

  // Build highlighted output
  const highlightedContent = useMemo(() => {
    if (matches.length === 0 || error) return testText;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    matches.forEach((m, i) => {
      // Push text before match
      if (m.index > lastIdx) {
        elements.push(testText.substring(lastIdx, m.index));
      }
      // Push highlighted match
      elements.push(
        <mark
          key={i}
          className="bg-brand-purple/30 text-brand-purple dark:text-brand-accentLight rounded px-0.5 font-bold"
        >
          {m.text}
        </mark>
      );
      lastIdx = m.index + m.text.length;
    });

    if (lastIdx < testText.length) {
      elements.push(testText.substring(lastIdx));
    }

    return elements;
  }, [testText, matches, error]);

  return (
    <div className="space-y-6">
      {/* Pattern and flags input */}
      <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border space-y-3">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Regular Expression Pattern
        </label>
        <div className="flex items-center gap-2">
          <span className="font-mono text-base font-bold text-brand-purple">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. [a-z0-9]+"
            className="flex-1 px-3 py-2 rounded-xl font-mono text-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none"
          />
          <span className="font-mono text-base font-bold text-brand-purple">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-16 px-3 py-2 rounded-xl font-mono text-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none text-center"
          />
        </div>

        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Valid Expression • Found {matches.length} match(es)</span>
          </div>
        )}
      </div>

      {/* Test String Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Test String
        </label>
        <textarea
          rows={5}
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder="Enter sample text to test against..."
          className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
        />
      </div>

      {/* Matches Preview */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Highlighted Matches
        </label>
        <div className="p-4 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.03] dark:bg-black/40 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text leading-relaxed whitespace-pre-wrap break-all min-h-[80px]">
          {highlightedContent}
        </div>
      </div>

      {/* Match details table */}
      {matches.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-light-muted dark:text-dark-muted">
            Match Details ({matches.length})
          </h4>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-light-border dark:border-dark-border divide-y divide-light-border/40 dark:divide-dark-border/40 font-mono text-xs">
            {matches.map((m, idx) => (
              <div key={idx} className="p-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-brand-purple">#{idx + 1}:</span>{' '}
                  <span className="text-light-text dark:text-dark-text font-bold">&quot;{m.text}&quot;</span>
                </div>
                <span className="text-light-muted text-[11px]">at index {m.index}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
