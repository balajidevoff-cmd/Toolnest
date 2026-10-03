import React, { createContext, useContext, useEffect, useState } from 'react';
import { ToastMessage } from '../types';
import {
  addStoredRecentTool,
  clearStoredRecentTools,
  getStoredFavorites,
  getStoredRecentTools,
  getStoredTheme,
  saveStoredFavorites,
  saveStoredTheme,
} from '../utils/storage';

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  recentTools: string[];
  addRecent: (toolId: string) => void;
  clearRecent: () => void;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const applyThemeToDom = (t: 'dark' | 'light') => {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', t);
    document.documentElement.style.colorScheme = t;
  };

  // Initialize from storage on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
    applyThemeToDom(storedTheme);

    setFavorites(getStoredFavorites());
    setRecentTools(getStoredRecentTools());
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveStoredTheme(nextTheme);
    applyThemeToDom(nextTheme);
  };

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(toolId);
      const updated = exists ? prev.filter((id) => id !== toolId) : [...prev, toolId];
      saveStoredFavorites(updated);
      addToast({
        type: exists ? 'info' : 'success',
        message: exists ? 'Removed from favorites' : 'Saved to favorites',
        duration: 2500,
      });
      return updated;
    });
  };

  const isFavorite = (toolId: string) => favorites.includes(toolId);

  const addRecent = (toolId: string) => {
    const updated = addStoredRecentTool(toolId);
    setRecentTools(updated);
  };

  const clearRecent = () => {
    clearStoredRecentTools();
    setRecentTools([]);
    addToast({
      type: 'info',
      message: 'Recent tool history cleared',
      duration: 2500,
    });
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 3000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        favorites,
        toggleFavorite,
        isFavorite,
        recentTools,
        addRecent,
        clearRecent,
        searchModalOpen,
        setSearchModalOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
