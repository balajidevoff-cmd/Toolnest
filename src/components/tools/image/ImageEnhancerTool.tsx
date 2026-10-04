import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Sparkles, Download, RefreshCw, Loader2, Sliders, CheckCircle2, ZoomIn, Eye } from 'lucide-react';

type UpscaleScale = 1 | 2 | 4;

interface EnhancementPreset {
  id: string;
  name: string;
  desc: string;
  scale: UpscaleScale;
  sharpness: number; // 0 - 100
  contrast: number; // -50 - 50
  vibrance: number; // -50 - 50
  brightness: number; // -50 - 50
}

const PRESETS: EnhancementPreset[] = [
  {
    id: 'clarity',
    name: 'Super Clarity & Sharpness',
    desc: 'Brings out hidden edges, textures, and fine details with 2x upscaling.',
    scale: 2,
    sharpness: 45,
    contrast: 12,
    vibrance: 15,
    brightness: 2,
  },
  {
    id: 'ultra-4k',
    name: 'Ultra 4x Super Resolution',
    desc: 'Upscales image 4x with bicubic sub-pixel smoothing and micro-contrast.',
    scale: 4,
    sharpness: 35,
    contrast: 10,
    vibrance: 10,
    brightness: 0,
  },
  {
    id: 'hdr',
    name: 'Vibrant HDR & Color Pop',
    desc: 'Enhances dynamic color range, rich shadows, and luminous highlights.',
    scale: 2,
    sharpness: 30,
    contrast: 22,
    vibrance: 35,
    brightness: 5,
  },
  {
    id: 'scan',
    name: 'Document & Text Sharpener',
    desc: 'Removes blur and boosts high-frequency contrast for legible reading.',
    scale: 2,
    sharpness: 65,
    contrast: 25,
    vibrance: 0,
    brightness: 8,
  },
];

