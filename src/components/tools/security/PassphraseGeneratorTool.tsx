import React, { useState, useEffect } from 'react';
import { generatePassphrase } from '../../../utils/passwords';
import { Copy, Check, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const PassphraseGeneratorTool: React.FC = () => {
  const { addToast } = useApp();
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [includeNumber, setIncludeNumber] = useState(true);
  const [passphrase, setPassphrase] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const phrase = generatePassphrase(wordCount, separator, capitalize, includeNumber);
    setPassphrase(phrase);
  };

  useEffect(() => {
    generate();
  }, [wordCount, separator, capitalize, includeNumber]);

  const copyPassphrase = () => {
    if (!passphrase) return;
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Passphrase copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Generated Passphrase Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border border-brand-purple/30 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Memorable Diceware-Style Passphrase</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={generate}
              className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-light-muted hover:text-light-text"
              title="Generate new passphrase"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={copyPassphrase}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-base sm:text-lg font-bold text-light-text dark:text-dark-text break-all select-all tracking-wide text-center">
          {passphrase}
        </div>
      </div>

      {/* Options */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-light-muted dark:text-dark-muted uppercase">Word Count</span>
            <span className="font-mono text-base text-brand-purple font-bold">{wordCount} Words</span>
          </div>
          <input
            type="range"
            min="3"
            max="8"
            value={wordCount}
            onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
            className="w-full accent-brand-purple cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-light-border dark:border-dark-border">
          <div>
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
              Word Separator
            </label>
            <select
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-light-text dark:text-dark-text focus:outline-none"
            >
              <option value="-">Hyphen (-)</option>
              <option value=".">Period (.)</option>
              <option value="_">Underscore (_)</option>
              <option value=" ">Space ( )</option>
            </select>
          </div>

          <div className="flex flex-col justify-end space-y-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-light-text dark:text-dark-text">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(e) => setCapitalize(e.target.checked)}
                className="rounded accent-brand-purple"
              />
              <span>Capitalize Each Word</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-medium text-light-text dark:text-dark-text">
              <input
                type="checkbox"
                checked={includeNumber}
                onChange={(e) => setIncludeNumber(e.target.checked)}
                className="rounded accent-brand-purple"
              />
              <span>Append Random Number Suffix</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
