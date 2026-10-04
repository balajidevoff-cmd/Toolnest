import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { sliceAudioBuffer, audioBufferToWavBlob } from '../../../utils/audioEncoder';
import { Play, Pause, Scissors, Download, RefreshCw, Loader2, Volume2, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

export const AudioTrimmerTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // Exact times in seconds
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentPlayhead, setCurrentPlayhead] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [trimmedSize, setTrimmedSize] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playheadAnimRef = useRef<number | null>(null);
  const playStartTimeRef = useRef<number>(0);
  const playAudioContextTimeRef = useRef<number>(0);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const handleFileSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    stopPlayback();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setTrimmedSize(null);
    setIsProcessing(true);

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await selected.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setCurrentPlayhead(0);
      addToast({
        type: 'success',
        title: 'Audio Loaded',
        message: `Decoded ${decoded.duration.toFixed(2)}s audio. Ready for live trimming!`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Decode Error',
        message: 'Could not decode audio. Please ensure file is a valid audio format.',
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Draw waveform with selected range, dimmed mask, and live playhead
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer || duration <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const channelData = audioBuffer.getChannelData(0);
    const step = Math.ceil(channelData.length / width);
    const amp = height / 2;

    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;
    const playheadX = (currentPlayhead / duration) * width;

    // Draw unselected background mask
    ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
    ctx.fillRect(0, 0, startX, height);
    ctx.fillRect(endX, 0, width - endX, height);

    // Draw active trim selection highlight
    ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
    ctx.fillRect(startX, 0, endX - startX, height);

    // Draw waveform bars
    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = channelData[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      const isInsideSelection = i >= startX && i <= endX;
      ctx.fillStyle = isInsideSelection ? '#9333ea' : '#94a3b8';
      const barY = (1 + min) * amp;
      const barH = Math.max(1.5, (max - min) * amp);
      ctx.fillRect(i, barY, 1.2, barH);
    }

    // Start cut marker
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();

    // End cut marker
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();

    // Playhead marker
    if (isPlaying || currentPlayhead > 0) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(playheadX, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [audioBuffer, duration, startTime, endTime, currentPlayhead, isPlaying]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Handle clicking on waveform to seek or live edit
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const clickedSec = ratio * duration;

    // Set playhead
    setCurrentPlayhead(clickedSec);

    // If click is closer to start or outside, user can adjust
    if (Math.abs(clickedSec - startTime) < Math.abs(clickedSec - endTime)) {
      if (clickedSec < endTime) {
        setStartTime(Number(clickedSec.toFixed(2)));
      }
    } else {
      if (clickedSec > startTime) {
        setEndTime(Number(clickedSec.toFixed(2)));
      }
    }
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignored
      }
      sourceNodeRef.current = null;
    }
    if (playheadAnimRef.current) {
      cancelAnimationFrame(playheadAnimRef.current);
      playheadAnimRef.current = null;
    }
    setIsPlaying(false);
  };

  const playSelection = () => {
    if (!audioBuffer) return;
    if (isPlaying) {
      stopPlayback();
      return;
    }

    const ctx = getAudioContext();
    stopPlayback();

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const playDuration = Math.max(0.1, endTime - startTime);
    source.start(0, startTime, playDuration);
    sourceNodeRef.current = source;
    setIsPlaying(true);
    setCurrentPlayhead(startTime);

    playStartTimeRef.current = startTime;
    playAudioContextTimeRef.current = ctx.currentTime;

    const animatePlayhead = () => {
      const elapsed = ctx.currentTime - playAudioContextTimeRef.current;
      const currentPos = playStartTimeRef.current + elapsed;

      if (currentPos >= endTime) {
        setCurrentPlayhead(startTime);
        setIsPlaying(false);
        stopPlayback();
        return;
      }

      setCurrentPlayhead(currentPos);
      playheadAnimRef.current = requestAnimationFrame(animatePlayhead);
    };

    playheadAnimRef.current = requestAnimationFrame(animatePlayhead);

    source.onended = () => {
      setIsPlaying(false);
      setCurrentPlayhead(startTime);
      if (playheadAnimRef.current) cancelAnimationFrame(playheadAnimRef.current);
    };
  };

  // Live adjustments with seconds nudge
  const adjustStartTime = (delta: number) => {
    stopPlayback();
    setStartTime((prev) => {
      const next = Math.max(0, Math.min(endTime - 0.05, prev + delta));
      const rounded = Number(next.toFixed(2));
      setCurrentPlayhead(rounded);
      return rounded;
    });
  };

  const adjustEndTime = (delta: number) => {
    stopPlayback();
    setEndTime((prev) => {
      const next = Math.min(duration, Math.max(startTime + 0.05, prev + delta));
      return Number(next.toFixed(2));
    });
  };

  const handleStartInputChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      stopPlayback();
      const clamped = Math.max(0, Math.min(endTime - 0.05, val));
      const rounded = Number(clamped.toFixed(2));
      setStartTime(rounded);
      setCurrentPlayhead(rounded);
    }
  };

  const handleEndInputChange = (valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      stopPlayback();
      const clamped = Math.min(duration, Math.max(startTime + 0.05, val));
      setEndTime(Number(clamped.toFixed(2)));
    }
  };

  const handleTrim = async () => {
    if (!audioBuffer || !file) return;
    setIsProcessing(true);
    stopPlayback();

    try {
      const ctx = getAudioContext();
      await new Promise((r) => setTimeout(r, 50));
      const sliced = sliceAudioBuffer(ctx, audioBuffer, startTime, endTime);
      const wavBlob = audioBufferToWavBlob(sliced);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(wavBlob);
      setDownloadUrl(url);
      setTrimmedSize(wavBlob.size);

      addToast({
        type: 'success',
        title: 'Trimming Complete',
        message: `Extracted ${(endTime - startTime).toFixed(2)}s audio segment!`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Trimming Failed',
        message: 'Could not trim audio.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    stopPlayback();
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setAudioBuffer(null);
    setDownloadUrl(null);
    setTrimmedSize(null);
  };

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const clipDuration = Math.max(0, endTime - startTime);

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="audio/*"
          multiple={false}
          onFilesSelected={handleFileSelected}
          title="Upload an audio file to trim or cut"
          subtitle="Supports MP3, WAV, OGG, M4A, FLAC, and WebM • Free up to 1024MB (1GB)"
        />
      ) : (
        <div className="space-y-6">
          {/* File Overview Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Total Length: {duration.toFixed(2)}s ({formatSec(duration)}) • Original Size: {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-neutral-400 hover:text-purple-600 dark:hover:text-white bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Change Audio
            </button>
          </div>

          {/* Interactive Waveform Canvas with Live Edit */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-neutral-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Start: {startTime.toFixed(2)}s
              </span>
              <span className="font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Selected Clip: {clipDuration.toFixed(2)}s ({formatSec(clipDuration)})
              </span>
              <span className="flex items-center gap-1.5">
                End: {endTime.toFixed(2)}s
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
              </span>
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={110}
                onClick={handleCanvasClick}
                className="w-full h-28 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 cursor-pointer shadow-inner"
                title="Click on the waveform to seek or set cut points"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-slate-400 dark:text-neutral-500 bg-white/80 dark:bg-black/60 px-1.5 py-0.5 rounded backdrop-blur-xs pointer-events-none">
                Click waveform to seek
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-neutral-400 font-mono">
              <span>0:00.00</span>
              <span className="text-blue-500 dark:text-blue-400 font-medium">
                Playhead: {currentPlayhead.toFixed(2)}s
              </span>
              <span>{formatSec(duration)}</span>
            </div>
          </div>

          {/* Precision Seconds Editors & Nudge Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Time Card */}
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
                  min="0"
                  max={duration}
                  step="0.01"
                  value={startTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val < endTime) {
                      setStartTime(Number(val.toFixed(2)));
                      setCurrentPlayhead(Number(val.toFixed(2)));
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
                    if (currentPlayhead < endTime) {
                      setStartTime(Number(currentPlayhead.toFixed(2)));
                    }
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Set to Playhead
                </button>
              </div>
            </div>

            {/* End Time Card */}
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
                  min="0"
                  max={duration}
                  step="0.01"
                  value={endTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (val > startTime) {
                      setEndTime(Number(val.toFixed(2)));
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
                    if (currentPlayhead > startTime) {
                      setEndTime(Number(currentPlayhead.toFixed(2)));
                    }
                  }}
                  className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
                >
                  Set to Playhead
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={playSelection}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-[#181820] hover:bg-slate-100 dark:hover:bg-white/10 font-semibold text-xs text-slate-800 dark:text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" />}
              <span>{isPlaying ? 'Pause Preview' : 'Play Selection'}</span>
            </button>

            <button
              onClick={handleTrim}
              disabled={isProcessing || clipDuration <= 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Trimming Audio...</span>
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4" />
                  <span>Cut & Trim Selected {clipDuration.toFixed(2)}s</span>
                </>
              )}
            </button>

            {downloadUrl && (
              <a
                href={downloadUrl}
                download={`trimmed-${file.name.replace(/\.[^/.]+$/, '')}.wav`}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download WAV ({trimmedSize !== null ? formatFileSize(trimmedSize) : ''})</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
