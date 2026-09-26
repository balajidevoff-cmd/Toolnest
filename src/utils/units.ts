export type UnitType =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'time'
  | 'area'
  | 'volume'
  | 'speed'
  | 'storage';

// Base conversion rates (relative to standard base unit)
export const UNIT_DEFINITIONS: Record<
  UnitType,
  { baseUnit: string; units: Record<string, number | ((val: number, toBase: boolean) => number)> }
> = {
  length: {
    baseUnit: 'meters',
    units: {
      meters: 1,
      kilometers: 1000,
      centimeters: 0.01,
      millimeters: 0.001,
      miles: 1609.344,
      yards: 0.9144,
      feet: 0.3048,
      inches: 0.0254,
    },
  },
  mass: {
    baseUnit: 'kilograms',
    units: {
      kilograms: 1,
      grams: 0.001,
      milligrams: 0.000001,
      pounds: 0.45359237,
      ounces: 0.028349523,
      metric_tons: 1000,
    },
  },
  temperature: {
    baseUnit: 'celsius',
    units: {
      celsius: 1,
      fahrenheit: 1, // Custom function handled in convertUnits
      kelvin: 1,     // Custom function handled in convertUnits
    },
  },
  time: {
    baseUnit: 'seconds',
    units: {
      seconds: 1,
      minutes: 60,
      hours: 3600,
      days: 86400,
      weeks: 604800,
      years: 31536000,
    },
  },
  area: {
    baseUnit: 'square_meters',
    units: {
      square_meters: 1,
      square_kilometers: 1000000,
      square_feet: 0.092903,
      square_miles: 2589988.11,
      acres: 4046.856,
      hectares: 10000,
    },
  },
  volume: {
    baseUnit: 'liters',
    units: {
      liters: 1,
      milliliters: 0.001,
      cubic_meters: 1000,
      gallons_us: 3.78541,
      quarts_us: 0.946353,
      pints_us: 0.473176,
      cups_us: 0.24,
    },
  },
  speed: {
    baseUnit: 'm_per_s',
    units: {
      m_per_s: 1,
      km_per_h: 0.277778,
      miles_per_h: 0.44704,
      knots: 0.514444,
    },
  },
  storage: {
    baseUnit: 'bytes',
    units: {
      bytes: 1,
      kilobytes: 1000,
      megabytes: 1000000,
      gigabytes: 1000000000,
      terabytes: 1000000000000,
      kibibytes: 1024,
      mebibytes: 1048576,
      gibibytes: 1073741824,
      tebibytes: 1099511627776,
    },
  },
};

/**
 * Universal unit converter with dedicated temperature calculation logic.
 */
export function convertUnit(
  type: UnitType,
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  if (isNaN(value)) throw new Error('Value must be a valid number');
  if (fromUnit === toUnit) return value;

  // Temperature special cases
  if (type === 'temperature') {
    // Step 1: to Celsius
    let celsius = value;
    if (fromUnit === 'fahrenheit') {
      celsius = (value - 32) * (5 / 9);
    } else if (fromUnit === 'kelvin') {
      celsius = value - 273.15;
    }

    // Step 2: from Celsius to target
    if (toUnit === 'celsius') return parseFloat(celsius.toFixed(4));
    if (toUnit === 'fahrenheit') return parseFloat((celsius * (9 / 5) + 32).toFixed(4));
    if (toUnit === 'kelvin') return parseFloat((celsius + 273.15).toFixed(4));
    throw new Error(`Unknown temperature unit: ${toUnit}`);
  }

  const category = UNIT_DEFINITIONS[type];
  if (!category) throw new Error(`Unknown unit type: ${type}`);

  const fromFactor = category.units[fromUnit];
  const toFactor = category.units[toUnit];

  if (typeof fromFactor !== 'number' || typeof toFactor !== 'number') {
    throw new Error(`Invalid unit selection: ${fromUnit} -> ${toUnit}`);
  }

  // Convert to base, then to target
  const inBase = value * fromFactor;
  const inTarget = inBase / toFactor;

  // Format to clean precision
  return parseFloat(inTarget.toPrecision(8));
}
