import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '../common/ToastContainer';
import { SearchModal } from '../common/SearchModal';
import { FloatingDock } from './FloatingDock';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors relative selection:bg-purple-600 selection:text-white">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-28">
        <Outlet />
      </main>
      <Footer />
      <FloatingDock />
      <ToastContainer />
      <SearchModal />
    </div>
  );
};

