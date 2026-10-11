/**
 * Client-Side Image Background Removal, People Detection & Inpainting Engine
 * 100% in-browser processing - Zero server uploads.
 */

export interface BgColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface RemoveBgOptions {
  mode: 'auto' | 'white' | 'black' | 'green' | 'blue' | 'custom';
  customColors?: BgColorRGB[];
  tolerance: number; // 0 to 100
  feather: number; // 0 to 20 px
  contiguous: boolean; // true = flood-fill from edges inwards, false = global
  choke: number; // -10 to +10 px (erosion/dilation to remove edge color halos)
  invert: boolean;
  protectSkin?: boolean; // prevent people skin from being removed
  manualMask?: Uint8Array | null; // Optional user brush edits (1 = force fg, 2 = force bg, 0 = neutral)
}

export interface ReplaceBgOptions {
  type: 'transparent' | 'color' | 'gradient' | 'blur';
  color?: string; // hex
  gradientId?: string;
  blurRadius?: number; // 5 to 40
}

export const STUDIO_GRADIENTS: Record<string, { name: string; stops: [string, string] }> = {
  slate: { name: 'Clean Studio Slate', stops: ['#334155', '#0f172a'] },
  sunset: { name: 'Warm Sunset Glow', stops: ['#f97316', '#db2777'] },
  cyber: { name: 'Cyberpunk Neon', stops: ['#6366f1', '#a855f7'] },
  emerald: { name: 'Emerald Minimal', stops: ['#0d9488', '#065f46'] },
  pastel: { name: 'Soft Cream Pastel', stops: ['#fef3c7', '#fed7aa'] },
  aurora: { name: 'Northern Aurora', stops: ['#06b6d4', '#3b82f6'] },
  rose: { name: 'Blush Rose Velvet', stops: ['#fb7185', '#be123c'] },
};

export interface ImageBufferData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export function createImageDataPolyfill(
  data: Uint8ClampedArray,
  width: number,
  height: number
): ImageData {
  if (typeof ImageData !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new (ImageData as any)(data, width, height);
  }
  return { width, height, data } as unknown as ImageData;
}

/**
 * Calculates perceptual color distance using the Redmean formula.
 * Returns a value normalized between 0 and 100.
 */
