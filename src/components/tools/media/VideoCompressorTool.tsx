import React, { useState, useRef, useEffect } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Video, Download, RefreshCw, Loader2, Zap, CheckCircle2 } from 'lucide-react';

interface VideoPreset {
  id: string;
  name: string;
  maxHeight: number;
  bitrate: number; // in bps
  desc: string;
  badge: string;
}

const PRESETS: VideoPreset[] = [
  {
    id: 'heavy',
    name: 'Maximum Reduction (480p SD)',
    maxHeight: 480,
    bitrate: 800_000,
    desc: 'Scales down to 480p at 800 kbps. Massive ~70-85% size reduction.',
    badge: 'Smallest Size',
  },
  {
    id: 'balanced',
    name: 'Balanced (720p HD)',
    maxHeight: 720,
    bitrate: 1_800_000,
    desc: 'Crisp 720p at 1.8 Mbps. Excellent balance of quality & compression (~50-65% reduction).',
    badge: 'Recommended',
  },
  {
    id: 'light',
    name: 'High Definition (1080p FHD)',
    maxHeight: 1080,
    bitrate: 3_500_000,
    desc: 'High clarity 1080p at 3.5 Mbps for preserving rich detail (~30-40% reduction).',
    badge: 'High Quality',
  },
];

export const VideoCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const [selectedPreset, setSelectedPreset] = useState<string>('balanced');
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm'>('mp4');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setProgress(0);

    const url = URL.createObjectURL(selected);
    setVideoSrc(url);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setVideoDimensions({
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight,
    });
  };

  const handleCompress = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    const preset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[1];
    setIsCompressing(true);
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

      // Calculate output resolution
      const originalW = video.videoWidth || 1280;
      const originalH = video.videoHeight || 720;
      const scale = Math.min(1, preset.maxHeight / originalH);
      const targetW = Math.round((originalW * scale) / 2) * 2;
      const targetH = Math.round((originalH * scale) / 2) * 2;

      // Setup off-screen canvas
      let canvas = canvasRef.current;
      if (!canvas) {
        canvas = document.createElement('canvas');
        canvasRef.current = canvas;
      }
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize 2D rendering canvas.');

      // Stream from canvas
      const canvasStream = canvas.captureStream(30);

      // Try capturing audio from video
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const source = audioCtx.createMediaElementSource(video);
        const destination = audioCtx.createMediaStreamDestination();
        source.connect(destination);
        source.connect(audioCtx.destination);
        destination.stream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));
      } catch {
        // Fallback: If audio routing fails, continue with canvas video stream
      }

      let mimeType = 'video/webm';
      if (outputFormat === 'mp4') {
        if (MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')) {
          mimeType = 'video/mp4;codecs=avc1';
        } else if (MediaRecorder.isTypeSupported('video/mp4')) {
          mimeType = 'video/mp4';
        } else {
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
        videoBitsPerSecond: preset.bitrate,
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

      // Draw loop
      let isRunning = true;
      const drawFrame = () => {
        if (!isRunning) return;
        ctx.drawImage(video, 0, 0, targetW, targetH);
        animFrameRef.current = requestAnimationFrame(drawFrame);
      };
      drawFrame();

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
      const compressed = await completionPromise;
      clearInterval(monitorInterval);
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      setCompressedBlob(compressed);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      const url = URL.createObjectURL(compressed);
      setCompressedUrl(url);

      const percent = Math.max(0, Math.round(((file.size - compressed.size) / file.size) * 100));
      addToast({
        type: 'success',
        title: 'Video Compressed',
        message: `Saved ${percent}% (${formatFileSize(file.size)} → ${formatFileSize(compressed.size)}).`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Compression Failed',
        message: err instanceof Error ? err.message : 'Error during video compression',
      });
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (compressedUrl) URL.revokeObjectURL(compressedUrl);
    setFile(null);
    setVideoSrc(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
    setIsCompressing(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (compressedUrl) URL.revokeObjectURL(compressedUrl);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoSrc, compressedUrl]);

  const reductionPercent =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="video/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload video to compress"
          subtitle="Supports MP4, WebM, MOV, MKV up to 1024 MB. All processing runs privately in browser."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* Header info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Original: {formatFileSize(file.size)} • {videoDimensions.width}x{videoDimensions.height} • {duration.toFixed(1)}s
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change file
            </button>
          </div>

          {/* Video preview container */}
          <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-[360px] flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-lg">
            <video
              ref={videoRef}
              src={videoSrc || undefined}
              onLoadedMetadata={handleLoadedMetadata}
              playsInline
              className="max-h-full max-w-full object-contain"
            />
            <canvas ref={canvasRef} className="hidden" />

            {isCompressing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-medium text-white">Re-encoding video frames locally...</p>
                <div className="w-56 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{progress}% complete</span>
              </div>
            )}
          </div>

          {/* Presets Selection */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Target Compression Level
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-500/10 border-purple-500 ring-2 ring-purple-500/30'
                        : 'bg-slate-50 dark:bg-white/[0.03] border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{preset.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{preset.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action button & Format Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleCompress}
                disabled={isCompressing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Compressing Video ({progress}%)...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Compress Video Now
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 dark:text-neutral-400 font-semibold">Format:</span>
                <div className="inline-flex rounded-xl bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('mp4')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      outputFormat === 'mp4'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    MP4
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('webm')}
                    className={`px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                      outputFormat === 'webm'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    WebM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {compressedBlob && compressedUrl && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Video Compressed Successfully!</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-0.5">Original Size</span>
                  <span className="text-base font-bold text-slate-900 dark:text-slate-200">{formatFileSize(file.size)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-emerald-300 dark:border-emerald-500/30">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">Compressed Size</span>
                  <span className="text-base font-bold text-emerald-700 dark:text-emerald-300">{formatFileSize(compressedBlob.size)}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-purple-300 dark:border-purple-500/30 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 uppercase tracking-wider block mb-0.5">Reduction</span>
                  <span className="text-base font-bold text-purple-700 dark:text-purple-300">
                    {reductionPercent > 0 ? `-${reductionPercent}%` : 'Re-encoded'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">
                    compressed-{file.name.replace(/\.[^/.]+$/, '')}.{outputFormat}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Optimized client-side with 0 server upload</p>
                </div>
                <a
                  href={compressedUrl}
                  download={`compressed-${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download {outputFormat.toUpperCase()}
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
