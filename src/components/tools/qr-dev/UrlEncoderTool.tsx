import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const UrlEncoderTool: React.FC = () => {
  const { addToast } = useApp();
  const [input, setInput] = useState('https://tovix.dev/search?q=pdf merger & tools=all');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const processUrl = (text: string, currentMode: 'encode' | 'decode') => {
    setError(null);
    if (!text) {
      setOutput('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        setOutput(encodeURIComponent(text));
      } else {
        setOutput(decodeURIComponent(text));
      }
    } catch {
      setError('Malformed percent-encoded URI string. Please verify that characters follow valid hexadecimal formatting (e.g. %20).');
      setOutput('');
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    processUrl(text, mode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInput(output || input);
    processUrl(output || input, nextMode);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Result copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  // Run on mount
  React.useEffect(() => {
    processUrl(input, mode);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('encode');
              processUrl(input, 'encode');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'encode'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Encode URI Component
          </button>
          <button
            onClick={() => {
              setMode('decode');
              processUrl(input, 'decode');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'decode'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Decode URI Component
          </button>
        </div>

        <button
          onClick={toggleMode}
          className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Swap Inputs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            {mode === 'encode' ? 'Decoded Input Text' : 'Encoded URI Input'}
          </label>
          <textarea
            rows={8}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter text to convert..."
            className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
          />
        </div>

        {/* Output area */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
            </label>
            <button
              onClick={copyToClipboard}
              disabled={!output}
              className="flex items-center gap-1 text-xs text-brand-purple hover:underline disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <textarea
            rows={8}
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.04] dark:bg-black/40 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none resize-none select-all"
          />
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