export const ImageEnhancerTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [selectedPreset, setSelectedPreset] = useState<string>('clarity');
  const [scale, setScale] = useState<UpscaleScale>(2);
  const [sharpness, setSharpness] = useState<number>(45);
  const [contrast, setContrast] = useState<number>(12);
  const [vibrance, setVibrance] = useState<number>(15);
  const [brightness, setBrightness] = useState<number>(2);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancedDimensions, setEnhancedDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [enhancedSize, setEnhancedSize] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  // Interactive Split Slider (0 to 100%)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const comparisonContainerRef = useRef<HTMLDivElement | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setEnhancedUrl(null);

    const url = URL.createObjectURL(selected);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      imageObjRef.current = img;
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = url;
  };

  const applyPreset = (preset: EnhancementPreset) => {
    setSelectedPreset(preset.id);
    setScale(preset.scale);
    setSharpness(preset.sharpness);
    setContrast(preset.contrast);
    setVibrance(preset.vibrance);
    setBrightness(preset.brightness);
  };

  const processEnhancement = useCallback(async () => {
    const img = imageObjRef.current;
    if (!img) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 60));

    try {
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const targetW = origW * scale;
      const targetH = origH * scale;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw upscaled base image
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Extract image data for algorithmic sharpening and vibrance
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;

      // Unsharp Mask / Sharpen Convolution if sharpness > 0
      if (sharpness > 0) {
        const factor = (sharpness / 100) * 1.5;
        const copy = new Uint8ClampedArray(data);

        // Fast separable 3x3 unsharp mask
        for (let y = 1; y < targetH - 1; y++) {
          for (let x = 1; x < targetW - 1; x++) {
            const idx = (y * targetW + x) * 4;
            for (let c = 0; c < 3; c++) {
              const current = copy[idx + c];
              const up = copy[((y - 1) * targetW + x) * 4 + c];
              const down = copy[((y + 1) * targetW + x) * 4 + c];
              const left = copy[(y * targetW + (x - 1)) * 4 + c];
              const right = copy[(y * targetW + (x + 1)) * 4 + c];

              const blurred = (up + down + left + right) * 0.25;
              const diff = current - blurred;
              const enhancedVal = current + diff * factor;
              data[idx + c] = Math.max(0, Math.min(255, enhancedVal));
            }
          }
        }
      }

      // Apply contrast, brightness, and color vibrance
      const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      const brightnessAdd = brightness * 1.5;
      const vibranceFactor = vibrance / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        // Brightness & Contrast
        r = contrastFactor * (r + brightnessAdd - 128) + 128;
        g = contrastFactor * (g + brightnessAdd - 128) + 128;
        b = contrastFactor * (b + brightnessAdd - 128) + 128;

        // Vibrance: boosts less saturated colors more
        if (vibrance !== 0) {
          const max = Math.max(r, g, b);
          const avg = (r + g + b) / 3;
          const amt = ((Math.abs(max - avg) * 2) / 255) * vibranceFactor;
          r += (max - r) * amt;
          g += (max - g) * amt;
          b += (max - b) * amt;
        }

        data[i] = Math.max(0, Math.min(255, r));
        data[i + 1] = Math.max(0, Math.min(255, g));
        data[i + 2] = Math.max(0, Math.min(255, b));
      }

      ctx.putImageData(imgData, 0, 0);

      const mimeType = outputFormat === 'png' ? 'image/png' : outputFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, 0.95));

      if (!blob) throw new Error('Failed to encode enhanced image.');

      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
      const url = URL.createObjectURL(blob);
      setEnhancedUrl(url);
      setEnhancedDimensions({ width: targetW, height: targetH });
      setEnhancedSize(blob.size);

      addToast({
        type: 'success',
        title: 'Image Enhanced',
        message: `Upscaled to ${targetW}x${targetH} (${formatFileSize(blob.size)}) with super-clarity!`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Enhancement Failed',
        message: err instanceof Error ? err.message : 'Error enhancing image',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [scale, sharpness, contrast, vibrance, brightness, outputFormat, addToast, enhancedUrl]);

  // Initial process when image is loaded
  useEffect(() => {
    if (file && originalDimensions.width > 0) {
      processEnhancement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, originalDimensions.width]);

  const handleSliderMove = (clientX: number) => {
    const container = comparisonContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setFile(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    imageObjRef.current = null;
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="image/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload an image to enhance quality"
          subtitle="Super-resolution upscale (up to 4x), smart sharpening, and HDR clarity 100% locally."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* Header overview */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Original: {originalDimensions.width}x{originalDimensions.height} ({formatFileSize(file.size)})
                  {enhancedDimensions.width > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">
                      → Enhanced: {enhancedDimensions.width}x{enhancedDimensions.height} ({formatFileSize(enhancedSize)})
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Image
            </button>
          </div>

          {/* Interactive Split Comparison View (Original vs Enhanced) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                Original ({originalDimensions.width}x{originalDimensions.height})
              </span>
              <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">
                Drag center slider to inspect before & after
              </span>
              <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                Enhanced ({scale}x Upscaled)
              </span>
            </div>

            <div
              ref={comparisonContainerRef}
              onMouseDown={() => setIsDraggingSlider(true)}
              onMouseUp={() => setIsDraggingSlider(false)}
              onMouseLeave={() => setIsDraggingSlider(false)}
              onMouseMove={(e) => {
                if (isDraggingSlider) handleSliderMove(e.clientX);
              }}
              onTouchMove={(e) => {
                if (e.touches[0]) handleSliderMove(e.touches[0].clientX);
              }}
              className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-[460px] flex items-center justify-center border border-slate-200 dark:border-white/10 select-none cursor-ew-resize shadow-xl"
            >
              {/* Background: Enhanced Image */}
              {enhancedUrl ? (
                <img
                  src={enhancedUrl}
                  alt="Enhanced Preview"
                  className="max-h-full max-w-full object-contain pointer-events-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs">Enhancing quality...</span>
                </div>
              )}

              {/* Foreground: Original Image (Clipped by slider position) */}
              {originalUrl && (
                <div
                  className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <img
                    src={originalUrl}
                    alt="Original Preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              {/* Draggable Divider Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-20 pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center font-bold text-xs border border-slate-300">
                  ↔
                </div>
              </div>

              {/* Tags */}
              <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white backdrop-blur-xs pointer-events-none">
                Original
              </span>
              <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/80 text-white backdrop-blur-xs pointer-events-none">
                Enhanced ({scale}x)
              </span>

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30">
                  <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
                  <span className="text-xs font-semibold text-white">Re-rendering high quality pixels...</span>
                </div>
              )}
            </div>
          </div>

          {/* Enhancement Presets */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Enhancement Presets
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRESETS.map((p) => {
                const isSelected = selectedPreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                        {p.scale}x
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine-Tuning Controls */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Upscale Factor */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-2">
                <span>Upscale Factor</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{scale}x</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s as UpscaleScale)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                      scale === s
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Sharpening */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Edge Sharpness</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{sharpness}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={sharpness}
                onChange={(e) => setSharpness(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Contrast */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Contrast & Depth</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{contrast > 0 ? `+${contrast}` : contrast}</span>
              </label>
              <input
                type="range"
                min="-30"
                max="50"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            {/* Vibrance */}
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Color Vibrance</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">{vibrance > 0 ? `+${vibrance}` : vibrance}</span>
              </label>
              <input
                type="range"
                min="-20"
                max="60"
                value={vibrance}
                onChange={(e) => setVibrance(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Action Row & Format Selection */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <button
                onClick={processEnhancement}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enhancing Image...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Re-Apply Enhancement
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-neutral-400">
                <span>Output Format:</span>
                {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase transition-colors ${
                      outputFormat === fmt
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-300'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {enhancedUrl && (
              <a
                href={enhancedUrl}
                download={`enhanced-${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Enhanced {scale}x {outputFormat.toUpperCase()} ({formatFileSize(enhancedSize)})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