export function getPerceptualColorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rmean = (r1 + r2) >> 1;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  // Redmean formula
  const dist = Math.sqrt(
    (((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8)
  );
  // Max possible distance with redmean is ~764.83
  return Math.min(100, (dist / 765) * 100);
}

/**
 * Standard RGB human skin detection heuristic (Peer et al. algorithm)
 * Prevents people faces, necks, arms from being accidentally keyed out.
 */
export function isHumanSkinColor(r: number, g: number, b: number): boolean {
  return (
    r > 95 &&
    g > 40 &&
    b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 &&
    r > g &&
    r > b
  );
}

/**
 * Analyzes the top boundary and upper corners of the image to auto-detect
 * the dominant background color (avoids bottom border where people/subjects sit).
 */
export function detectBackgroundColor(imageData: ImageBufferData): BgColorRGB {
  const { width, height, data } = imageData;
  if (width === 0 || height === 0) return { r: 255, g: 255, b: 255 };

  const samples: BgColorRGB[] = [];
  const stepX = Math.max(1, Math.floor(width / 24));
  const stepY = Math.max(1, Math.floor(height / 24));

  // Sample top border (wall, sky, ceiling)
  for (let x = 0; x < width; x += stepX) {
    const topIdx = x * 4;
    samples.push({ r: data[topIdx], g: data[topIdx + 1], b: data[topIdx + 2] });
  }

  // Sample top-left and top-right margins (upper 30% only)
  const topMarginHeight = Math.max(1, Math.floor(height * 0.3));
  for (let y = 0; y < topMarginHeight; y += stepY) {
    const leftIdx = y * width * 4;
    samples.push({ r: data[leftIdx], g: data[leftIdx + 1], b: data[leftIdx + 2] });

    const rightIdx = (y * width + (width - 1)) * 4;
    samples.push({ r: data[rightIdx], g: data[rightIdx + 1], b: data[rightIdx + 2] });
  }

  if (samples.length === 0) return { r: 255, g: 255, b: 255 };

  let totalR = 0;
  let totalG = 0;
  let totalB = 0;

  for (const s of samples) {
    totalR += s.r;
    totalG += s.g;
    totalB += s.b;
  }

  return {
    r: Math.round(totalR / samples.length),
    g: Math.round(totalG / samples.length),
    b: Math.round(totalB / samples.length),
  };
}

/**
 * Fast separable 1D box blur on an alpha buffer to produce silky-smooth antialiased edges.
 */
function blurAlphaChannel(
  srcAlpha: Uint8Array,
  width: number,
  height: number,
  radius: number
): Uint8Array {
  if (radius <= 0) return new Uint8Array(srcAlpha);

  const size = width * height;
  const temp = new Float32Array(size);
  const out = new Uint8Array(size);

  const r = Math.min(Math.floor(radius), 25);
  const windowSize = 2 * r + 1;

  // Horizontal blur pass
  for (let y = 0; y < height; y++) {
    const rowOffset = y * width;
    let sum = 0;

    for (let i = -r; i <= r; i++) {
      const x = Math.min(width - 1, Math.max(0, i));
      sum += srcAlpha[rowOffset + x];
    }
    temp[rowOffset] = sum / windowSize;

    for (let x = 1; x < width; x++) {
      const left = Math.max(0, x - r - 1);
      const right = Math.min(width - 1, x + r);
      sum += srcAlpha[rowOffset + right] - srcAlpha[rowOffset + left];
      temp[rowOffset + x] = sum / windowSize;
    }
  }

  // Vertical blur pass
  for (let x = 0; x < width; x++) {
    let sum = 0;

    for (let i = -r; i <= r; i++) {
      const y = Math.min(height - 1, Math.max(0, i));
      sum += temp[y * width + x];
    }
    out[x] = Math.round(sum / windowSize);

    for (let y = 1; y < height; y++) {
      const top = Math.max(0, y - r - 1);
      const btm = Math.min(height - 1, y + r);
      sum += temp[btm * width + x] - temp[top * width + x];
      out[y * width + x] = Math.min(255, Math.max(0, Math.round(sum / windowSize)));
    }
  }

  return out;
}

/**
 * Morphological dilation or erosion on binary mask to choke color halos
 */
function applyChoke(
  mask: Uint8Array,
  width: number,
  height: number,
  choke: number
): Uint8Array {
  if (choke === 0) return mask;

  const result = new Uint8Array(mask);
  const radius = Math.min(Math.abs(choke), 5);
  const expandBg = choke > 0;

  for (let y = 1; y < height - 1; y++) {
    const row = y * width;
    for (let x = 1; x < width; x++) {
      const idx = row + x;
      if (expandBg && mask[idx] === 0) {
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            if (mask[ny * width + nx] === 1) {
              result[idx] = 1;
              break;
            }
          }
          if (result[idx] === 1) break;
        }
      } else if (!expandBg && mask[idx] === 1) {
        for (let dy = -radius; dy <= radius; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            if (mask[ny * width + nx] === 0) {
              result[idx] = 0;
              break;
            }
          }
          if (result[idx] === 0) break;
        }
      }
    }
  }

  return result;
}

/**
 * Generates an alpha mask (0 = background transparent, 255 = foreground keep)
 * for an image entirely in client memory.
 */
