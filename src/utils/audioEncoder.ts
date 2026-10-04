/**
 * Browser-native Web Audio API utilities for slicing, downmixing, merging,
 * and encoding AudioBuffers to standard PCM WAV format.
 */

export function sliceAudioBuffer(
  audioCtx: AudioContext,
  buffer: AudioBuffer,
  startSec: number,
  endSec: number
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const startOffset = Math.max(0, Math.floor(startSec * sampleRate));
  const endOffset = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const frameCount = Math.max(1, endOffset - startOffset);

  const channels = buffer.numberOfChannels;
  const sliced = audioCtx.createBuffer(channels, frameCount, sampleRate);

  for (let c = 0; c < channels; c++) {
    const srcData = buffer.getChannelData(c);
    const destData = sliced.getChannelData(c);
    for (let i = 0; i < frameCount; i++) {
      destData[i] = srcData[startOffset + i];
    }
  }

  return sliced;
}

export function mergeAudioBuffers(
  audioCtx: AudioContext,
  buffers: AudioBuffer[]
): AudioBuffer {
  if (buffers.length === 0) {
    return audioCtx.createBuffer(1, 1, 44100);
  }
  if (buffers.length === 1) {
    return buffers[0];
  }

  const sampleRate = buffers[0].sampleRate;
  const channels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);

  const merged = audioCtx.createBuffer(channels, totalLength, sampleRate);

  let currentOffset = 0;
  for (const b of buffers) {
    for (let c = 0; c < channels; c++) {
      const srcChannel = c < b.numberOfChannels ? b.getChannelData(c) : b.getChannelData(0);
      const destChannel = merged.getChannelData(c);
      destChannel.set(srcChannel, currentOffset);
    }
    currentOffset += b.length;
  }

  return merged;
}

export function audioBufferToWavBlob(
  buffer: AudioBuffer,
  targetSampleRate?: number,
  forceMono: boolean = false
): Blob {
  const numChannels = forceMono ? 1 : buffer.numberOfChannels;
  const sampleRate = targetSampleRate || buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  // Simple linear interpolation resampler if targetSampleRate differs
  const sourceRate = buffer.sampleRate;
  const ratio = sourceRate / sampleRate;
  const outputLength = Math.round(buffer.length / ratio);

  const interleaved = new Float32Array(outputLength * numChannels);

  if (forceMono && buffer.numberOfChannels > 1) {
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    for (let i = 0; i < outputLength; i++) {
      const srcIdx = i * ratio;
      const idx0 = Math.floor(srcIdx);
      const idx1 = Math.min(buffer.length - 1, idx0 + 1);
      const frac = srcIdx - idx0;
      const s0 = (left[idx0] + right[idx0]) * 0.5;
      const s1 = (left[idx1] + right[idx1]) * 0.5;
      interleaved[i] = s0 + frac * (s1 - s0);
    }
  } else {
    for (let c = 0; c < numChannels; c++) {
      const src = buffer.getChannelData(c % buffer.numberOfChannels);
      for (let i = 0; i < outputLength; i++) {
        const srcIdx = i * ratio;
        const idx0 = Math.floor(srcIdx);
        const idx1 = Math.min(buffer.length - 1, idx0 + 1);
        const frac = srcIdx - idx0;
        const sample = src[idx0] + frac * (src[idx1] - src[idx0]);
        interleaved[i * numChannels + c] = sample;
      }
    }
  }

  const dataSize = outputLength * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true);  // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Write PCM samples (clamped between -1 and 1)
  let offset = 44;
  for (let i = 0; i < interleaved.length; i++) {
    const s = Math.max(-1, Math.min(1, interleaved[i]));
    const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
    view.setInt16(offset, val, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
