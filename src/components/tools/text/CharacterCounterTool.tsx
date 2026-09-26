import React, { useState } from 'react';
import { Copy, Trash2, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const CharacterCounterTool: React.FC = () => {
  const { addToast } = useApp();
  const [text, setText] = useState('Crafting concise thoughts for your next post.');
  const [maxLimit, setMaxLimit] = useState<number>(280);
  const [selectedPreset, setSelectedPreset] = useState<string>('twitter');
  const [copied, setCopied] = useState(false);

  const presets = [
    { id: 'twitter', label: 'X / Twitter', limit: 280 },
    { id: 'sms', label: 'SMS Message', limit: 160 },
    { id: 'instagram', label: 'Instagram Caption', limit: 2200 },
    { id: 'linkedin', label: 'LinkedIn Post', limit: 3000 },
    { id: 'meta-title', label: 'SEO Title Tag', limit: 60 },
    { id: 'meta-desc', label: 'SEO Meta Description', limit: 160 },
  ];

  const handlePresetSelect = (id: string, limit: number) => {
    setSelectedPreset(id);
    setMaxLimit(limit);
  };

  const count = text.length;
  const remaining = maxLimit - count;
  const isOver = remaining < 0;
  const percentUsed = Math.min(100, Math.round((count / maxLimit) * 100));

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Text copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Preset pills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
          Platform Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePresetSelect(p.id, p.limit)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedPreset === p.id
                  ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                  : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
              }`}
            >
              {p.label} ({p.limit})
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-light-muted">Custom Limit:</span>
            <input
              type="number"
              min="1"
              value={maxLimit}
              onChange={(e) => {
                setMaxLimit(parseInt(e.target.value, 10) || 1);
                setSelectedPreset('custom');
              }}
              className="w-20 px-2 py-1 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-center font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Counter Banner */}
      <div
        className={`p-6 rounded-2xl border text-center space-y-3 transition-colors ${
          isOver
            ? 'bg-rose-500/10 border-rose-500/30'
            : remaining <= 20
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-gradient-to-tr from-brand-purple/15 to-indigo-600/10 border-brand-purple/30'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wider ${
            isOver ? 'text-rose-500' : 'text-brand-purple dark:text-brand-accentLight'
          }`}
        >
          {isOver ? 'Character Limit Exceeded' : 'Remaining Characters'}
        </span>
        <div
          className={`text-4xl sm:text-5xl font-black tracking-tight ${
            isOver ? 'text-rose-500' : 'text-light-text dark:text-dark-text'
          }`}
        >
          {remaining}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden max-w-md mx-auto">
          <div
            style={{ width: `${percentUsed}%` }}
            className={`h-full transition-all duration-300 ${
              isOver ? 'bg-rose-500' : remaining <= 20 ? 'bg-amber-500' : 'bg-brand-purple'
            }`}
          />
        </div>
        <p className="text-xs text-light-muted dark:text-dark-muted font-medium">
          {count} of {maxLimit} characters used ({percentUsed}%)
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Input Content
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={copyText}
              className="text-xs text-brand-purple hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setText('')}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing..."
          className={`w-full p-4 rounded-xl text-sm bg-black/[0.02] dark:bg-black/20 border text-light-text dark:text-dark-text focus:outline-none resize-none leading-relaxed ${
            isOver ? 'border-rose-500/50' : 'border-light-border dark:border-dark-border focus:border-brand-purple'
          }`}
        />
      </div>
    </div>
  );
};
