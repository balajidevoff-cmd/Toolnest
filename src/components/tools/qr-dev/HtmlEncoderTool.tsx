import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const HtmlEncoderTool: React.FC = () => {
  const { addToast } = useApp();
  const [input, setInput] = useState('<div class="alert">Hello & Welcome to "TOVIX"!</div>');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState(false);

  // Pure string transformations to avoid innerHTML execution
  const encodeHtml = (str: string): string => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const decodeHtml = (str: string): string => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  };

  const processText = (text: string, currentMode: 'encode' | 'decode') => {
    if (!text) {
      setOutput('');
      return;
    }
    setOutput(currentMode === 'encode' ? encodeHtml(text) : decodeHtml(text));
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    processText(text, mode);
  };

  const toggleMode = () => {
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(nextMode);
    setInput(output || input);
    processText(output || input, nextMode);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'HTML entities copied!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    processText(input, mode);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('encode');
              processText(input, 'encode');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'encode'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Escape / Encode Entities
          </button>
          <button
            onClick={() => {
              setMode('decode');
              processText(input, 'decode');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              mode === 'decode'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-light-muted hover:text-light-text'
            }`}
          >
            Unescape / Decode Entities
          </button>
        </div>

        <button
          onClick={toggleMode}
          className="flex items-center gap-1 text-xs font-semibold text-brand-purple hover:underline"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Swap</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            {mode === 'encode' ? 'Raw Text or HTML' : 'HTML Entities Input'}
          </label>
          <textarea
            rows={8}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type or paste content..."
            className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              {mode === 'encode' ? 'Escaped HTML Entities' : 'Decoded Text'}
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
            placeholder="Processed output..."
            className="w-full p-3.5 rounded-xl font-mono text-xs sm:text-sm bg-black/[0.04] dark:bg-black/40 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:outline-none resize-none select-all"
          />
        </div>
      </div>
    </div>
  );
};
