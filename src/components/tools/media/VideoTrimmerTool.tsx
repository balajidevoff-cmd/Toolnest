import React, { useState, useRef, useEffect } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { Video, Play, Pause, Scissors, Download, RefreshCw, Loader2, CheckCircle2 } from 'lucide-react';

export const VideoTrimmerTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm'>('mp4');

  const [isTrimming, setIsTrimming] = useState<boolean>(false);
  const [trimProgress, setTrimProgress] = useState<number>(0);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    setTrimmedUrl(null);
    setTrimmedBlob(null);

    const url = URL.createObjectURL(selected);
    setVideoSrc(url);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const d = videoRef.current.duration;
    setDuration(d);
    setStartTime(0);
    setEndTime(d);
    setCurrentTime(0);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);

    // If regular preview playback reaches end time, pause
    if (!isTrimming && isPlaying && curr >= endTime) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime = startTime;
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekTo = (sec: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(duration, sec));
    videoRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  // Live adjustments with seconds nudge
  const adjustStartTime = (delta: number) => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setStartTime((prev) => {
      const next = Math.max(0, Math.min(endTime - 0.05, prev + delta));
      const rounded = Number(next.toFixed(2));
      seekTo(rounded);
      return rounded;
    });
  };

  const adjustEndTime = (delta: number) => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setEndTime((prev) => {
      const next = Math.min(duration, Math.max(startTime + 0.05, prev + delta));
      const rounded = Number(next.toFixed(2));
      seekTo(rounded);
      return rounded;
    });
  };

  const handleStartInputChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.max(0, Math.min(endTime - 0.05, val));
      const rounded = Number(clamped.toFixed(2));
      setStartTime(rounded);
      seekTo(rounded);
    }
  };

  const handleEndInputChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      const clamped = Math.min(duration, Math.max(startTime + 0.05, val));
      const rounded = Number(clamped.toFixed(2));
      setEndTime(rounded);
      seekTo(rounded);
    }
  };

  const handleTrim = async () => {
    const video = videoRef.current;
    if (!video || !file) return;

    if (endTime - startTime < 0.2) {
      addToast({
        type: 'warning',
        title: 'Clip Too Short',
        message: 'Please select a clip of at least 0.2 seconds.',
      });
      return;
    }

    setIsTrimming(true);
    setTrimProgress(0);

    try {
      video.pause();
      setIsPlaying(false);
      video.currentTime = startTime;

      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };
        video.addEventListener('seeked', onSeeked);
      });

      // Capture stream from video element
      let stream: MediaStream | null = null;
      const v = video as unknown as { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      if (typeof v.captureStream === 'function') {
        stream = v.captureStream();
      } else if (typeof v.mozCaptureStream === 'function') {
        stream = v.mozCaptureStream();
      }

      if (!stream) {
        throw new Error('Your browser does not support video stream capture. Please use Chrome, Edge, or Firefox.');
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

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const trimDuration = endTime - startTime;

      const completionPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          const outType = outputFormat === 'mp4' ? 'video/mp4' : 'video/webm';
          const blob = new Blob(chunks, { type: outType });
          resolve(blob);
        };
        recorder.onerror = (e) => reject(e);
      });

      recorder.start(100);

      const checkInterval = setInterval(() => {
        if (!video) return;
        const elapsed = video.currentTime - startTime;
        const pct = Math.min(100, Math.max(0, Math.round((elapsed / trimDuration) * 100)));
        setTrimProgress(pct);

        if (video.currentTime >= endTime || video.ended) {
          clearInterval(checkInterval);
          video.pause();
          if (recorder.state === 'recording') {
            recorder.stop();
          }
        }
      }, 50);

      await video.play();
      const outputBlob = await completionPromise;
      clearInterval(checkInterval);

      setTrimmedBlob(outputBlob);
      if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
      const url = URL.createObjectURL(outputBlob);
      setTrimmedUrl(url);

      addToast({
        type: 'success',
        title: 'Video Trimmed',
        message: `Successfully trimmed video (${formatFileSize(outputBlob.size)}). Ready for download!`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Trimming Failed',
        message: err instanceof Error ? err.message : 'Error trimming video',
      });
    } finally {
      setIsTrimming(false);
      setTrimProgress(0);
    }
  };

  const handleReset = () => {
    if (videoSrc) URL.revokeObjectURL(videoSrc);
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    setFile(null);
    setVideoSrc(null);
    setTrimmedBlob(null);
    setTrimmedUrl(null);
    setIsPlaying(false);
    setIsTrimming(false);
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (videoSrc) URL.revokeObjectURL(videoSrc);
      if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    };
  }, [videoSrc, trimmedUrl]);

  const clipDuration = Math.max(0, endTime - startTime);

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="video/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload video to cut or trim"
          subtitle="Supports MP4, WebM, MOV, MKV up to 1024 MB. Rendered locally on device."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* File Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  {formatFileSize(file.size)} • Duration: {duration.toFixed(2)}s ({formatSec(duration)})
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Video
            </button>
          </div>

          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden bg-black/90 aspect-video max-h-[380px] flex items-center justify-center border border-slate-200 dark:border-white/10 shadow-lg">
            <video
              ref={videoRef}
              src={videoSrc || undefined}
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              playsInline
              className="max-h-full max-w-full object-contain"
            />
            {isTrimming && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm font-medium text-white">Trimming video clip...</p>
                <div className="w-48 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-150"
                    style={{ width: `${trimProgress}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{trimProgress}%</span>
              </div>
            )}
          </div>

          {/* Quick Play & Time Display Bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                disabled={isTrimming}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <span className="font-mono text-slate-700 dark:text-neutral-300">
                Playhead: <strong className="text-purple-600 dark:text-purple-400">{currentTime.toFixed(2)}s</strong> / {duration.toFixed(2)}s
              </span>
            </div>

            <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 font-mono">
              Selected Clip: {clipDuration.toFixed(2)}s ({formatSec(clipDuration)})
            </span>
          </div>

          {/* Precision Seconds Editors & Nudge Controls (Identical to Audio Trimmer) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Cut Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Start Time (Seconds)
                  </label>
                </div>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatSec(startTime)}
                </span>
              </div>

              {/* Exact numeric input & range slider */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={endTime}
                  value={startTime}
                  onChange={(e) => handleStartInputChange(e.target.value)}
                  className="w-28 px-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#181820] text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.01}
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < endTime) {
                      setStartTime(Number(val.toFixed(2)));
                      seekTo(Number(val.toFixed(2)));
                    }
                  }}
                  className="flex-1 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Precision nudge buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustStartTime(-1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    -1.0s
                  </button>
                  <button
                    onClick={() => adjustStartTime(-0.1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    -0.1s
                  </button>
                  <button
                    onClick={() => adjustStartTime(0.1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    +0.1s
                  </button>
                  <button
                    onClick={() => adjustStartTime(1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    +1.0s
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (currentTime < endTime) {
                      setStartTime(Number(currentTime.toFixed(2)));
                    }
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Set to Playhead
                </button>
              </div>
            </div>

            {/* End Cut Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    End Time (Seconds)
                  </label>
                </div>
                <span className="text-xs font-mono font-semibold text-rose-600 dark:text-rose-400">
                  {formatSec(endTime)}
                </span>
              </div>

              {/* Exact numeric input & range slider */}
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.01"
                  min={startTime}
                  max={duration}
                  value={endTime}
                  onChange={(e) => handleEndInputChange(e.target.value)}
                  className="w-28 px-3 py-1.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-[#181820] text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.01}
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > startTime) {
                      setEndTime(Number(val.toFixed(2)));
                      seekTo(Number(val.toFixed(2)));
                    }
                  }}
                  className="flex-1 accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Precision nudge buttons */}
              <div className="flex items-center justify-between gap-1 pt-1">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustEndTime(-1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    -1.0s
                  </button>
                  <button
                    onClick={() => adjustEndTime(-0.1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    -0.1s
                  </button>
                  <button
                    onClick={() => adjustEndTime(0.1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    +0.1s
                  </button>
                  <button
                    onClick={() => adjustEndTime(1)}
                    className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-neutral-300 transition-colors"
                  >
                    +1.0s
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (currentTime > startTime) {
                      setEndTime(Number(currentTime.toFixed(2)));
                    }
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Set to Playhead
                </button>
              </div>
            </div>
          </div>

          {/* Action Row & Format Selector */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleTrim}
                disabled={isTrimming || endTime <= startTime}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Scissors className="w-4 h-4" />
                Cut & Export Selected Segment ({clipDuration.toFixed(2)}s)
              </button>

              {/* Format Toggle */}
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

            {trimmedBlob && trimmedUrl && (
              <a
                href={trimmedUrl}
                download={`trimmed-${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {outputFormat.toUpperCase()} ({formatFileSize(trimmedBlob.size)})
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
