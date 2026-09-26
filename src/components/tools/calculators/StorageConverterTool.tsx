import React, { useState } from 'react';
import { HardDrive, Info } from 'lucide-react';

export const StorageConverterTool: React.FC = () => {
  const [value, setValue] = useState<number>(100);
  const [selectedUnit, setSelectedUnit] = useState<string>('GB');

  // Multipliers to bytes
  const unitMultipliers: Record<string, { bytes: number; isBinary: boolean; description: string }> = {
    B: { bytes: 1, isBinary: false, description: 'Byte (8 bits)' },
    // Decimal (SI - 1000^n)
    KB: { bytes: 1e3, isBinary: false, description: 'Kilobyte (1,000 bytes)' },
    MB: { bytes: 1e6, isBinary: false, description: 'Megabyte (1,000,000 bytes)' },
    GB: { bytes: 1e9, isBinary: false, description: 'Gigabyte (1,000,000,000 bytes)' },
    TB: { bytes: 1e12, isBinary: false, description: 'Terabyte (10^12 bytes)' },
    PB: { bytes: 1e15, isBinary: false, description: 'Petabyte (10^15 bytes)' },
    // Binary (IEC - 1024^n)
    KiB: { bytes: 1024, isBinary: true, description: 'Kibibyte (1,024 bytes)' },
    MiB: { bytes: 1024 ** 2, isBinary: true, description: 'Mebibyte (1,048,576 bytes)' },
    GiB: { bytes: 1024 ** 3, isBinary: true, description: 'Gibibyte (1,073,741,824 bytes)' },
    TiB: { bytes: 1024 ** 4, isBinary: true, description: 'Tebibyte (2^40 bytes)' },
    PiB: { bytes: 1024 ** 5, isBinary: true, description: 'Pebibyte (2^50 bytes)' },
  };

  const currentMultiplier = unitMultipliers[selectedUnit]?.bytes || 1;
  const totalBytes = (value || 0) * currentMultiplier;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Educational notice */}
      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Decimal (SI) vs Binary (IEC) Storage</p>
          <p className="text-light-muted dark:text-dark-muted mt-0.5 leading-relaxed">
            Storage drive manufacturers (HDD/SSD) sell drives using decimal units (1 GB = 1,000,000,000 bytes), while operating systems (Windows, macOS, Linux) calculate disk space using binary units (1 GiB = 1,073,741,824 bytes). This explains why a 1 TB drive shows as ~931 GiB in OS filesystems.
          </p>
        </div>
      </div>

      {/* Input row */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
            Value to Convert
          </label>
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-base font-mono text-light-text dark:text-dark-text focus:outline-none"
          />
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted mb-1.5">
            Source Unit
          </label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm font-semibold text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
          >
            <optgroup label="Decimal (SI - 1000^n)">
              <option value="B">B (Bytes)</option>
              <option value="KB">KB (Kilobytes)</option>
              <option value="MB">MB (Megabytes)</option>
              <option value="GB">GB (Gigabytes)</option>
              <option value="TB">TB (Terabytes)</option>
              <option value="PB">PB (Petabytes)</option>
            </optgroup>
            <optgroup label="Binary (IEC - 1024^n)">
              <option value="KiB">KiB (Kibibytes)</option>
              <option value="MiB">MiB (Mebibytes)</option>
              <option value="GiB">GiB (Gibibytes)</option>
              <option value="TiB">TiB (Tebibytes)</option>
              <option value="PiB">PiB (Pebibytes)</option>
            </optgroup>
          </select>
        </div>
      </div>

      {/* Conversion output tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decimal table */}
        <div className="p-5 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-purple dark:text-brand-accentLight">
            Decimal Units (Base 10 - 1000)
          </h3>
          <div className="divide-y divide-light-border/40 dark:divide-dark-border/40 font-mono text-xs">
            {['KB', 'MB', 'GB', 'TB', 'PB'].map((u) => {
              const converted = totalBytes / unitMultipliers[u].bytes;
              return (
                <div key={u} className="py-2.5 flex items-center justify-between">
                  <span className="text-light-muted">{u}</span>
                  <span className="font-bold text-light-text dark:text-dark-text">
                    {converted >= 1e-4 ? converted.toLocaleString(undefined, { maximumFractionDigits: 4 }) : converted.toExponential(4)} {u}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Binary table */}
        <div className="p-5 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            Binary Units (Base 2 - 1024)
          </h3>
          <div className="divide-y divide-light-border/40 dark:divide-dark-border/40 font-mono text-xs">
            {['KiB', 'MiB', 'GiB', 'TiB', 'PiB'].map((u) => {
              const converted = totalBytes / unitMultipliers[u].bytes;
              return (
                <div key={u} className="py-2.5 flex items-center justify-between">
                  <span className="text-light-muted">{u}</span>
                  <span className="font-bold text-light-text dark:text-dark-text">
                    {converted >= 1e-4 ? converted.toLocaleString(undefined, { maximumFractionDigits: 4 }) : converted.toExponential(4)} {u}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
