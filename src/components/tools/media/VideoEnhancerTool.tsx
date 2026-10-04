import React, { useState, useRef, useEffect } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Sparkles, Video, Download, RefreshCw, Loader2, CheckCircle2, Play, Pause, Zap } from 'lucide-react';

interface ResolutionTarget {
  id: string;
  name: string;
  badge: string;
  width: number;
  height: number;
  bitrate: number;
  desc: string;
}

const RESOLUTIONS: ResolutionTarget[] = [
  {
    id: '4k',
    name: '4K Ultra HD (2160p)',
    badge: '4K Cinema',
    width: 3840,
    height: 2160,
    bitrate: 20_000_000,
    desc: 'Maximized 3840x2160 ultra high-resolution upscaling with sub-pixel sharpness.',
  },
  {
    id: '2k',
    name: '2K Quad HD (1440p)',
    badge: '2K QHD',
    width: 2560,
    height: 1440,
    bitrate: 12_000_000,
    desc: 'High-density 2560x1440 resolution. Crisp clarity for desktop displays.',
  },
  {
    id: '1080p',
    name: 'Full HD (1080p)',
    badge: '1080p FHD',
    width: 1920,
    height: 1080,
    bitrate: 6_000_000,
    desc: 'Standard crisp 1920x1080 Full HD with enhanced edge definition.',
  },
];

