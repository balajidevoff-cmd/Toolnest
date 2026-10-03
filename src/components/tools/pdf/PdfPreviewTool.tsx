import React, { useState, useRef, useEffect } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RefreshCw, FileText, Loader2, AlertCircle } from 'lucide-react';
import { pdfjsLib } from '../../../utils/pdfWorkerSetup';

export const PdfPreviewTool: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<ReturnType<pdfjsLib.PDFPageProxy['render']> | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    setError(null);
    setLoading(true);

    const selected = files[0];
    setFile(selected);

    try {
      const buffer = await selected.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const loadedDoc = await loadingTask.promise;
      setPdfDoc(loadedDoc);
      setNumPages(loadedDoc.numPages);
      setCurrentPage(1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not render PDF file.';
      setError(`Failed to read PDF: ${msg}`);
      setPdfDoc(null);
    } finally {
      setLoading(false);
    }
  };

  // Render current page onto canvas
  useEffect(() => {
    let isCancelled = false;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvas: canvas,
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err: unknown) {
        // Ignore render cancellation exceptions
        if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'RenderingCancelledException') {
          return;
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale]);

  const changePage = (delta: number) => {
    setCurrentPage((prev) => Math.min(Math.max(1, prev + delta), numPages));
  };

  const resetAll = () => {
    setFile(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setNumPages(0);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept=".pdf,application/pdf"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload a PDF to view and inspect pages"
          subtitle="Rendered locally with PDF.js client-side engine"
        />
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span className="text-xs font-semibold text-light-text dark:text-dark-text truncate max-w-xs">
                {file.name}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => changePage(-1)}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-light-text dark:text-dark-text">
                Page {currentPage} of {numPages}
              </span>
              <button
                disabled={currentPage >= numPages}
                onClick={() => changePage(1)}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border disabled:opacity-30 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale((prev) => Math.max(0.5, prev - 0.2))}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono text-light-muted dark:text-dark-muted">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((prev) => Math.min(3.0, prev + 0.2))}
                className="p-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={resetAll}
                className="ml-2 flex items-center gap-1 text-xs text-light-muted dark:text-dark-muted hover:text-light-text"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change file
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-light-muted">
              <Loader2 className="w-8 h-8 animate-spin text-brand-purple" />
              <p className="text-xs font-medium">Loading PDF document...</p>
            </div>
          )}

          {/* Render canvas container */}
          <div className="overflow-auto max-h-[750px] p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-light-border dark:border-dark-border flex items-center justify-center">
            <canvas ref={canvasRef} className="shadow-2xl rounded-lg bg-white" />
          </div>
        </div>
      )}
    </div>
  );
};