export function generateAlphaMask(
  imageData: ImageBufferData,
  options: RemoveBgOptions
): Uint8Array {
  const { width, height, data } = imageData;
  const numPixels = width * height;

  let targets: BgColorRGB[] = [];

  switch (options.mode) {
    case 'auto':
      targets = [detectBackgroundColor(imageData)];
      break;
    case 'white':
      targets = [{ r: 255, g: 255, b: 255 }];
      break;
    case 'black':
      targets = [{ r: 0, g: 0, b: 0 }];
      break;
    case 'green':
      targets = [{ r: 0, g: 255, b: 0 }];
      break;
    case 'blue':
      targets = [{ r: 0, g: 0, b: 255 }];
      break;
    case 'custom':
      targets = options.customColors && options.customColors.length > 0
        ? options.customColors
        : [{ r: 255, g: 255, b: 255 }];
      break;
  }

  const tolerance = Math.max(1, Math.min(100, options.tolerance));
  const isBgMask = new Uint8Array(numPixels);
  const protectSkin = options.protectSkin ?? true;

  const isColorMatching = (r: number, g: number, b: number): boolean => {
    // Protect skin tones from being removed in auto or photo mode
    if (protectSkin && options.mode === 'auto' && isHumanSkinColor(r, g, b)) {
      return false;
    }

    for (const target of targets) {
      if (getPerceptualColorDistance(r, g, b, target.r, target.g, target.b) <= tolerance) {
        return true;
      }
    }
    return false;
  };

  if (options.contiguous) {
    const queue = new Int32Array(numPixels);
    let head = 0;
    let tail = 0;

    const push = (idx: number) => {
      if (isBgMask[idx] === 0) {
        const offset = idx * 4;
        if (isColorMatching(data[offset], data[offset + 1], data[offset + 2])) {
          isBgMask[idx] = 1;
          queue[tail++] = idx;
        }
      }
    };

    // Seed top border
    for (let x = 0; x < width; x++) {
      push(x);
    }

    // Seed upper side borders (avoid bottom where subject sits)
    const seedHeight = Math.floor(height * 0.7);
    for (let y = 0; y < seedHeight; y++) {
      push(y * width);
      push(y * width + (width - 1));
    }

    while (head < tail) {
      const curr = queue[head++];
      const cx = curr % width;
      const cy = Math.floor(curr / width);

      if (cx > 0) push(curr - 1);
      if (cx < width - 1) push(curr + 1);
      if (cy > 0) push(curr - width);
      if (cy < height - 1) push(curr + width);
    }
  } else {
    for (let i = 0; i < numPixels; i++) {
      const offset = i * 4;
      if (isColorMatching(data[offset], data[offset + 1], data[offset + 2])) {
        isBgMask[i] = 1;
      }
    }
  }

  const processedMask = options.choke !== 0
    ? applyChoke(isBgMask, width, height, options.choke)
    : isBgMask;

  const initialAlpha = new Uint8Array(numPixels);
  for (let i = 0; i < numPixels; i++) {
    const isBg = options.invert ? (processedMask[i] === 0) : (processedMask[i] === 1);
    initialAlpha[i] = isBg ? 0 : 255;
  }

  if (options.manualMask && options.manualMask.length === numPixels) {
    for (let i = 0; i < numPixels; i++) {
      const brush = options.manualMask[i];
      if (brush === 1) initialAlpha[i] = 255;
      else if (brush === 2) initialAlpha[i] = 0;
    }
  }

  if (options.feather > 0) {
    return blurAlphaChannel(initialAlpha, width, height, options.feather);
  }

  return initialAlpha;
}

/**
 * Applies the alpha mask and replacement options to create a final cutout ImageData.
 */
export function compositeCutoutImage(
  srcImageData: ImageBufferData,
  alphaMask: Uint8Array,
  replaceOptions: ReplaceBgOptions
): ImageData {
  const { width, height, data } = srcImageData;
  const numPixels = width * height;
  const result = createImageDataPolyfill(new Uint8ClampedArray(data), width, height);
  const outData = result.data;

  if (replaceOptions.type === 'transparent') {
    for (let i = 0; i < numPixels; i++) {
      outData[i * 4 + 3] = alphaMask[i];
    }
    return result;
  }

  if (replaceOptions.type === 'color' && replaceOptions.color) {
    const hex = replaceOptions.color.replace('#', '');
    const parsedR = parseInt(hex.substring(0, 2), 16);
    const parsedG = parseInt(hex.substring(2, 4), 16);
    const parsedB = parseInt(hex.substring(4, 6), 16);
    const bgR = Number.isNaN(parsedR) ? 255 : parsedR;
    const bgG = Number.isNaN(parsedG) ? 255 : parsedG;
    const bgB = Number.isNaN(parsedB) ? 255 : parsedB;

    for (let i = 0; i < numPixels; i++) {
      const offset = i * 4;
      const alpha = alphaMask[i] / 255;
      const origR = data[offset];
      const origG = data[offset + 1];
      const origB = data[offset + 2];

      outData[offset] = Math.round(origR * alpha + bgR * (1 - alpha));
      outData[offset + 1] = Math.round(origG * alpha + bgG * (1 - alpha));
      outData[offset + 2] = Math.round(origB * alpha + bgB * (1 - alpha));
      outData[offset + 3] = 255;
    }
    return result;
  }

  for (let i = 0; i < numPixels; i++) {
    outData[i * 4 + 3] = alphaMask[i];
  }
  return result;
}

