import React, { useState } from 'react';
import { UNIT_DEFINITIONS, UnitType, convertUnit } from '../../../utils/units';
import { ArrowRightLeft } from 'lucide-react';

export const UnitConverterTool: React.FC = () => {
  const [unitType, setUnitType] = useState<UnitType>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('kilometers');
  const [toUnit, setToUnit] = useState<string>('miles');

  const unitOptions = Object.keys(UNIT_DEFINITIONS[unitType].units);

  const handleTypeChange = (newType: UnitType) => {
    setUnitType(newType);
    const keys = Object.keys(UNIT_DEFINITIONS[newType].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] || keys[0]);
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  let convertedValue = 0;
  let hasError = false;
  try {
    convertedValue = convertUnit(unitType, inputValue, fromUnit, toUnit);
  } catch {
    hasError = true;
  }

  const formatUnitLabel = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Unit Categories Tabs */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(UNIT_DEFINITIONS) as UnitType[]).map((type) => (
          <button
            key={type}
            onClick={() => handleTypeChange(type)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize border transition-all ${
              unitType === type
                ? 'bg-brand-purple text-white border-brand-purple shadow-sm'
                : 'border-light-border dark:border-dark-border text-light-muted hover:text-light-text'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Main Conversion Card */}
      <div className="p-6 rounded-2xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
          {/* From column */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              From
            </label>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-sm font-mono text-light-text dark:text-dark-text focus:outline-none"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {formatUnitLabel(u)}
                </option>
              ))}
            </select>
          </div>

          {/* Swap icon */}
          <div className="flex justify-center sm:col-span-1 pt-6">
            <button
              onClick={swapUnits}
              className="p-3 rounded-xl border border-light-border dark:border-dark-border hover:bg-black/5 dark:hover:bg-white/5 text-brand-purple transition-colors"
              title="Swap units"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To column */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-semibold uppercase text-light-muted dark:text-dark-muted">
              To
            </label>
            <div className="w-full px-3.5 py-2.5 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-sm font-mono font-bold text-brand-purple dark:text-brand-accentLight truncate">
              {hasError ? 'Error' : convertedValue}
            </div>
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-light-border dark:border-dark-border text-xs text-light-text dark:text-dark-text focus:outline-none cursor-pointer"
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {formatUnitLabel(u)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Formula / Result summary sentence */}
        <div className="p-3.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] text-xs text-light-muted dark:text-dark-muted text-center font-medium">
          {inputValue} {formatUnitLabel(fromUnit)} ={' '}
          <strong className="text-light-text dark:text-dark-text">{hasError ? 'Error' : convertedValue}</strong>{' '}
          {formatUnitLabel(toUnit)}
        </div>
      </div>
    </div>
  );
};
