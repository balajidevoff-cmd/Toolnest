import { describe, it, expect } from 'vitest';
import {
  getPerceptualColorDistance,
  detectBackgroundColor,
  generateAlphaMask,
  compositeCutoutImage,
  hexToRgb,
  isHumanSkinColor,
  inpaintMaskedRegion,
  refineCutoutMatte,
} from '../utils/backgroundRemoval';

describe('Background Removal Engine', () => {
  it('calculates accurate perceptual color distances', () => {
    // Identical colors should be 0 distance
    expect(getPerceptualColorDistance(255, 255, 255, 255, 255, 255)).toBe(0);
    expect(getPerceptualColorDistance(0, 0, 0, 0, 0, 0)).toBe(0);

    // Black vs White should be close to 100
    const blackWhiteDist = getPerceptualColorDistance(0, 0, 0, 255, 255, 255);
    expect(blackWhiteDist).toBeGreaterThan(95);

    // Minor tint variation should yield low distance
    const subtleDist = getPerceptualColorDistance(250, 250, 250, 255, 255, 255);
    expect(subtleDist).toBeLessThan(10);
  });

  it('correctly converts hex colors to RGB', () => {
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('accurately detects background color from image perimeter', () => {
    // Create a 10x10 mock image with white background (255, 255, 255)
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4);

    // Fill with white
    for (let i = 0; i < width * height * 4; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    // Put a red box in center
    for (let y = 3; y <= 6; y++) {
      for (let x = 3; x <= 6; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 255;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }

    const mockImgData = { data, width, height };
    const detected = detectBackgroundColor(mockImgData);
    expect(detected.r).toBe(255);
    expect(detected.g).toBe(255);
    expect(detected.b).toBe(255);
  });

  it('removes connected background while preserving interior matching pixels in contiguous mode', () => {
    const width = 10;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4);

    // 10x10 white background
    for (let i = 0; i < width * height * 4; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    // Draw a black ring around center: x in 2..7, y in 2..7
    for (let y = 2; y <= 7; y++) {
      for (let x = 2; x <= 7; x++) {
        const idx = (y * width + x) * 4;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }

    // Put a white dot in the center of black box (x=4, y=4)
    const centerIdx = (4 * width + 4) * 4;
    data[centerIdx] = 255;
    data[centerIdx + 1] = 255;
    data[centerIdx + 2] = 255;

    const mockImgData = { data, width, height };

    // Contiguous removal of white background
    const alphaMask = generateAlphaMask(mockImgData, {
      mode: 'white',
      tolerance: 15,
      feather: 0,
      contiguous: true,
      choke: 0,
      invert: false,
    });

    // Top-left outer pixel should be transparent (0)
    expect(alphaMask[0]).toBe(0);

    // Black ring should be opaque (255)
    const ringPixelIdx = 2 * width + 2;
    expect(alphaMask[ringPixelIdx]).toBe(255);

    // The interior white dot enclosed by the black ring should remain preserved!
    const centerMaskIdx = 4 * width + 4;
    expect(alphaMask[centerMaskIdx]).toBe(255);
  });

  it('composites cutout with solid replacement color', () => {
    const width = 2;
    const height = 2;
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, // Red pixel
      0, 255, 0, 255, // Green pixel
      0, 0, 255, 255, // Blue pixel
      255, 255, 255, 255, // White pixel
    ]);
    const mockImgData = { data, width, height };

    // Alpha mask: first pixel opaque (255), second transparent (0)
    const mask = new Uint8Array([255, 0, 255, 0]);

    // Replace background with solid black #000000
    const composited = compositeCutoutImage(mockImgData, mask, {
      type: 'color',
      color: '#000000',
    });

    // First pixel (fg) should stay red
    expect(composited.data[0]).toBe(255);
    expect(composited.data[1]).toBe(0);
    expect(composited.data[2]).toBe(0);

    // Second pixel (bg replaced) should be black
    expect(composited.data[4]).toBe(0);
    expect(composited.data[5]).toBe(0);
    expect(composited.data[6]).toBe(0);
  });

  it('correctly detects human skin colors to protect people from keying', () => {
    // Typical skin tones (R > 95, G > 40, B > 20, R > G > B)
    expect(isHumanSkinColor(210, 161, 140)).toBe(true); // Light skin
    expect(isHumanSkinColor(141, 85, 56)).toBe(true);   // Darker skin
    expect(isHumanSkinColor(255, 224, 189)).toBe(true); // Fair skin

    // Non-skin colors
    expect(isHumanSkinColor(255, 255, 255)).toBe(false); // Pure white
    expect(isHumanSkinColor(0, 0, 0)).toBe(false);       // Pure black
    expect(isHumanSkinColor(0, 255, 0)).toBe(false);     // Green
    expect(isHumanSkinColor(30, 144, 255)).toBe(false);  // Blue
  });

  it('seamlessly inpaints erased people/regions using background diffusion', () => {
    const width = 8;
    const height = 8;
    const data = new Uint8ClampedArray(width * height * 4);

    // Fill image with blue background (30, 100, 200)
    for (let i = 0; i < width * height * 4; i += 4) {
      data[i] = 30;
      data[i + 1] = 100;
      data[i + 2] = 200;
      data[i + 3] = 255;
    }

    // Place an object/person (red: 255, 0, 0) in the middle 2x2: (3,3), (3,4), (4,3), (4,4)
    const mask = new Uint8Array(width * height);
    for (let y = 3; y <= 4; y++) {
      for (let x = 3; x <= 4; x++) {
        const idx = y * width + x;
        mask[idx] = 1; // Mark to erase
        data[idx * 4] = 255;
        data[idx * 4 + 1] = 0;
        data[idx * 4 + 2] = 0;
      }
    }

    const inpainted = inpaintMaskedRegion({ width, height, data }, mask, 20);

    // The erased center pixel should now blend into surrounding blue background
    const centerIdx = (3 * width + 3) * 4;
    expect(inpainted.data[centerIdx]).toBeCloseTo(30, -1);
    expect(inpainted.data[centerIdx + 1]).toBeCloseTo(100, -1);
    expect(inpainted.data[centerIdx + 2]).toBeCloseTo(200, -1);
  });

  it('refines cutout matte by eliminating background noise specks and choking edge halos', () => {
    const width = 4;
    const height = 4;
    const data = new Uint8ClampedArray(width * height * 4);

    // Pixel 0: background noise speck (alpha 12 < deSpeckleThreshold 25)
    data[0] = 200;
    data[1] = 200;
    data[2] = 200;
    data[3] = 12;

    // Pixel 1: confident foreground (alpha 250)
    data[4] = 50;
    data[5] = 100;
    data[6] = 150;
    data[7] = 250;

    const refined = refineCutoutMatte({ width, height, data }, {
      deSpeckleThreshold: 20,
      edgeChoke: 0,
      edgeSoftness: 0,
      defringeColor: false,
    });

    // Stray speck should be completely clamped to 0
    expect(refined.data[3]).toBe(0);

    // Confident foreground should be 255
    expect(refined.data[7]).toBe(255);
  });
});