/**
 * Content-Aware Inpainting / Object & People Eraser Engine.
 * Erases masked regions and seamlessly blends surrounding background pixels.
 */
export function inpaintMaskedRegion(
  srcImageData: ImageBufferData,
  mask: Uint8Array, // 1 = erase/inpaint, 0 = keep
  iterations = 28
): ImageBufferData {
  const { width, height, data } = srcImageData;
  const numPixels = width * height;
  const outputData = new Uint8ClampedArray(data);

  // Check if any pixels are marked to erase
  let hasMasked = false;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        hasMasked = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasMasked) return { width, height, data: outputData };

  // Expand bounding box by border radius
  minX = Math.max(0, minX - 10);
  maxX = Math.min(width - 1, maxX + 10);
  minY = Math.max(0, minY - 10);
  maxY = Math.min(height - 1, maxY + 10);

  // Initial fill: average color of nearby non-masked boundary
  let boundaryR = 0, boundaryG = 0, boundaryB = 0, count = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * width + x;
      if (mask[idx] === 0) {
        const offset = idx * 4;
        boundaryR += data[offset];
        boundaryG += data[offset + 1];
        boundaryB += data[offset + 2];
        count++;
      }
    }
  }

  const avgR = count > 0 ? Math.round(boundaryR / count) : 200;
  const avgG = count > 0 ? Math.round(boundaryG / count) : 200;
  const avgB = count > 0 ? Math.round(boundaryB / count) : 200;

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        const offset = idx * 4;
        outputData[offset] = avgR;
        outputData[offset + 1] = avgG;
        outputData[offset + 2] = avgB;
      }
    }
  }

  // Iterative Dirichlet / Laplace diffusion inpainting
  for (let iter = 0; iter < iterations; iter++) {
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const idx = y * width + x;
        if (mask[idx] === 1) {
          const offset = idx * 4;
          const left = (x > 0 ? (y * width + (x - 1)) : idx) * 4;
          const right = (x < width - 1 ? (y * width + (x + 1)) : idx) * 4;
          const up = (y > 0 ? ((y - 1) * width + x) : idx) * 4;
          const down = (y < height - 1 ? ((y + 1) * width + x) : idx) * 4;

          outputData[offset] = (outputData[left] + outputData[right] + outputData[up] + outputData[down]) >> 2;
          outputData[offset + 1] = (outputData[left + 1] + outputData[right + 1] + outputData[up + 1] + outputData[down + 1]) >> 2;
          outputData[offset + 2] = (outputData[left + 2] + outputData[right + 2] + outputData[up + 2] + outputData[down + 2]) >> 2;
        }
      }
    }
  }

  return { width, height, data: outputData };
}

/**
 * High-definition matte refinement:
 * - Kills low-alpha floating points and background noise specks.
 * - Chokes border halos to remove background bleeding (such as light wall rims).
 * - De-fringes edge pixels by borrowing true foreground colors from confident neighbors.
 * - Anti-aliases the silhouette with smooth sub-pixel alpha curves.
 */
export interface MatteRefinementOptions {
  deSpeckleThreshold?: number; // 0 to 45 (default 25) - any faint background alpha below this is eliminated
  edgeChoke?: number;          // 0 to 6 px (default 1) - erodes the outer border to strip edge fringe
  edgeSoftness?: number;       // 0 to 6 px (default 1) - applies smooth antialiasing to the final cutout boundary
  defringeColor?: boolean;     // suppresses background color bleeding on semi-transparent edge pixels
}

