import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { CategoryPage } from './pages/CategoryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { RecentPage } from './pages/RecentPage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { ScrollToTop } from './components/common/ScrollToTop';

// Lazy Loaded Pages for Performance & Optimal Chunking
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage'));
const ToolWorkspacePage = lazy(() => import('./pages/ToolWorkspacePage').then(m => ({ default: m.ToolWorkspacePage })));

const RouteLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tools" element={<ToolsPage />} />
              <Route path="tools/:slug" element={<ToolWorkspacePage />} />
              <Route path="categories/:slug" element={<CategoryPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="recent" element={<RecentPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="architecture" element={<ArchitecturePage />} />
              <Route path="not-found" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/not-found" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
