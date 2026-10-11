import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileUploadDropzone } from '../../common/FileUploadDropzone';
import { useApp } from '../../../context/AppContext';
import { formatFileSize } from '../../../utils/format';
import {
  Sparkles,
  Download,
  RefreshCw,
  Loader2,
  Sliders,
  CheckCircle2,
  Eye,
  Pipette,
  Layers,
  Copy,
  Scissors,
  Paintbrush,
  RotateCcw,
  ShieldCheck,
  SplitSquareVertical,
  UserX,
  Users,
  Eraser,
  Wand2,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import {
  RemoveBgOptions,
  ReplaceBgOptions,
  BgColorRGB,
  detectBackgroundColor,
  generateAlphaMask,
  compositeCutoutImage,
  inpaintMaskedRegion,
  removeBackgroundAI,
  removePeopleAI,
  createImageDataPolyfill,
  refineCutoutMatte,
  STUDIO_GRADIENTS,
} from '../../../utils/backgroundRemoval';

type MainActionMode = 'remove-bg' | 'remove-people' | 'selective-eraser';
type KeyingEngine = 'ai' | 'color';
type ViewMode = 'result' | 'split' | 'side-by-side' | 'original';

export const ImageBgRemoverTool: React.FC = () => {
  const { addToast } = useApp();

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Main Action Mode
  const [actionMode, setActionMode] = useState<MainActionMode>('remove-bg');
  const [keyingEngine, setKeyingEngine] = useState<KeyingEngine>('ai');
  const [modelQuality, setModelQuality] = useState<'isnet' | 'isnet_quint8'>('isnet');

  // Edge Refinement & De-Fringing
  const [deSpeckleThreshold, setDeSpeckleThreshold] = useState<number>(25);
  const [edgeChoke, setEdgeChoke] = useState<number>(1.5);
  const [edgeSoftness, setEdgeSoftness] = useState<number>(1);
  const [defringeColor, setDefringeColor] = useState<boolean>(true);

  // Keying Options (for Color mode)
  const [colorMode, setColorMode] = useState<RemoveBgOptions['mode']>('auto');
  const [tolerance, setTolerance] = useState<number>(20);
  const [feather, setFeather] = useState<number>(2);
  const [choke, setChoke] = useState<number>(0);
  const [contiguous, setContiguous] = useState<boolean>(true);
  const [protectSkin, setProtectSkin] = useState<boolean>(true);
  const [customKeyColors, setCustomKeyColors] = useState<BgColorRGB[]>([]);
  const [detectedColor, setDetectedColor] = useState<BgColorRGB>({ r: 255, g: 255, b: 255 });

  // Replacement Options
  const [replaceType, setReplaceType] = useState<ReplaceBgOptions['type']>('transparent');
  const [solidColor, setSolidColor] = useState<string>('#ffffff');
  const [selectedGradient, setSelectedGradient] = useState<string>('sunset');
  const [blurRadius, setBlurRadius] = useState<number>(18);

  // Selective Person / Object Eraser Brush
  const [brushMode, setBrushMode] = useState<'erase-person' | 'touchup-erase' | 'touchup-restore'>('erase-person');
  const [brushSize, setBrushSize] = useState<number>(35);
  const [isBrushPainting, setIsBrushPainting] = useState<boolean>(false);
  const [hasInpaintStrokes, setHasInpaintStrokes] = useState<boolean>(false);

  // Precision Touch-Up Brush for AI Cutout (Erase Specks / Restore Detail)
  const [isTouchupActive, setIsTouchupActive] = useState<boolean>(false);
  const [touchupType, setTouchupType] = useState<'erase' | 'restore'>('erase');
  const [touchupBrushSize, setTouchupBrushSize] = useState<number>(25);
  const [isTouchupPainting, setIsTouchupPainting] = useState<boolean>(false);

  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('result');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<{ progress: number; stage: string }>({ progress: 0, stage: '' });
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [resultFileSize, setResultFileSize] = useState<number>(0);

  // Cached AI cutout mask / image to allow instant backdrop switching without re-inference
  const cachedAiCutoutBlobRef = useRef<Blob | null>(null);
  const cachedAiCutoutUrlRef = useRef<string | null>(null);

  // References
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const comparisonContainerRef = useRef<HTMLDivElement | null>(null);
  const inpaintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inpaintMaskRef = useRef<Uint8Array | null>(null);
  const manualTouchupMaskRef = useRef<Uint8Array | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Composite AI cutout with user's selected backdrop and apply high-definition matte refinement
  const applyBackdropToAiCutout = useCallback(
    async (cutoutBlob: Blob) => {
      const img = imageObjRef.current;
      if (!img) return;

      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const cutoutImg = new Image();
      const blobUrl = URL.createObjectURL(cutoutBlob);
      await new Promise((resolve, reject) => {
        cutoutImg.onload = resolve;
        cutoutImg.onerror = reject;
        cutoutImg.src = blobUrl;
      });

      // 1. Draw raw AI cutout to extract image buffer
      const cutoutCanvas = document.createElement('canvas');
      cutoutCanvas.width = width;
      cutoutCanvas.height = height;
      const cCtx = cutoutCanvas.getContext('2d');
      if (!cCtx) return;

      cCtx.drawImage(cutoutImg, 0, 0, width, height);
      URL.revokeObjectURL(blobUrl);

      // 2. High-definition edge refinement: eliminate stray noise points and trim background halo
      const rawData = cCtx.getImageData(0, 0, width, height);
      const refined = refineCutoutMatte(rawData, {
        deSpeckleThreshold,
        edgeChoke,
        edgeSoftness,
        defringeColor,
      });

      // Apply manual touchup strokes (if user manually erased or restored pixels)
      if (manualTouchupMaskRef.current && manualTouchupMaskRef.current.length === width * height) {
        const mask = manualTouchupMaskRef.current;
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = width;
        srcCanvas.height = height;
        const sCtx = srcCanvas.getContext('2d');
        if (sCtx) {
          sCtx.drawImage(img, 0, 0);
          const sData = sCtx.getImageData(0, 0, width, height).data;
          for (let i = 0; i < width * height; i++) {
            if (mask[i] === 1) {
              // Erase: 100% transparent
              refined.data[i * 4 + 3] = 0;
            } else if (mask[i] === 2) {
              // Restore: original pixel with full opacity
              refined.data[i * 4] = sData[i * 4];
              refined.data[i * 4 + 1] = sData[i * 4 + 1];
              refined.data[i * 4 + 2] = sData[i * 4 + 2];
              refined.data[i * 4 + 3] = 255;
            }
          }
        }
      }

      cCtx.putImageData(createImageDataPolyfill(refined.data, width, height), 0, 0);

      // 3. Composite over chosen backdrop
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply Backdrop
      if (replaceType === 'gradient') {
        const gradSpec = STUDIO_GRADIENTS[selectedGradient] || STUDIO_GRADIENTS.sunset;
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, gradSpec.stops[0]);
        grad.addColorStop(1, gradSpec.stops[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (replaceType === 'blur') {
        ctx.save();
        ctx.filter = `blur(${blurRadius}px)`;
        ctx.drawImage(img, -20, -20, width + 40, height + 40);
        ctx.restore();
      } else if (replaceType === 'color') {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw refined cutout on top
      ctx.drawImage(cutoutCanvas, 0, 0, width, height);

      const mime = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
      const quality = outputFormat === 'jpeg' ? 0.92 : outputFormat === 'webp' ? 0.95 : undefined;

      const finalBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
      if (finalBlob) {
        setResultBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(finalBlob);
        });
        setResultFileSize(finalBlob.size);
      }
    },
    [deSpeckleThreshold, edgeChoke, edgeSoftness, defringeColor, replaceType, selectedGradient, blurRadius, solidColor, outputFormat]
  );

  // Local Color & Chroma Keying Execution
  const executeLocalColorKeying = useCallback(async () => {
    const img = imageObjRef.current;
    if (!img) return;

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const procCanvas = document.createElement('canvas');
    procCanvas.width = width;
    procCanvas.height = height;
    const ctx = procCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const srcImageData = ctx.getImageData(0, 0, width, height);

    if (!manualTouchupMaskRef.current || manualTouchupMaskRef.current.length !== width * height) {
      manualTouchupMaskRef.current = new Uint8Array(width * height);
    }

    const alphaMask = generateAlphaMask(srcImageData, {
      mode: colorMode,
      customColors: customKeyColors.length > 0 ? customKeyColors : [detectedColor],
      tolerance,
      feather,
      contiguous,
      choke,
      invert: false,
      protectSkin,
      manualMask: manualTouchupMaskRef.current,
    });

    ctx.clearRect(0, 0, width, height);

    if (replaceType === 'gradient') {
      const gradSpec = STUDIO_GRADIENTS[selectedGradient] || STUDIO_GRADIENTS.sunset;
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, gradSpec.stops[0]);
      grad.addColorStop(1, gradSpec.stops[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (replaceType === 'blur') {
      ctx.save();
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, -20, -20, width + 40, height + 40);
      ctx.restore();
    } else if (replaceType === 'color') {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, width, height);
    }

    const cutoutImgData = compositeCutoutImage(srcImageData, alphaMask, { type: 'transparent' });
    const cutoutCanvas = document.createElement('canvas');
    cutoutCanvas.width = width;
    cutoutCanvas.height = height;
    const cCtx = cutoutCanvas.getContext('2d');
    if (cCtx) {
      cCtx.putImageData(cutoutImgData, 0, 0);
      ctx.drawImage(cutoutCanvas, 0, 0);
    }

    const mime = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
    const quality = outputFormat === 'jpeg' ? 0.92 : outputFormat === 'webp' ? 0.95 : undefined;

    const blob = await new Promise<Blob | null>((resolve) => procCanvas.toBlob(resolve, mime, quality));
    if (blob) {
      setResultBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultFileSize(blob.size);
    }
  }, [colorMode, customKeyColors, detectedColor, tolerance, feather, contiguous, choke, protectSkin, replaceType, selectedGradient, blurRadius, solidColor, outputFormat]);

  // Selective Person Inpainting / Eraser
  const executeSelectivePersonInpainting = useCallback(async () => {
    const img = imageObjRef.current;
    if (!img) return;

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    if (!inpaintMaskRef.current) {
      addToast({
        type: 'info',
        message: 'Please brush over the person you want to remove.',
      });
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const srcData = ctx.getImageData(0, 0, width, height);

    const inpainted = inpaintMaskedRegion(srcData, inpaintMaskRef.current, 32);
    ctx.putImageData(createImageDataPolyfill(inpainted.data, width, height), 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob) {
      setResultBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultFileSize(blob.size);
      addToast({
        type: 'success',
        title: 'Selected Person Erased',
        message: 'Filled background seamlessly using client-side diffusion inpainting.',
      });
    }
  }, [addToast]);

  // Execution Pipeline: Runs AI Model or High-Speed Local Keyer
  const executeProcess = useCallback(
    async (params?: { forcedEngine?: KeyingEngine; action?: MainActionMode; fileObj?: File }) => {
      const activeFile = params?.fileObj || file;
      const img = imageObjRef.current;
      if (!activeFile || !img) return;

      const currentAction = params?.action || actionMode;
      const currentEngine = params?.forcedEngine || keyingEngine;

      setIsProcessing(true);

      // --- PATH 1: AI SMART PEOPLE & BACKGROUND SEGMENTATION ---
      if (currentEngine === 'ai' && (currentAction === 'remove-bg' || currentAction === 'remove-people')) {
        try {
          setAiProgress({ progress: 10, stage: 'Initializing in-browser AI model...' });

          let cutoutBlob: Blob;
          if (currentAction === 'remove-people') {
            // Remove people from photo, keep background
            cutoutBlob = await removePeopleAI(activeFile, (progress, stage) => {
              setAiProgress({ progress, stage });
            }, modelQuality);
          } else {
            // Remove background, keep people & subjects
            cutoutBlob = await removeBackgroundAI(activeFile, (progress, stage) => {
              setAiProgress({ progress, stage });
            }, modelQuality);
          }

          cachedAiCutoutBlobRef.current = cutoutBlob;
          if (cachedAiCutoutUrlRef.current) URL.revokeObjectURL(cachedAiCutoutUrlRef.current);
          cachedAiCutoutUrlRef.current = URL.createObjectURL(cutoutBlob);

          // Render replacement backdrop behind AI cutout
          await applyBackdropToAiCutout(cutoutBlob);

          addToast({
            type: 'success',
            title: currentAction === 'remove-people' ? 'People Removed' : 'Background Removed',
            message: currentAction === 'remove-people'
              ? 'Removed people locally using AI, preserving background scenery.'
              : 'Cleanly isolated people and subjects with in-browser AI.',
          });
        } catch (err) {
          console.warn('AI in-browser model error, falling back to local color keyer:', err);
          addToast({
            type: 'info',
            title: 'Switched to Local Engine',
            message: 'Using fast client-side studio keyer.',
          });
          setKeyingEngine('color');
          await executeLocalColorKeying();
        } finally {
          setIsProcessing(false);
          setAiProgress({ progress: 0, stage: '' });
        }
        return;
      }

      // --- PATH 2: SELECTIVE PERSON ERASER (INPAINTING) ---
      if (currentAction === 'selective-eraser') {
        await executeSelectivePersonInpainting();
        setIsProcessing(false);
        return;
      }

      // --- PATH 3: INSTANT COLOR & CHROMA STUDIO KEYER ---
      await executeLocalColorKeying();
      setIsProcessing(false);
    },
    [file, actionMode, keyingEngine, modelQuality, applyBackdropToAiCutout, executeSelectivePersonInpainting, executeLocalColorKeying, addToast]
  );

  // Handle Image Selection
  const handleFileSelected = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setResultBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (cachedAiCutoutUrlRef.current) URL.revokeObjectURL(cachedAiCutoutUrlRef.current);

    cachedAiCutoutBlobRef.current = null;
    cachedAiCutoutUrlRef.current = null;
    inpaintMaskRef.current = null;
    manualTouchupMaskRef.current = null;
    setCustomKeyColors([]);
    setHasInpaintStrokes(false);

    const url = URL.createObjectURL(selected);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      imageObjRef.current = img;
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });

      // Detect background color safely from upper region
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
        const detected = detectBackgroundColor(imgData);
        setDetectedColor(detected);
      }

      // Automatically trigger AI background removal for photos, or show original
      executeProcess({ forcedEngine: 'ai', action: 'remove-bg', fileObj: selected });
    };
    img.src = url;
  };

  // Debounced update for slider changes (fast, doesn't freeze browser)
  const triggerDebouncedProcess = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      if (cachedAiCutoutBlobRef.current && keyingEngine === 'ai') {
        applyBackdropToAiCutout(cachedAiCutoutBlobRef.current);
      } else {
        executeLocalColorKeying();
      }
    }, 120);
  }, [keyingEngine, applyBackdropToAiCutout, executeLocalColorKeying]);

  // Re-run backdrop or color adjustments when settings change
  useEffect(() => {
    if (file && originalUrl && imageObjRef.current) {
      triggerDebouncedProcess();
    }
  }, [triggerDebouncedProcess, file, originalUrl]);

  // Eyedropper / Click to Sample Color
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEyedropperActive) return;
    const img = imageObjRef.current;
    if (!img) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const pxX = Math.floor(clickX * scaleX);
    const pxY = Math.floor(clickY * scaleY);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.naturalWidth;
    tempCanvas.height = img.naturalHeight;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const p = ctx.getImageData(pxX, pxY, 1, 1).data;
    const sampled: BgColorRGB = { r: p[0], g: p[1], b: p[2] };

    setCustomKeyColors([sampled]);
    setColorMode('custom');
    setKeyingEngine('color');
    setIsEyedropperActive(false);

    executeLocalColorKeying();

    addToast({
      type: 'success',
      title: 'Background Color Picked',
      message: `Keyed RGB (${p[0]}, ${p[1]}, ${p[2]}) for removal.`,
    });
  };

  // Selective Person / Inpainting Brush Painting & Touch-up Painting
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (actionMode === 'selective-eraser') {
      setIsBrushPainting(true);
      paintInpaintMask(e);
    } else if (isTouchupActive && (actionMode === 'remove-bg' || actionMode === 'remove-people')) {
      setIsTouchupPainting(true);
      paintTouchupStroke(e);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (actionMode === 'selective-eraser' && isBrushPainting) {
      paintInpaintMask(e);
    } else if (isTouchupActive && isTouchupPainting && (actionMode === 'remove-bg' || actionMode === 'remove-people')) {
      paintTouchupStroke(e);
    } else if (isDraggingSlider) {
      updateSliderFromClientX(e.clientX);
    }
  };

  const handleCanvasMouseUp = () => {
    if (isBrushPainting) {
      setIsBrushPainting(false);
      drawInpaintMaskOverlay();
    }
    if (isTouchupPainting) {
      setIsTouchupPainting(false);
      if (cachedAiCutoutBlobRef.current) {
        applyBackdropToAiCutout(cachedAiCutoutBlobRef.current);
      }
    }
    setIsDraggingSlider(false);
  };

  const paintTouchupStroke = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = imageObjRef.current;
    if (!img) return;

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    if (!manualTouchupMaskRef.current || manualTouchupMaskRef.current.length !== width * height) {
      manualTouchupMaskRef.current = new Uint8Array(width * height);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const cx = Math.floor((e.clientX - rect.left) * scaleX);
    const cy = Math.floor((e.clientY - rect.top) * scaleY);
    const r = Math.floor(touchupBrushSize * scaleX);
    const mask = manualTouchupMaskRef.current;
    const val = touchupType === 'erase' ? 1 : 2;

    for (let dy = -r; dy <= r; dy++) {
      const py = cy + dy;
      if (py < 0 || py >= height) continue;
      for (let dx = -r; dx <= r; dx++) {
        const px = cx + dx;
        if (px < 0 || px >= width) continue;
        if (dx * dx + dy * dy <= r * r) {
          mask[py * width + px] = val;
        }
      }
    }
  };

  const clearManualTouchups = () => {
    if (manualTouchupMaskRef.current) {
      manualTouchupMaskRef.current.fill(0);
    }
    if (cachedAiCutoutBlobRef.current) {
      applyBackdropToAiCutout(cachedAiCutoutBlobRef.current);
    }
    addToast({
      type: 'info',
      message: 'Touch-up edits reset.',
    });
  };

  const paintInpaintMask = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = imageObjRef.current;
    if (!img) return;

    const width = img.naturalWidth;
    const height = img.naturalHeight;

    if (!inpaintMaskRef.current || inpaintMaskRef.current.length !== width * height) {
      inpaintMaskRef.current = new Uint8Array(width * height);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;

    const cx = Math.floor((e.clientX - rect.left) * scaleX);
    const cy = Math.floor((e.clientY - rect.top) * scaleY);
    const r = Math.floor(brushSize * scaleX);
    const mask = inpaintMaskRef.current;

    for (let dy = -r; dy <= r; dy++) {
      const py = cy + dy;
      if (py < 0 || py >= height) continue;
      for (let dx = -r; dx <= r; dx++) {
        const px = cx + dx;
        if (px < 0 || px >= width) continue;
        if (dx * dx + dy * dy <= r * r) {
          mask[py * width + px] = 1; // Mark to erase
        }
      }
    }

    setHasInpaintStrokes(true);
    drawInpaintMaskOverlay();
  };

  const drawInpaintMaskOverlay = () => {
    const canvas = inpaintCanvasRef.current;
    const img = imageObjRef.current;
    const mask = inpaintMaskRef.current;
    if (!canvas || !img || !mask) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const imgData = ctx.createImageData(canvas.width, canvas.height);
    const data = imgData.data;

    // Red glowing highlight over painted person
    for (let i = 0; i < mask.length; i++) {
      if (mask[i] === 1) {
        const offset = i * 4;
        data[offset] = 239;     // R
        data[offset + 1] = 68;  // G
        data[offset + 2] = 68;  // B
        data[offset + 3] = 150; // Alpha
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const clearInpaintStrokes = () => {
    if (inpaintMaskRef.current) inpaintMaskRef.current.fill(0);
    const canvas = inpaintCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasInpaintStrokes(false);
  };

  // Split-slider drag handlers
  const updateSliderFromClientX = (clientX: number) => {
    const container = comparisonContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  // Download Handler
  const handleDownload = () => {
    if (!resultBlobUrl || !file) return;
    const link = document.createElement('a');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    link.download = `${baseName}-${actionMode}.${ext}`;
    link.href = resultBlobUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'Download Complete',
      message: `Saved ${baseName}-${actionMode}.${ext} locally.`,
    });
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    if (!resultBlobUrl) return;
    try {
      const response = await fetch(resultBlobUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      addToast({
        type: 'success',
        title: 'Copied to Clipboard',
        message: 'Image copied. Paste directly into Figma, Slack, or Docs!',
      });
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      addToast({
        type: 'warning',
        title: 'Clipboard Action',
        message: 'Direct clipboard copy unavailable. Please use Download.',
      });
    }
  };

  const handleReset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultBlobUrl) URL.revokeObjectURL(resultBlobUrl);
    if (cachedAiCutoutUrlRef.current) URL.revokeObjectURL(cachedAiCutoutUrlRef.current);
    setFile(null);
    setOriginalUrl(null);
    setResultBlobUrl(null);
    imageObjRef.current = null;
    cachedAiCutoutBlobRef.current = null;
    cachedAiCutoutUrlRef.current = null;
    inpaintMaskRef.current = null;
    setHasInpaintStrokes(false);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <FileUploadDropzone
          accept="image/*"
          multiple={false}
          maxSizeMB={1024}
          title="Upload an image to remove background or people"
          subtitle="Instant 100% in-browser AI segmentation & object removal. Zero server uploads."
          onFilesSelected={handleFileSelected}
        />
      ) : (
        <div className="space-y-6">
          {/* Top Header Overview Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2 mt-0.5">
                  <span>{originalDimensions.width}×{originalDimensions.height} px</span>
                  <span>•</span>
                  <span>Original: {formatFileSize(file.size)}</span>
                  {resultFileSize > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Result: {formatFileSize(resultFileSize)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% In-Browser Privacy</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-white bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
            </div>
          </div>

          {/* Primary Action Feature Tabs: Remove Background vs Remove People vs Magic Eraser */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#141419] border border-slate-200 dark:border-white/10 text-xs font-semibold">
            <button
              onClick={() => {
                setActionMode('remove-bg');
                executeProcess({ action: 'remove-bg' });
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                actionMode === 'remove-bg'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Remove Background (Keep People)</span>
            </button>

            <button
              onClick={() => {
                setActionMode('remove-people');
                executeProcess({ action: 'remove-people' });
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                actionMode === 'remove-people'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Remove People (Keep Background)</span>
            </button>

            <button
              onClick={() => {
                setActionMode('selective-eraser');
                setViewMode('original');
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all cursor-pointer ${
                actionMode === 'selective-eraser'
                  ? 'bg-purple-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Magic Eraser (Select Specific People)</span>
            </button>
          </div>

          {/* Interactive Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7/12: Canvas & Comparison Stage */}
            <div className="lg:col-span-7 space-y-4">
              {/* View Switcher Bar */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-100 dark:bg-[#141419] border border-slate-200 dark:border-white/10 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 dark:text-neutral-400 font-medium px-2">Display:</span>
                  <button
                    onClick={() => setViewMode('result')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'result' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    Result
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'split' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    Split Comparison
                  </button>
                  <button
                    onClick={() => setViewMode('side-by-side')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'side-by-side' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    Side by Side
                  </button>
                  <button
                    onClick={() => setViewMode('original')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      viewMode === 'original' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-neutral-300 hover:bg-white/10'
                    }`}
                  >
                    Original
                  </button>
                </div>

                {/* Eyedropper shortcut */}
                {keyingEngine === 'color' && (
                  <button
                    onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      isEyedropperActive ? 'bg-amber-500 text-white' : 'bg-white dark:bg-white/5 text-slate-700 dark:text-neutral-300 border border-slate-200 dark:border-white/10'
                    }`}
                  >
                    <Pipette className="w-3.5 h-3.5" />
                    <span>Eyedropper</span>
                  </button>
                )}
              </div>

              {/* Main Comparison Canvas Stage */}
              <div
                ref={comparisonContainerRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onClick={handleCanvasClick}
                className={`relative w-full rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 select-none ${
                  isEyedropperActive
                    ? 'cursor-crosshair'
                    : actionMode === 'selective-eraser' || isTouchupActive
                    ? 'cursor-crosshair'
                    : 'cursor-default'
                }`}
                style={{
                  minHeight: '380px',
                  maxHeight: '560px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#18181b',
                  backgroundImage:
                    replaceType === 'transparent' && actionMode === 'remove-bg'
                      ? 'repeating-conic-gradient(#27272a 0% 25%, #18181b 0% 50%)'
                      : 'none',
                  backgroundPosition: '0 0, 10px 10px',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Processing Overlay with Progress Bar */}
                {isProcessing && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-xs text-white p-6">
                    <Loader2 className="w-9 h-9 animate-spin text-purple-400 mb-3" />
                    <span className="text-sm font-bold tracking-wide mb-2">
                      {aiProgress.stage || 'Processing image client-side...'}
                    </span>
                    {aiProgress.progress > 0 && (
                      <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all duration-300"
                          style={{ width: `${aiProgress.progress}%` }}
                        />
                      </div>
                    )}
                    <span className="text-[11px] text-neutral-400 mt-2">100% In-Browser • Zero Network Upload</span>
                  </div>
                )}

                {/* Touchup Mode Instruction Badge */}
                {isTouchupActive && (
                  <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-purple-600/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
                    <Eraser className="w-3.5 h-3.5" />
                    <span>
                      {touchupType === 'erase' ? 'Touch-Up: Erasing specks' : 'Touch-Up: Restoring details'} • Paint directly on preview
                    </span>
                  </div>
                )}

                {/* Eyedropper Tip */}
                {isEyedropperActive && (
                  <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold shadow-lg">
                    Click anywhere on image to key out that color
                  </div>
                )}

                {/* Selective Eraser Instruction Badge */}
                {actionMode === 'selective-eraser' && (
                  <div className="absolute top-3 left-3 z-20 px-3 py-1.5 rounded-lg bg-purple-600/90 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Brush over any person to select and erase them</span>
                  </div>
                )}

                {/* VIEW: Clean Result / Cutout */}
                {viewMode === 'result' && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={resultBlobUrl || originalUrl || ''}
                      alt="Result"
                      className="max-h-[520px] max-w-full object-contain"
                    />
                  </div>
                )}

                {/* VIEW: Original Only / Inpainting Canvas */}
                {viewMode === 'original' && originalUrl && (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={originalUrl} alt="Original" className="max-h-[520px] max-w-full object-contain" />
                    {/* Painted Inpainting Mask Overlay */}
                    <canvas
                      ref={inpaintCanvasRef}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* VIEW: Split Comparison */}
                {viewMode === 'split' && originalUrl && (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    {/* Underlying result */}
                    <img
                      src={resultBlobUrl || originalUrl}
                      alt="Processed"
                      className="max-h-[520px] max-w-full object-contain pointer-events-none"
                    />

                    {/* Left overlay clipped to sliderPos */}
                    <div
                      className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                      style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                    >
                      <img src={originalUrl} alt="Original" className="max-h-[520px] max-w-full object-contain" />
                    </div>

                    {/* Divider Line & Handle */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] cursor-ew-resize z-20 flex items-center justify-center"
                      style={{ left: `${sliderPos}%` }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsDraggingSlider(true);
                      }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-[10px] font-bold border border-slate-300">
                        <SplitSquareVertical className="w-3.5 h-3.5 text-purple-600" />
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 text-white text-[10px] font-semibold pointer-events-none">
                      Original
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-purple-900/70 text-white text-[10px] font-semibold pointer-events-none">
                      Processed
                    </div>
                  </div>
                )}

                {/* VIEW: Side by Side */}
                {viewMode === 'side-by-side' && originalUrl && (
                  <div className="grid grid-cols-2 gap-2 w-full h-full p-2">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-black/30 p-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 mb-1">Original</span>
                      <img src={originalUrl} alt="Original" className="max-h-[240px] object-contain" />
                    </div>
                    <div className="flex flex-col items-center justify-center rounded-xl bg-black/30 p-2">
                      <span className="text-[10px] font-bold uppercase text-purple-400 mb-1">Cutout Result</span>
                      <img src={resultBlobUrl || originalUrl} alt="Cutout" className="max-h-[240px] object-contain" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Bar: Download & Copy to Clipboard */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">Format:</span>
                  <div className="flex items-center rounded-lg bg-slate-100 dark:bg-white/5 p-1 border border-slate-200 dark:border-white/10 text-xs font-medium">
                    <button
                      onClick={() => setOutputFormat('png')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        outputFormat === 'png' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-neutral-400'
                      }`}
                    >
                      PNG (Alpha)
                    </button>
                    <button
                      onClick={() => setOutputFormat('webp')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        outputFormat === 'webp' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-neutral-400'
                      }`}
                    >
                      WebP
                    </button>
                    <button
                      onClick={() => setOutputFormat('jpeg')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                        outputFormat === 'jpeg' ? 'bg-purple-600 text-white font-bold shadow-sm' : 'text-slate-600 dark:text-neutral-400'
                      }`}
                    >
                      JPEG
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Image</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!resultBlobUrl}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5/12: Controls Panel */}
            <div className="lg:col-span-5 space-y-5">
              {/* Box 1: Mode Controls */}
              {actionMode === 'selective-eraser' ? (
                /* SELECTIVE ERASER CONTROLS */
                <div className="p-5 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Magic People Eraser</span>
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-neutral-400">
                    Paint over any person or object in the preview. Then click erase to seamlessly fill with the background.
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-neutral-300 font-semibold">Selection Brush Size</span>
                      <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{brushSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                    <button
                      onClick={executeSelectivePersonInpainting}
                      disabled={!hasInpaintStrokes}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md disabled:opacity-40 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Eraser className="w-4 h-4" />
                      <span>Erase Selected Person</span>
                    </button>

                    <button
                      onClick={clearInpaintStrokes}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-neutral-400 hover:text-rose-600 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* REMOVE BG OR REMOVE PEOPLE CONTROLS */
                <div className="p-5 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span>Segmentation Engine</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => {
                        setKeyingEngine('ai');
                        executeProcess({ forcedEngine: 'ai' });
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                        keyingEngine === 'ai'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="font-bold">AI Smart Cutout</span>
                      <span className="text-[10px] opacity-75">Best for people & photos</span>
                    </button>

                    <button
                      onClick={() => {
                        setKeyingEngine('color');
                        executeProcess({ forcedEngine: 'color' });
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                        keyingEngine === 'color'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <Pipette className="w-4 h-4 text-amber-500" />
                      <span className="font-bold">Instant Color Keyer</span>
                      <span className="text-[10px] opacity-75">Chroma & solid colors</span>
                    </button>
                  </div>

                  {keyingEngine === 'color' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setColorMode('auto');
                            executeProcess({ forcedEngine: 'color' });
                          }}
                          className={`p-2 rounded-lg border text-center cursor-pointer ${
                            colorMode === 'auto' ? 'bg-purple-600/10 border-purple-500 text-purple-600 font-bold' : 'border-slate-200 dark:border-white/10'
                          }`}
                        >
                          Auto Detect
                        </button>
                        <button
                          onClick={() => {
                            setColorMode('white');
                            executeProcess({ forcedEngine: 'color' });
                          }}
                          className={`p-2 rounded-lg border text-center cursor-pointer ${
                            colorMode === 'white' ? 'bg-purple-600/10 border-purple-500 text-purple-600 font-bold' : 'border-slate-200 dark:border-white/10'
                          }`}
                        >
                          White Studio
                        </button>
                        <button
                          onClick={() => {
                            setColorMode('green');
                            executeProcess({ forcedEngine: 'color' });
                          }}
                          className={`p-2 rounded-lg border text-center cursor-pointer ${
                            colorMode === 'green' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-600 font-bold' : 'border-slate-200 dark:border-white/10'
                          }`}
                        >
                          Green Screen
                        </button>
                      </div>

                      {/* Tolerance */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Tolerance</span>
                          <span className="font-mono text-purple-600 font-bold">{tolerance}%</span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="70"
                          value={tolerance}
                          onChange={(e) => setTolerance(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>

                      {/* Protect People Skin Checkbox */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-semibold text-slate-800 dark:text-neutral-200">Protect People / Skin Tones</span>
                        <input
                          type="checkbox"
                          checked={protectSkin}
                          onChange={(e) => setProtectSkin(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {keyingEngine === 'ai' && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-white/10 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>Edge Matte & Quality Control</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setDeSpeckleThreshold(25);
                            setEdgeChoke(1.5);
                            setEdgeSoftness(1);
                            setDefringeColor(true);
                          }}
                          className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold cursor-pointer"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Halo Trim (Edge Choke) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-neutral-300 font-medium">Halo Trim (Edge Choke)</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{edgeChoke} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="0.5"
                          value={edgeChoke}
                          onChange={(e) => setEdgeChoke(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-neutral-500">
                          Trims residual wall/background fringe along shoulders and hair silhouette.
                        </p>
                      </div>

                      {/* Stray Point Filter (De-speckle) */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-neutral-300 font-medium">Noise & Stray Points Filter</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{deSpeckleThreshold}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="50"
                          step="5"
                          value={deSpeckleThreshold}
                          onChange={(e) => setDeSpeckleThreshold(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <p className="text-[10px] text-slate-500 dark:text-neutral-500">
                          Removes faint background specks, floating artifacts, and noise points.
                        </p>
                      </div>

                      {/* Edge Softness */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 dark:text-neutral-300 font-medium">Edge Softness / Anti-Aliasing</span>
                          <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{edgeSoftness} px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="3"
                          step="0.5"
                          value={edgeSoftness}
                          onChange={(e) => setEdgeSoftness(Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                      </div>

                      {/* Defringe Color Spill */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-neutral-200 block">De-Fringe Color Spill</span>
                          <span className="text-[10px] text-slate-500 dark:text-neutral-500">
                            Replaces background reflection on outer edge with subject colors
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={defringeColor}
                          onChange={(e) => setDefringeColor(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                        />
                      </div>

                      {/* Model Quality Selection */}
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-1.5">
                        <span className="font-semibold text-slate-800 dark:text-neutral-200 block">AI Neural Model Precision</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (modelQuality !== 'isnet') {
                                setModelQuality('isnet');
                                cachedAiCutoutBlobRef.current = null;
                                executeProcess({ forcedEngine: 'ai' });
                              }
                            }}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                              modelQuality === 'isnet'
                                ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                                : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className="block font-bold">Studio Ultra HD</span>
                            <span className="text-[10px] opacity-75">Full 32-bit ISNet</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (modelQuality !== 'isnet_quint8') {
                                setModelQuality('isnet_quint8');
                                cachedAiCutoutBlobRef.current = null;
                                executeProcess({ forcedEngine: 'ai' });
                              }
                            }}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                              modelQuality === 'isnet_quint8'
                                ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold ring-1 ring-purple-500'
                                : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                          >
                            <span className="block font-bold">Fast Mode</span>
                            <span className="text-[10px] opacity-75">8-bit Quantized</span>
                          </button>
                        </div>
                      </div>

                      {/* Precision Touch-Up Brush Section */}
                      <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-neutral-200 flex items-center gap-1.5">
                            <Eraser className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Precision Touch-Up Brush</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsTouchupActive(!isTouchupActive)}
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                              isTouchupActive
                                ? 'bg-purple-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-300 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                          >
                            {isTouchupActive ? 'Active (Paint on Preview)' : 'Enable Brush'}
                          </button>
                        </div>

                        {isTouchupActive && (
                          <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button
                                type="button"
                                onClick={() => setTouchupType('erase')}
                                className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                                  touchupType === 'erase'
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400'
                                }`}
                              >
                                Erase Specks
                              </button>
                              <button
                                type="button"
                                onClick={() => setTouchupType('restore')}
                                className={`py-1.5 px-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer ${
                                  touchupType === 'restore'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'border border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400'
                                }`}
                              >
                                Restore Details
                              </button>
                            </div>

                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-600 dark:text-neutral-400">Touch-up Brush Size</span>
                                <span className="font-mono text-purple-600 font-bold">{touchupBrushSize} px</span>
                              </div>
                              <input
                                type="range"
                                min="6"
                                max="80"
                                value={touchupBrushSize}
                                onChange={(e) => setTouchupBrushSize(Number(e.target.value))}
                                className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[10px] text-slate-500 dark:text-neutral-500">
                                Paint over preview to wipe stray specks or restore clipped areas.
                              </span>
                              <button
                                type="button"
                                onClick={clearManualTouchups}
                                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold cursor-pointer shrink-0 ml-2"
                              >
                                Reset Brush
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Box 2: Background Backdrop Customizer (for Remove Background mode) */}
              {actionMode === 'remove-bg' && (
                <div className="p-5 rounded-2xl bg-light-card dark:bg-[#141419] border border-light-border dark:border-white/10 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Backdrop Replacement</span>
                  </h3>

                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <button
                      onClick={() => setReplaceType('transparent')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        replaceType === 'transparent'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Transparent
                    </button>

                    <button
                      onClick={() => setReplaceType('color')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        replaceType === 'color'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Solid Color
                    </button>

                    <button
                      onClick={() => setReplaceType('gradient')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        replaceType === 'gradient'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Studio Gradient
                    </button>

                    <button
                      onClick={() => setReplaceType('blur')}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        replaceType === 'blur'
                          ? 'bg-purple-600/10 border-purple-500 text-purple-700 dark:text-purple-400 font-bold'
                          : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                    >
                      Portrait Bokeh
                    </button>
                  </div>

                  {/* Solid Color Options */}
                  {replaceType === 'color' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-white/10">
                      <div className="flex items-center gap-2">
                        {['#ffffff', '#000000', '#f1f5f9', '#9333ea', '#3b82f6', '#10b981', '#f43f5e'].map((hex) => (
                          <button
                            key={hex}
                            onClick={() => setSolidColor(hex)}
                            className={`w-6 h-6 rounded-full border cursor-pointer transition-transform ${
                              solidColor === hex ? 'scale-125 ring-2 ring-purple-600' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          />
                        ))}
                        <input
                          type="color"
                          value={solidColor}
                          onChange={(e) => setSolidColor(e.target.value)}
                          className="w-7 h-7 rounded-md cursor-pointer border-0 bg-transparent ml-auto"
                        />
                      </div>
                    </div>
                  )}

                  {/* Gradient Presets */}
                  {replaceType === 'gradient' && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-white/10">
                      {Object.entries(STUDIO_GRADIENTS).map(([id, grad]) => (
                        <button
                          key={id}
                          onClick={() => setSelectedGradient(id)}
                          className={`h-9 rounded-lg border text-[11px] font-bold text-white flex items-center justify-center cursor-pointer transition-all ${
                            selectedGradient === id ? 'ring-2 ring-purple-600 scale-[1.02]' : 'opacity-85 hover:opacity-100'
                          }`}
                          style={{
                            background: `linear-gradient(135deg, ${grad.stops[0]}, ${grad.stops[1]})`,
                          }}
                        >
                          {grad.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Blur Radius Slider */}
                  {replaceType === 'blur' && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-white/10">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-neutral-300">Bokeh Blur Radius</span>
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{blurRadius} px</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        value={blurRadius}
                        onChange={(e) => setBlurRadius(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
