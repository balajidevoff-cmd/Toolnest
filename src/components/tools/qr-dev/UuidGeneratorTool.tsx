import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, RefreshCw, Cpu } from 'lucide-react';
import { generateUuidV4 } from '../../../utils/uuid';
import { useApp } from '../../../context/AppContext';

export const UuidGeneratorTool: React.FC = () => {
  const { addToast } = useApp();
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      let id = generateUuidV4();
      if (!hyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      list.push(id);
    }
    setUuids(list);
  };

  useEffect(() => {
    generate();
  }, [count, uppercase, hyphens]);

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
    setCopied(true);
    addToast({
      type: 'success',
      message: `Copied ${uuids.length} UUID(s) to clipboard!`,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = () => {
    const blob = new Blob([uuids.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${uuids.length}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      message: 'Downloaded UUIDs text file.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1">
              Quantity ({count})
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))}
              className="w-36 accent-brand-purple cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-light-text dark:text-dark-text cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-brand-purple"
            />
            <span>UPPERCASE</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-medium text-light-text dark:text-dark-text cursor-pointer mt-3">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="rounded accent-brand-purple"
            />
            <span>Include Hyphens</span>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={generate}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
          <button
            onClick={copyAll}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple hover:bg-brand-accent text-white text-xs font-semibold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All</span>
          </button>
          <button
            onClick={downloadText}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.txt</span>
          </button>
        </div>
      </div>

      {/* UUID list */}
      <div className="rounded-xl border border-light-border dark:border-dark-border bg-black/[0.01] dark:bg-black/30 overflow-hidden font-mono text-xs divide-y divide-light-border/40 dark:divide-dark-border/40 max-h-96 overflow-y-auto">
        {uuids.map((id, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-light-muted select-none w-6 text-right">{idx + 1}.</span>
              <span className="text-light-text dark:text-dark-text select-all">{id}</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(id);
                addToast({ type: 'success', message: 'UUID copied!' });
              }}
              className="text-light-muted hover:text-brand-purple p-1"
              title="Copy single UUID"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
