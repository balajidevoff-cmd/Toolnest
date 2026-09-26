// Safe LocalStorage wrapper with in-memory fallback

const memoryStorage = new Map<string, string>();

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // localStorage unavailable or restricted
    }
    return memoryStorage.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // localStorage quota exceeded or restricted
    }
    memoryStorage.set(key, value);
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // ignore
    }
    memoryStorage.delete(key);
  },
};

const FAVORITES_KEY = 'toolsnest_favorites';
const RECENT_KEY = 'toolsnest_recent_tools';
const THEME_KEY = 'toolsnest_theme';

export function getStoredFavorites(): string[] {
  try {
    const raw = safeStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function saveStoredFavorites(favorites: string[]): void {
  safeStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function getStoredRecentTools(): string[] {
  try {
    const raw = safeStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function addStoredRecentTool(toolId: string): string[] {
  const current = getStoredRecentTools().filter((id) => id !== toolId);
  const updated = [toolId, ...current].slice(0, 20); // max 20 unique recent
  safeStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}

export function clearStoredRecentTools(): void {
  safeStorage.removeItem(RECENT_KEY);
}

export function getStoredTheme(): 'dark' | 'light' {
  const raw = safeStorage.getItem(THEME_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark'; // Default to sleek dark SaaS mode
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  safeStorage.setItem(THEME_KEY, theme);
}
