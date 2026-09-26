import React, { useState } from 'react';
import { Copy, Trash2, Clock, BookOpen } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const WordCounterTool: React.FC = () => {
  const { addToast } = useApp();
  const [text, setText] = useState(
    'ToolNest is a free, privacy-focused collection of everyday digital utilities. Designed for college students, developers, designers, and creators who need fast, local-first tools without intrusive ads.'
  );

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0) : 0;
  const paragraphs = text.trim() ? text.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;

  // Average reading speed: ~225 words per minute
  const readingTimeMinutes = Math.ceil(words / 225);
  // Average speaking speed: ~130 words per minute
  const speakingTimeMinutes = Math.ceil(words / 130);

  const copyText = () => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      message: 'Text copied to clipboard!',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-center">
          <span className="text-[11px] font-semibold uppercase text-brand-purple dark:text-brand-accentLight">Words</span>
          <p className="text-2xl font-black text-brand-purple dark:text-brand-accentLight mt-0.5">{words}</p>
        </div>

        <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-center">
          <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Characters</span>
          <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-0.5">{characters}</p>
        </div>

        <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-center">
          <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">No Spaces</span>
          <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-0.5">{charactersNoSpaces}</p>
        </div>

        <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-center">
          <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Sentences</span>
          <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-0.5">{sentences}</p>
        </div>

        <div className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">Paragraphs</span>
          <p className="text-2xl font-bold text-light-text dark:text-dark-text mt-0.5">{paragraphs}</p>
        </div>
      </div>

      {/* Reading time estimate */}
      <div className="flex flex-wrap items-center gap-6 px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-light-muted dark:text-dark-muted font-medium">
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-brand-purple" />
          <span>Reading time: ~{readingTimeMinutes} min</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>Speaking time: ~{speakingTimeMinutes} min</span>
        </span>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
            Enter or Paste Text
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={copyText}
              disabled={!text}
              className="text-xs text-brand-purple hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={() => setText('')}
              disabled={!text}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste your content here..."
          className="w-full p-4 rounded-xl text-sm bg-black/[0.02] dark:bg-black/20 border border-light-border dark:border-dark-border text-light-text dark:text-dark-text focus:border-brand-purple focus:outline-none resize-y leading-relaxed"
        />
      </div>
    </div>
  );
};
