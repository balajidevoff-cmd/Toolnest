import React, { useState } from 'react';
import { renderSafeMarkdown } from '../../../utils/markdown';
import { Eye, Code, Copy, Trash2, Download } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const MarkdownPreviewTool: React.FC = () => {
  const { addToast } = useApp();
  const [markdown, setMarkdown] = useState(
    `# Welcome to ToolNest
Every tool you need. **One nest.**

## Features
- **Client-Side:** Runs completely in your browser.
- *Privacy First:* No secret uploads or remote storage.
- \`Fast & Light:\` Modern React + Vite architecture.

> "Simplicity is the soul of efficiency." — Austin Freeman

Visit [ToolNest Website](https://toolsnest.dev) for all utilities.
`
  );

  const html = renderSafeMarkdown(markdown);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    addToast({
      type: 'success',
      message: 'Markdown copied to clipboard!',
    });
  };

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    addToast({
      type: 'success',
      message: 'Downloaded document.md',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        <span className="text-xs font-semibold text-light-text dark:text-dark-text flex items-center gap-1.5">
          <Code className="w-4 h-4 text-brand-purple" />
          <span>Live Markdown Editor & Safe Renderer</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={copyMarkdown}
            className="flex items-center gap-1 text-xs text-brand-purple hover:underline"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy MD</span>
          </button>
          <button
            onClick={downloadMarkdown}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.md</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Markdown Input
          </label>
          <textarea
            rows={14}
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            placeholder="Type Markdown here..."
            className="w-full p-4 rounded-xl font-mono text-xs bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-brand-purple" />
            <span>Sanitized HTML Preview</span>
          </label>
          <div
            dangerouslySetInnerHTML={{ __html: html }}
            className="w-full min-h-[290px] p-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border overflow-y-auto max-h-[350px]"
          />
        </div>
      </div>
    </div>
  );
};
