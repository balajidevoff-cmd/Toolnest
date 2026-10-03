import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, CheckCircle2, Minimize2, Braces } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const JsonFormatterTool: React.FC = () => {
  const { addToast } = useApp();
  const [inputJson, setInputJson] = useState('{\n  "app": "TOVIX",\n  "status": "production-ready",\n  "features": ["local-first", "fast", "private"]\n}');
  const [indentSpaces, setIndentSpaces] = useState<2 | 4>(2);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleFormat = (spaces: number) => {
    try {
      if (!inputJson.trim()) {
        setError('Please enter some JSON to format.');
        return;
      }
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed, null, spaces));
      setError(null);
      addToast({
        type: 'success',
        message: `JSON formatted with ${spaces} spaces!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      setError(msg);
      addToast({
        type: 'error',
        title: 'JSON Error',
        message: msg,
      });
    }
  };

  const handleMinify = () => {
    try {
      if (!inputJson.trim()) return;
      const parsed = JSON.parse(inputJson);
      setInputJson(JSON.stringify(parsed));
      setError(null);
      addToast({
        type: 'success',
        message: 'JSON minified successfully!',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid JSON syntax';
      setError(msg);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inputJson);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'JSON copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    const blob = new Blob([inputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'data.json';
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      message: 'Downloaded data.json',
    });
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-accent text-white font-semibold text-xs transition-colors"
          >
            Prettify (2 Spaces)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-light-text dark:text-dark-text transition-colors"
          >
            Prettify (4 Spaces)
          </button>
          <button
            onClick={handleMinify}
            className="px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Minify</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={downloadJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Invalid JSON</p>
            <p className="font-mono mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Editor area */}
      <div className="relative">
        <textarea
          rows={16}
          value={inputJson}
          onChange={(e) => {
            setInputJson(e.target.value);
            setError(null);
          }}
          placeholder="Paste or write JSON here..."
          className="w-full p-4 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.03] dark:bg-black/30 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