/**
 * Removes small disconnected floating noise islands (dust specks, AI artifacts).
 * Any isolated cluster of alpha > 0 pixels with area < minIslandSize is removed.
 */
export function removeSmallIslands(
  alpha: Uint8Array,
  width: number,
  height: number,
  minIslandSize = 80
): Uint8Array {
  const numPixels = width * height;
  const result = new Uint8Array(alpha);
  const visited = new Uint8Array(numPixels);
  const queueX = new Int32Array(minIslandSize + 10);
  const queueY = new Int32Array(minIslandSize + 10);

  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = row + x;
      if (visited[idx] === 1 || alpha[idx] === 0) continue;

      // Start BFS for connected island
      visited[idx] = 1;
      let head = 0;
      let tail = 0;
      queueX[tail] = x;
      queueY[tail] = y;
      tail++;

      const islandIndices: number[] = [idx];
      let isLarge = false;

      while (head < tail) {
        const cx = queueX[head];
        const cy = queueY[head];
        head++;

        const neighbors = [
          cx > 0 ? [cx - 1, cy] : null,
          cx < width - 1 ? [cx + 1, cy] : null,
          cy > 0 ? [cx, cy - 1] : null,
          cy < height - 1 ? [cx, cy + 1] : null,
        ];

        for (const n of neighbors) {
          if (!n) continue;
          const [nx, ny] = n;
          const nIdx = ny * width + nx;
          if (visited[nIdx] === 0 && alpha[nIdx] > 0) {
            visited[nIdx] = 1;
            islandIndices.push(nIdx);

            if (islandIndices.length >= minIslandSize) {
              isLarge = true;
              break;
            }

            if (tail < queueX.length) {
              queueX[tail] = nx;
              queueY[tail] = ny;
              tail++;
            }
          }
        }

        if (isLarge) break;
      }

      // If island is smaller than minIslandSize, eliminate it
      if (!isLarge && islandIndices.length < minIslandSize) {
        for (const pIdx of islandIndices) {
          result[pIdx] = 0;
        }
      }
    }
  }

  return result;
}

export function refineCutoutMatte(
  imageData: ImageBufferData,
  options: MatteRefinementOptions = {}
): ImageBufferData {
  const { width, height, data } = imageData;
  const numPixels = width * height;
  const output = new Uint8ClampedArray(data);

  const deSpeckleThreshold = options.deSpeckleThreshold ?? 25;
  const edgeChoke = options.edgeChoke ?? 1;
  const edgeSoftness = options.edgeSoftness ?? 1;
  const defringeColor = options.defringeColor ?? true;

  // PASS 1: De-speckle & Alpha S-Curve contrast
  // Eliminates stray floating background points and solidifies foreground
  const alphaChannel = new Uint8Array(numPixels);

  for (let i = 0; i < numPixels; i++) {
    const rawAlpha = data[i * 4 + 3];

    if (rawAlpha <= deSpeckleThreshold) {
      alphaChannel[i] = 0;
    } else if (rawAlpha >= 240) {
      alphaChannel[i] = 255;
    } else {
      // Smoothstep interpolation between deSpeckleThreshold and 240
      const t = (rawAlpha - deSpeckleThreshold) / (240 - deSpeckleThreshold);
      alphaChannel[i] = Math.round((t * t * (3 - 2 * t)) * 255);
    }
  }

  // PASS 1.5: Remove small disconnected floating noise islands / dust specks
  const minIsland = Math.min(80, Math.floor(numPixels * 0.02));
  const cleanedAlpha = minIsland > 2
    ? removeSmallIslands(alphaChannel, width, height, minIsland)
    : alphaChannel;

  // PASS 2: Edge Choke (strips white/gray halo on shoulders & hair)
  const chokedAlpha = new Uint8Array(cleanedAlpha);
  if (edgeChoke > 0) {
    const r = Math.min(4, Math.ceil(edgeChoke));
    for (let y = 0; y < height; y++) {
      const row = y * width;
      for (let x = 0; x < width; x++) {
        const idx = row + x;
        if (alphaChannel[idx] > 0) {
          let minDistance = 999;
          for (let dy = -r; dy <= r; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= height) continue;
            for (let dx = -r; dx <= r; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= width) continue;
              if (alphaChannel[ny * width + nx] === 0) {
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDistance) minDistance = dist;
              }
            }
          }

          if (minDistance <= edgeChoke) {
            const factor = Math.max(0, (minDistance - 0.5) / edgeChoke);
            chokedAlpha[idx] = Math.round(alphaChannel[idx] * factor);
          }
        }
      }
    }
  }

  // PASS 3: Edge Softness (1D separable box blur on alpha for anti-aliasing)
  const smoothedAlpha = edgeSoftness > 0
    ? blurAlphaChannel(chokedAlpha, width, height, edgeSoftness)
    : chokedAlpha;

  // PASS 4: De-fringe / Spill Suppression & final assembly
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      const idx = row + x;
      const offset = idx * 4;
      const alpha = smoothedAlpha[idx];
      output[offset + 3] = alpha;

      // For semi-transparent edge pixels, decontaminate background color bleeding
      if (defringeColor && alpha > 15 && alpha < 220) {
        let bestR = output[offset];
        let bestG = output[offset + 1];
        let bestB = output[offset + 2];
        let foundConfident = false;

        for (let dy = -2; dy <= 2 && !foundConfident; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= height) continue;
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            if (nx < 0 || nx >= width) continue;
            const nIdx = ny * width + nx;
            if (alphaChannel[nIdx] >= 235) {
              const nOff = nIdx * 4;
              bestR = data[nOff];
              bestG = data[nOff + 1];
              bestB = data[nOff + 2];
              foundConfident = true;
              break;
            }
          }
        }

        if (foundConfident) {
          output[offset] = bestR;
          output[offset + 1] = bestG;
          output[offset + 2] = bestB;
        }
      }
    }
  }

  return { width, height, data: output };
}

