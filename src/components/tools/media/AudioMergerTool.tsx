import React, { useState, useRef } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import { mergeAudioBuffers, audioBufferToWavBlob } from '../../../utils/audioEncoder';
import { Music, ArrowUp, ArrowDown, Trash2, Download, Loader2, Play, Pause, Plus, CheckCircle2 } from 'lucide-react';

interface AudioTrackItem {
  id: string;
  file: File;
  duration?: number;
  buffer?: AudioBuffer;
}

export const AudioMergerTool: React.FC = () => {
  const { addToast } = useApp();
  const [tracks, setTracks] = useState<AudioTrackItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const ctx = getAudioContext();

    const newItems: AudioTrackItem[] = [];
    for (const f of newFiles) {
      const id = `${f.name}-${Date.now()}-${Math.random()}`;
      try {
        const ab = await f.arrayBuffer();
        const decoded = await ctx.decodeAudioData(ab);
        newItems.push({ id, file: f, duration: decoded.duration, buffer: decoded });
      } catch {
        newItems.push({ id, file: f });
      }
    }

    setTracks((prev) => [...prev, ...newItems]);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setMergedBlob(null);

    addToast({
      type: 'success',
      title: 'Tracks Added',
      message: `Added ${newItems.length} audio track(s). Total: ${tracks.length + newItems.length}`,
    });
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;
    const copy = [...tracks];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    setTracks(copy);
  };

  const removeTrack = (index: number) => {
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setTracks([]);
    setMergedBlob(null);
    setDownloadUrl(null);
    setIsPlaying(false);
  };

  const handleMerge = async () => {
    if (tracks.length < 2) {
      addToast({
        type: 'warning',
        title: 'Need at least 2 tracks',
        message: 'Please add 2 or more audio files to merge them together.',
      });
      return;
    }

    setIsProcessing(true);
    setProgressMsg('Preparing audio context...');
    try {
      const ctx = getAudioContext();
      const buffersToMerge: AudioBuffer[] = [];

      for (let i = 0; i < tracks.length; i++) {
        const item = tracks[i];
        setProgressMsg(`Decoding track ${i + 1} of ${tracks.length}: ${item.file.name}...`);
        if (item.buffer) {
          buffersToMerge.push(item.buffer);
        } else {
          const ab = await item.file.arrayBuffer();
          const decoded = await ctx.decodeAudioData(ab);
          item.buffer = decoded;
          buffersToMerge.push(decoded);
        }
      }

      setProgressMsg('Concatenating audio buffers...');
      await new Promise((r) => setTimeout(r, 50));
      const mergedBuffer = mergeAudioBuffers(ctx, buffersToMerge);

      setProgressMsg('Encoding merged WAV file...');
      await new Promise((r) => setTimeout(r, 50));
      const blob = audioBufferToWavBlob(mergedBuffer);
      setMergedBlob(blob);

      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      addToast({
        type: 'success',
        title: 'Merge Complete',
        message: `Successfully merged ${tracks.length} tracks into ${formatFileSize(blob.size)}.`,
      });
    } catch (err: unknown) {
      addToast({
        type: 'error',
        title: 'Merge Failed',
        message: err instanceof Error ? err.message : 'Error merging audio files',
      });
    } finally {
      setIsProcessing(false);
      setProgressMsg('');
    }
  };

  const togglePlayMerged = () => {
    if (!audioPreviewRef.current || !downloadUrl) return;
    if (isPlaying) {
      audioPreviewRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlaying(true);
    }
  };

  const totalDuration = tracks.reduce((acc, t) => acc + (t.duration || 0), 0);
  const totalInputSize = tracks.reduce((acc, t) => acc + t.file.size, 0);

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <FileUploadDropzone
        accept="audio/*"
        multiple={true}
        maxSizeMB={1024}
        title="Upload audio tracks to merge"
        subtitle="Add multiple audio files (up to 1024 MB each). Re-order tracks and merge locally."
        onFilesSelected={handleFilesSelected}
      />

      {/* Tracks List */}
      {tracks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Track Sequence ({tracks.length} tracks • {totalDuration.toFixed(1)}s total • {formatFileSize(totalInputSize)})
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-rose-500 hover:underline cursor-pointer font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-2">
            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex items-center gap-3 p-3.5 bg-slate-50 dark:bg-white/[0.03] rounded-2xl border border-slate-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-white/20 transition-colors"
              >
                <span className="w-6 text-center text-xs font-bold text-purple-600 dark:text-purple-400">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{track.file.name}</p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {formatFileSize(track.file.size)} {track.duration ? `• ${track.duration.toFixed(1)}s` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveTrack(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveTrack(idx, 'down')}
                    disabled={idx === tracks.length - 1}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeTrack(idx)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors ml-1 cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleMerge}
              disabled={isProcessing || tracks.length < 2}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Merging Tracks...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Merge {tracks.length} Tracks Into One
                </>
              )}
            </button>
            {progressMsg && <span className="text-xs text-purple-600 dark:text-purple-400 font-medium animate-pulse">{progressMsg}</span>}
          </div>

          {/* Merged Result */}
          {mergedBlob && downloadUrl && (
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Tracks Merged Successfully!</span>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <audio
                  ref={audioPreviewRef}
                  src={downloadUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <button
                  onClick={togglePlayMerged}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900 dark:text-slate-200">merged-audio.wav</p>
                  <p className="text-slate-500 dark:text-slate-400">Size: {formatFileSize(mergedBlob.size)}</p>
                </div>
                <div className="flex-1" />
                <a
                  href={downloadUrl}
                  download="merged-audio.wav"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Merged WAV
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
