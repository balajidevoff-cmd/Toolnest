import React, { useState } from 'react';
import { Copy, Check, Pipette, Palette } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const ColorPickerTool: React.FC = () => {
  const { addToast } = useApp();
  const [hexColor, setHexColor] = useState('#8B5CF6');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert Hex to RGB
  const hexToRgb = (hex: string) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const rgb = hexToRgb(hexColor);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast({
      type: 'success',
      message: `Copied ${text} to clipboard!`,
    });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleEyeDropper = async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setHexColor(result.sRGBHex.toUpperCase());
        }
      } catch {
        // User cancelled eyedropper
      }
    } else {
      addToast({
        type: 'info',
        message: 'EyeDropper API is supported in Chromium-based browsers.',
      });
    }
  };

  // Generate 5 light-to-dark shades
  const shades = [0.9, 0.75, 0.5, 0.25, 0.1].map((factor) => {
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
    return hex;
  });

  return (
    <div className="space-y-8">
      {/* Main Color Picker Card */}
      <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border">
        {/* Visual Swatch */}
        <div className="relative group">
          <div
            style={{ backgroundColor: hexColor }}
            className="w-36 h-36 rounded-2xl shadow-xl border-4 border-white dark:border-dark-border transition-colors cursor-pointer"
            onClick={() => document.getElementById('native-color-picker')?.click()}
          />
          <input
            id="native-color-picker"
            type="color"
            value={hexColor}
            onChange={(e) => setHexColor(e.target.value.toUpperCase())}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label="Pick color"
          />
        </div>

        {/* Inputs and Eyedropper */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={hexColor}
              onChange={(e) => {
                const val = e.target.value;
                setHexColor(val);
              }}
              className="px-4 py-2 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border font-mono text-base font-bold text-light-text dark:text-dark-text focus:outline-none uppercase"
            />
            {typeof window !== 'undefined' && 'EyeDropper' in window && (
              <button
                type="button"
                onClick={handleEyeDropper}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold text-light-text dark:text-dark-text transition-colors"
              >
                <Pipette className="w-4 h-4 text-brand-purple" />
                <span>EyeDropper</span>
              </button>
            )}
          </div>

          <p className="text-xs text-light-muted dark:text-dark-muted">
            Click swatch or input to select any color. Copies formatted CSS tokens instantly.
          </p>
        </div>
      </div>

      {/* Formats Grid with Copy Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* HEX */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">HEX</span>
            <p className="font-mono text-sm font-bold text-light-text dark:text-dark-text mt-0.5">{hexColor}</p>
          </div>
          <button
            onClick={() => copyToClipboard(hexColor, 'hex')}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-light-muted hover:text-brand-purple transition-colors"
            aria-label="Copy HEX"
          >
            {copiedKey === 'hex' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* RGB */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">RGB</span>
            <p className="font-mono text-sm font-bold text-light-text dark:text-dark-text mt-0.5">
              rgb({rgb.r}, {rgb.g}, {rgb.b})
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-light-muted hover:text-brand-purple transition-colors"
            aria-label="Copy RGB"
          >
            {copiedKey === 'rgb' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* HSL */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase text-light-muted dark:text-dark-muted">HSL</span>
            <p className="font-mono text-sm font-bold text-light-text dark:text-dark-text mt-0.5">
              hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
            </p>
          </div>
          <button
            onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-light-muted hover:text-brand-purple transition-colors"
            aria-label="Copy HSL"
          >
            {copiedKey === 'hsl' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Shades and Palette */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-brand-purple" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-light-text dark:text-dark-text">
            Tonal Palette Shades
          </h3>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {shades.map((shade, idx) => (
            <div
              key={idx}
              onClick={() => {
                setHexColor(shade);
                copyToClipboard(shade, `shade-${idx}`);
              }}
              style={{ backgroundColor: shade }}
              className="h-14 rounded-xl cursor-pointer p-2 flex flex-col justify-end text-[10px] font-mono font-bold text-white shadow-sm hover:scale-105 transition-transform"
            >
              <span>{shade}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