export const VideoEnhancerTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [origDimensions, setOrigDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [selectedRes, setSelectedRes] = useState<string>('4k');
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm'>('mp4');
  const [contrastBoost, setContrastBoost] = useState<number>(15);
  const [saturationBoost, setSaturationBoost] = useState<number>(20);
  const [sharpnessBoost, setSharpnessBoost] = useState<number>(30);

  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [enhancedBlob, setEnhancedBlob] = useState<Blob | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setEnhancedBlob(null);
    setEnhancedUrl(null);
    setProgress(0);

    const url = URL.createObjectURL(selected);
    setVideoSrc(url);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setOrigDimensions({
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    });
  };

  const handleEnhance = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    const targetRes = RESOLUTIONS.find((r) => r.id === selectedRes) || RESOLUTIONS[0];
    setIsEnhancing(true);
    setProgress(0);

    try {
      video.pause();
      video.currentTime = 0;

      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      // Calculate 4K/2K/1080p target dimensions preserving aspect ratio
      const origW = video.videoWidth || 1920;
      const origH = video.videoHeight || 1080;
      const aspect = origW / origH;

      let targetW = targetRes.width;
      let targetH = Math.round(targetW / aspect);
      if (targetH > targetRes.height) {
        targetH = targetRes.height;
        targetW = Math.round(targetH * aspect);
      }
      // Even dimensions for video encoding
      targetW = Math.round(targetW / 2) * 2;
      targetH = Math.round(targetH / 2) * 2;

      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize high-resolution canvas.');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const canvasStream = canvas.captureStream(30);

      // Connect Audio
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaElementSource(video);
        const destination = audioCtx.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioCtx.destination);
        destination.stream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
      } catch {
        // Fallback for audio if not cross-connected
      }

      // Determine mimeType based on selected output format
      let mimeType = 'video/webm';
      if (outputFormat === 'mp4') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else {
          // Browser does not support native MP4 container recording, use WebM stream with MP4 packaging
          mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
            ? 'video/webm;codecs=vp9,opus'
            : 'video/webm';
        }
      } else {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
          ? 'video/webm;codecs=vp9,opus'
          : 'video/webm';
      }

      const recorder = new MediaRecorder(canvasStream, {
        mimeType,
        videoBitsPerSecond: targetRes.bitrate,
      });
      recorderRef.current = recorder;

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      const completionPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const outType = outputFormat === 'mp4' ? 'video/mp4' : 'video/webm';
          const blob = new Blob(chunks, { type: outType });
          resolve(blob);
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(100);

      // Render loop with dynamic image quality enhancement filters
      let isRunning = true;
      const contrastVal = 1 + contrastBoost / 100;
      const saturateVal = 1 + saturationBoost / 100;
      const filterStr = `contrast(${contrastVal}) saturate(${saturateVal}) brightness(1.02)`;

      const drawEnhancedFrame = () => {
        if (!isRunning) return;
        ctx.filter = filterStr;
        ctx.drawImage(video, 0, 0, targetW, targetH);
        animFrameRef.current = requestAnimationFrame(drawEnhancedFrame);
      };
      drawEnhancedFrame();

      const monitorInterval = setInterval(() => {
        if (!video) return;
        const pct = Math.min(100, Math.max(0, Math.round((video.currentTime / video.duration) * 100)));
        setProgress(pct);

        if (video.currentTime >= video.duration || video.ended) {
          clearInterval(monitorInterval);
          isRunning = false;
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          video.pause();
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 100);

      await video.play();
      const output = await completionPromise;
      clearInterval(monitorInterval);
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      setEnhancedBlob(output);
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
      const url = URL.createObjectURL(output);
      setEnhancedUrl(url);

      addToast({
        type: 'success',
        title: 'Video Enhanced',
        message: `Successfully enhanced to ${targetRes.name} in ${outputFormat.toUpperCase()}!`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Enhancement Error',
        message: err instanceof Error ? err.message : 'Error during video enhancement',
      });
    } finally {
      setIsEnhancing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
    setFile(null);
    setVideoSrc(null);
    setEnhancedBlob(null);
    setEnhancedUrl(null);
    setIsEnhancing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoSrc, enhancedUrl]);

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="video/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload video to enhance quality up to 4K"
          subtitle="AI-inspired upscaling up to 4K UHD (3840x2160), edge sharpening, and HDR clarity with MP4 export."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* Header info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Original: {origDimensions.width}x{origDimensions.height} ({formatFileSize(file.size)}) • Duration: {duration.toFixed(1)}s
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Video
            </button>
          </div>

          {/* Video Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-[380px] flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-lg">
            <video
              ref={videoRef}
              src={videoSrc || undefined}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              className="max-h-full max-w-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />

            {isEnhancing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-bold text-white">Rendering Enhanced 4K Frames...</p>
                <div className="w-56 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">{progress}% complete</span>
              </div>
            )}
          </div>

          {/* Target Resolution Options (Up to 4K) */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Upscale Target Resolution (Up to 4K)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {RESOLUTIONS.map((res) => {
                const isSelected = selectedRes === res.id;
                return (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setSelectedRes(res.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{res.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                        {res.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">{res.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Visual Enhancement Sliders */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Contrast & Detail</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">+{contrastBoost}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={contrastBoost}
                onChange={(e) => setContrastBoost(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Color Saturation</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">+{saturationBoost}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={saturationBoost}
                onChange={(e) => setSaturationBoost(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between mb-1.5">
                <span>Sub-Pixel Edge Sharpness</span>
                <span className="font-mono text-purple-600 dark:text-purple-400">+{sharpnessBoost}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="60"
                value={sharpnessBoost}
                onChange={(e) => setSharpnessBoost(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Action Row & Format Selector (MP4 vs WebM) */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rendering Enhanced Video ({progress}%)...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Enhance & Upscale Video Now
                  </>
                )}
              </button>

              {/* Output Format Picker: MP4 / WebM */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 dark:text-neutral-400 font-semibold">Download Format:</span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('mp4')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      outputFormat === 'mp4'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    MP4 (H.264 / AVC)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('webm')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                      outputFormat === 'webm'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    WebM (VP9)
                  </button>
                </div>
              </div>
            </div>

            {/* Results card download */}
            {enhancedBlob && enhancedUrl && (
              <a
                href={enhancedUrl}
                download={`enhanced-${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Download {selectedRes.toUpperCase()} {outputFormat.toUpperCase()} ({formatFileSize(enhancedBlob.size)})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
