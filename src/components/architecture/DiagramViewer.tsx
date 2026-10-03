import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  Check,
  Code,
  Eye,
  Scan,
  Move,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DiagramViewerProps {
  id: string;
  title: string;
  description?: string;
  mermaidSource: string;
  children: (theme: 'dark' | 'light') => React.ReactNode;
}

export const DiagramViewer: React.FC<DiagramViewerProps> = ({
  id,
  title,
  description,
  mermaidSource,
  children,
}) => {
  const { theme, addToast } = useApp();
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'diagram' | 'code'>('diagram');
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  // Zoom handlers
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.4));
  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFit = useCallback(() => {
    if (!containerRef.current || !svgWrapperRef.current) return;
    const container = containerRef.current.getBoundingClientRect();
    const svgEl = svgWrapperRef.current.querySelector('svg');
    if (!svgEl) {
      handleReset();
      return;
    }
    const svgRect = svgEl.getBoundingClientRect();
    const scaleX = (container.width - 48) / (svgRect.width / scale);
    const scaleY = (container.height - 48) / (svgRect.height / scale);
    const newScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1.6);
    setScale(newScale);
    setPan({ x: 0, y: 0 });
  }, [scale]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(handleReset, 50);
  };

  // Keyboard navigation inside viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen && e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === 'code') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || viewMode === 'code') return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (viewMode === 'code') return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.4), 3));
  };

  // Download SVG
  const handleDownloadSvg = () => {
    if (!svgWrapperRef.current) return;
    const svgElement = svgWrapperRef.current.querySelector('svg');
    if (!svgElement) {
      addToast({ type: 'warning', message: 'No SVG element available to export.' });
      return;
    }

    const svgXml = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${id}-${theme}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      message: `Downloaded ${id}-${theme}.svg successfully.`,
    });
  };

  // Copy Mermaid source code
  const handleCopySource = () => {
    navigator.clipboard.writeText(mermaidSource);
    setCopied(true);
    addToast({
      type: 'success',
      message: 'Mermaid diagram source copied to clipboard!',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#141419] overflow-hidden shadow-lg transition-all ${
        isFullscreen
          ? 'fixed inset-0 z-50 rounded-none border-none p-4 flex flex-col bg-slate-50 dark:bg-[#0c0c10]'
          : 'relative my-6'
      }`}
    >
      {/* Header bar with title, description, and controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-neutral-400">
              Interactive Diagram
            </span>
          </div>
          {description && (
            <p className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View Mode Toggle: Diagram vs Mermaid Code */}
          <div className="flex items-center rounded-lg bg-slate-200/80 dark:bg-white/10 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('diagram')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'diagram'
                  ? 'bg-white dark:bg-[#1c1c26] text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View Visual Interactive Diagram"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Diagram</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors ${
                viewMode === 'code'
                  ? 'bg-white dark:bg-[#1c1c26] text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="View Mermaid Source Code"
            >
              <Code className="w-3.5 h-3.5" />
              <span>Mermaid</span>
            </button>
          </div>

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/15 mx-0.5 hidden sm:block" />

          {/* Zoom & Pan tools (only in diagram mode) */}
          {viewMode === 'diagram' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white transition-colors"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white transition-colors"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleFit}
                className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white transition-colors"
                title="Fit to View"
                aria-label="Fit to View"
              >
                <Scan className="w-4 h-4" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white transition-colors"
                title="Reset Zoom (100%)"
                aria-label="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-neutral-400 px-1 min-w-[42px] text-center">
                {Math.round(scale * 100)}%
              </span>
            </div>
          )}

          <div className="h-4 w-[1px] bg-slate-300 dark:bg-white/15 mx-0.5 hidden sm:block" />

          {/* Action exports */}
          <button
            onClick={handleDownloadSvg}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white text-xs font-semibold transition-colors"
            title="Download SVG Diagram"
            aria-label="Download SVG Diagram"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export SVG</span>
          </button>

          <button
            onClick={handleCopySource}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-neutral-300 hover:text-purple-700 dark:hover:text-white text-xs font-semibold transition-colors"
            title="Copy Mermaid Code"
            aria-label="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy MMD'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg text-slate-600 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-white transition-colors"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Expand Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`relative w-full overflow-hidden select-none transition-colors ${
          isFullscreen ? 'flex-1 min-h-[500px]' : 'h-[520px]'
        } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} bg-slate-50/50 dark:bg-[#0e0e14]`}
      >
        {/* Helper drag indicator in bottom-left */}
        {viewMode === 'diagram' && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-neutral-400 pointer-events-none shadow-xs">
            <Move className="w-3 h-3" />
            <span>Click & Drag to Pan • Scroll to Zoom</span>
          </div>
        )}

        {viewMode === 'diagram' ? (
          <div
            ref={svgWrapperRef}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="w-full h-full flex items-center justify-center p-6 pointer-events-auto"
          >
            {children(theme)}
          </div>
        ) : (
          <div className="w-full h-full p-6 overflow-auto font-mono text-xs text-slate-800 dark:text-neutral-200 bg-slate-100 dark:bg-[#101018]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-300 dark:border-white/10 mb-4">
              <span className="font-bold text-purple-700 dark:text-purple-400">Mermaid Definition (docs/diagrams/{id}.mmd)</span>
              <button
                onClick={handleCopySource}
                className="flex items-center gap-1 px-3 py-1 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Source'}</span>
              </button>
            </div>
            <pre className="whitespace-pre overflow-x-auto leading-relaxed">{mermaidSource}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