/**
 * AI-powered background removal using client-side ISNet ONNX model via @imgly/background-removal.
 * 100% in-browser WebAssembly/WebGPU execution. Zero server uploads.
 */
export async function removeBackgroundAI(
  imageSource: Blob | File | string,
  onProgress?: (progress: number, stage: string) => void,
  modelQuality: 'isnet' | 'isnet_fp16' | 'isnet_quint8' = 'isnet'
): Promise<Blob> {
  const { removeBackground } = await import('@imgly/background-removal');
  return removeBackground(imageSource, {
    model: modelQuality,
    device: 'gpu',
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        const pct = Math.round((current / total) * 100);
        let stage = 'Processing...';
        if (key.includes('fetch')) stage = `Loading AI model (${pct}%)...`;
        else if (key.includes('inference') || key.includes('compute')) stage = `Segmenting people (${pct}%)...`;
        onProgress(pct, stage);
      }
    },
  });
}

/**
 * AI-powered people / foreground removal.
 * Keeps background and removes people from the photo.
 */
export async function removePeopleAI(
  imageSource: Blob | File | string,
  onProgress?: (progress: number, stage: string) => void,
  modelQuality: 'isnet' | 'isnet_fp16' | 'isnet_quint8' = 'isnet'
): Promise<Blob> {
  const { removeForeground } = await import('@imgly/background-removal');
  return removeForeground(imageSource, {
    model: modelQuality,
    device: 'gpu',
    progress: (key: string, current: number, total: number) => {
      if (onProgress && total > 0) {
        const pct = Math.round((current / total) * 100);
        let stage = 'Processing...';
        if (key.includes('fetch')) stage = `Loading AI model (${pct}%)...`;
        else if (key.includes('inference') || key.includes('compute')) stage = `Removing people (${pct}%)...`;
        onProgress(pct, stage);
      }
    },
  });
}

/**
 * Helper to parse hex string into RGB
 */
export function hexToRgb(hex: string): BgColorRGB {
  const cleanHex = hex.replace('#', '');
  return {
    r: parseInt(cleanHex.substring(0, 2), 16) || 0,
    g: parseInt(cleanHex.substring(2, 4), 16) || 0,
    b: parseInt(cleanHex.substring(4, 6), 16) || 0,
  };
}
