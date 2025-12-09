import React from 'react';
import { Home, List, Archive as ArchiveIcon, Moon, Sun, XCircle } from 'lucide-react';
import { TabView } from '../types';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
  error?: string | null;
  onErrorDismiss?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, error, onErrorDismiss }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 absolute top-0 left-0 right-0 z-50 flex justify-between items-start animate-in slide-in-from-top">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={onErrorDismiss}
                className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 focus:outline-none"
              >
                <span className="sr-only">Dismiss</span>
                <XCircle className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Toggle - Absolute Top Right */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-40 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto no-scrollbar relative">
        {children}
      </main>

      {/* Sticky Bottom Navigation */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe z-40 shrink-0 transition-colors duration-200">
        <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-2">
          <button
            onClick={() => onTabChange('feed')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'feed' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Home size={24} strokeWidth={activeTab === 'feed' ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">Feed</span>
          </button>

          <button
            onClick={() => onTabChange('topics')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'topics' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List size={24} strokeWidth={activeTab === 'topics' ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">Topics</span>
          </button>

          <button
            onClick={() => onTabChange('archive')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'archive' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <ArchiveIcon size={24} strokeWidth={activeTab === 'archive' ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">Archive</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layout;