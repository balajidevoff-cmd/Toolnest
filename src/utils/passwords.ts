/**
 * Cryptographically secure password and passphrase utilities using Web Crypto.
 */

export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous?: boolean;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = /[il1Lo0O]/g;

/**
 * Returns a cryptographically secure random integer in [0, max).
 * Rejects numbers outside uniform bounds to avoid modulo bias.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 0) return 0;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);

  const buffer = new Uint32Array(1);
  let rand: number;
  do {
    crypto.getRandomValues(buffer);
    rand = buffer[0];
  } while (rand >= limit);

  return rand % max;
}

export function generateSecurePassword(options: PasswordOptions): string {
  let upper = UPPERCASE_CHARS;
  let lower = LOWERCASE_CHARS;
  let num = NUMBER_CHARS;
  let sym = SYMBOL_CHARS;

  if (options.excludeAmbiguous) {
    upper = upper.replace(AMBIGUOUS_CHARS, '');
    lower = lower.replace(AMBIGUOUS_CHARS, '');
    num = num.replace(AMBIGUOUS_CHARS, '');
  }

  const pools: string[] = [];
  const requiredChars: string[] = [];

  if (options.uppercase && upper) {
    pools.push(upper);
    requiredChars.push(upper[getSecureRandomInt(upper.length)]);
  }
  if (options.lowercase && lower) {
    pools.push(lower);
    requiredChars.push(lower[getSecureRandomInt(lower.length)]);
  }
  if (options.numbers && num) {
    pools.push(num);
    requiredChars.push(num[getSecureRandomInt(num.length)]);
  }
  if (options.symbols && sym) {
    pools.push(sym);
    requiredChars.push(sym[getSecureRandomInt(sym.length)]);
  }

  if (pools.length === 0) {
    throw new Error('At least one character set must be selected');
  }

  const allChars = pools.join('');
  const passwordChars = [...requiredChars];

  // Fill remaining length
  while (passwordChars.length < options.length) {
    passwordChars.push(allChars[getSecureRandomInt(allChars.length)]);
  }

  // Fisher-Yates shuffle using cryptographically secure randomness
  for (let i = passwordChars.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = passwordChars[i];
    passwordChars[i] = passwordChars[j];
    passwordChars[j] = temp;
  }

  return passwordChars.join('');
}

// Bundled clean dictionary for passphrases
export const PASSPHRASE_WORDS = [
  'apple', 'anchor', 'beacon', 'breeze', 'bridge', 'candle', 'canyon', 'castle',
  'cedar', 'cloud', 'comet', 'coral', 'cradle', 'crystal', 'delta', 'dolphin',
  'drift', 'eagle', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil',
  'galaxy', 'garden', 'glacier', 'granite', 'harbor', 'haven', 'horizon', 'island',
  'jasper', 'jungle', 'lagoon', 'lantern', 'meadow', 'meteor', 'mountain', 'nebula',
  'oasis', 'ocean', 'orbit', 'pebble', 'phoenix', 'pioneer', 'planet', 'portal',
  'quartz', 'radiant', 'rainbow', 'ranger', 'reef', 'river', 'rocket', 'safari',
  'shadow', 'shield', 'signal', 'silver', 'solace', 'spark', 'summit', 'temple',
  'timber', 'topaz', 'torrent', 'tundra', 'valley', 'vessel', 'voyage', 'whisper',
  'willow', 'zenith', 'zephyr', 'acorn', 'alder', 'amber', 'badger', 'balsam',
  'basalt', 'birch', 'blizzard', 'boulder', 'cavern', 'chalet', 'cliff', 'clover',
  'copper', 'crater', 'creek', 'cypress', 'dune', 'elm', 'estuary', 'fir',
  'flint', 'frost', 'gale', 'geyser', 'grove', 'hawk', 'hemlock', 'hickory',
];

export function generatePassphrase(
  wordCount: number,
  separator: string,
  capitalize: boolean,
  includeNumber: boolean
): string {
  const chosenWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = getSecureRandomInt(PASSPHRASE_WORDS.length);
    let word = PASSPHRASE_WORDS[idx];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    chosenWords.push(word);
  }

  let phrase = chosenWords.join(separator);
  if (includeNumber) {
    const randomDigit = getSecureRandomInt(100);
    phrase += `${separator}${randomDigit}`;
  }
  return phrase;
}

/**
 * Local heuristic password strength calculator.
 */
export function estimatePasswordStrength(password: string): {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  entropyBits: number;
  suggestions: string[];
} {
  if (!password) {
    return { score: 0, label: 'Very Weak', entropyBits: 0, suggestions: ['Enter a password'] };
  }

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 33;

  const entropyBits = Math.round(password.length * Math.log2(Math.max(2, poolSize)));
  const suggestions: string[] = [];

  if (password.length < 12) suggestions.push('Increase length to at least 12-16 characters');
  if (!/[A-Z]/.test(password)) suggestions.push('Include uppercase characters');
  if (!/[a-z]/.test(password)) suggestions.push('Include lowercase characters');
  if (!/[0-9]/.test(password)) suggestions.push('Include numbers');
  if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Include special symbols');

  let score = 0;
  let label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Very Weak';

  if (entropyBits < 30) {
    score = 0;
    label = 'Very Weak';
  } else if (entropyBits < 50) {
    score = 1;
    label = 'Weak';
  } else if (entropyBits < 70) {
    score = 2;
    label = 'Medium';
  } else if (entropyBits < 90) {
    score = 3;
    label = 'Strong';
  } else {
    score = 4;
    label = 'Very Strong';
  }

  return { score, label, entropyBits, suggestions };
}
