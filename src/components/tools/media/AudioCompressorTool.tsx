import React, { useState, useRef } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { audioBufferToWavBlob } from '../../../utils/audioEncoder';
import { Volume2, Download, RefreshCw, Loader2, Play, Pause, Zap, CheckCircle2 } from 'lucide-react';

interface CompressionPreset {
  id: string;
  name: string;
  sampleRate: number;
  mono: boolean;
  desc: string;
  badge: string;
}

const PRESETS: CompressionPreset[] = [
  {
    id: 'voice',
    name: 'Maximum (Voice / Speech)',
    sampleRate: 16000,
    mono: true,
    desc: 'Downsamples to 16 kHz & Mono. Massive ~75-85% size reduction.',
    badge: 'Smallest Size',
  },
  {
    id: 'podcast',
    name: 'Podcast & Audiobooks',
    sampleRate: 22050,
    mono: true,
    desc: 'Downsamples to 22.05 kHz & Mono. Balanced speech quality (~60% reduction).',
    badge: 'Recommended',
  },
  {
    id: 'music-light',
    name: 'Music (Compressed)',
    sampleRate: 32000,
    mono: false,
    desc: 'Downsamples to 32 kHz Stereo. Preserves spatial sound with ~35% reduction.',
    badge: 'Balanced',
  },
  {
    id: 'standard',
    name: 'Near-Lossless (44.1 kHz Mono)',
    sampleRate: 44100,
    mono: true,
    desc: 'Full 44.1 kHz frequency range converted to single-channel Mono (50% reduction).',
    badge: 'Studio Voice',
  },
];

export const AudioCompressorTool: React.FC = () => {
  const { addToast } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('podcast');
  const [customRate, setCustomRate] = useState<number>(22050);
  const [customMono, setCustomMono] = useState<boolean>(true);
  const [useCustom, setUseCustom] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

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
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setCompressedBlob(null);
    setIsProcessing(true);

    try {
      const ctx = getAudioContext();
      const arrayBuffer = await selected.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      addToast({
        type: 'success',
        title: 'Audio Ready',
        message: `Loaded ${selected.name} (${formatFileSize(selected.size)}) successfully.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Decode Failed',
        message: 'Unable to decode audio. Please try another audio file.',
      });
      setFile(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompress = async () => {
    if (!audioBuffer || !file) return;
    setIsProcessing(true);

    try {
      let targetRate = customRate;
      let targetMono = customMono;

      if (!useCustom) {
        const preset = PRESETS.find((p) => p.id === selectedPreset) || PRESETS[1];
        targetRate = preset.sampleRate;
        targetMono = preset.mono;
      }

      await new Promise((resolve) => setTimeout(resolve, 50));

      const blob = audioBufferToWavBlob(audioBuffer, targetRate, targetMono);
      setCompressedBlob(blob);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const percent = Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100));
      addToast({
        type: 'success',
        title: 'Compression Finished',
        message: `Reduced by ${percent}% (${formatFileSize(file.size)} → ${formatFileSize(blob.size)})`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Compression Error',
        message: err instanceof Error ? err.message : 'Failed to compress audio',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlayCompressed = () => {
    if (!audioPreviewRef.current || !downloadUrl) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setFile(null);
    setAudioBuffer(null);
    setCompressedBlob(null);
    setDownloadUrl(null);
    setIsPlaying(false);
  };

  const reductionPercent =
    file && compressedBlob
      ? Math.max(0, Math.round(((file.size - compressedBlob.size) / file.size) * 100))
      : 0;

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="audio/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload audio file to compress"
          subtitle="Supports MP3, WAV, OGG, M4A, FLAC up to 1024 MB. Decoded entirely inside your browser."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* File info bar */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
                <Volume2 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400">
                  Original: {formatFileSize(file.size)} • Duration: {audioBuffer?.duration.toFixed(1)}s • Channels: {audioBuffer?.numberOfChannels} • Rate: {audioBuffer?.sampleRate} Hz
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

          {/* Presets Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Compression Preset
              </span>
              <button
                onClick={() => setUseCustom(!useCustom)}
                className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-medium cursor-pointer"
              >
                {useCustom ? 'Use Presets' : 'Custom Options'}
              </button>
            </div>

            {!useCustom ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{preset.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">{preset.desc}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">Target Sample Rate</label>
                  <select
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#181820] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={11025}>11,025 Hz (Ultra compact speech)</option>
                    <option value={16000}>16,000 Hz (Voice / Speech)</option>
                    <option value={22050}>22,050 Hz (Podcast & Web)</option>
                    <option value={32000}>32,000 Hz (Medium Music)</option>
                    <option value={44100}>44,100 Hz (Standard CD Quality)</option>
                    <option value={48000}>48,000 Hz (Studio Audio)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-1.5">Channels</label>
                  <select
                    value={customMono ? 'mono' : 'stereo'}
                    onChange={(e) => setCustomMono(e.target.value === 'mono')}
                    className="w-full bg-white dark:bg-[#181820] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="mono">Mono (1 Channel - 50% smaller)</option>
                    <option value="stereo">Stereo (2 Channels)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Compressing Audio...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Compress Audio Now
                </>
              )}
            </button>
          </div>

          {/* Results Card */}
          {compressedBlob && downloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Audio Compressed Successfully!</span>
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
                    {reductionPercent > 0 ? `-${reductionPercent}%` : 'Optimized format'}
                  </span>
                </div>
              </div>

              {/* Audio preview player */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <audio
                  ref={audioPreviewRef}
                  src={downloadUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <button
                  onClick={togglePlayCompressed}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Listen to compressed preview</span>
                <div className="flex-1" />
                <a
                  href={downloadUrl}
                  download={`compressed-${file.name.replace(/\.[^/.]+$/, '')}.wav`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download WAV
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
