import React from 'react';
import { Home, List, Archive as ArchiveIcon } from 'lucide-react';
import { TabView } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabView;
  onTabChange: (tab: TabView) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="w-full">
        {children}
      </main>

      {/* Sticky Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe pt-2 z-40">
        <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-2">
          <button
            onClick={() => onTabChange('feed')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'feed' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Home size={24} strokeWidth={activeTab === 'feed' ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">Feed</span>
          </button>

          <button
            onClick={() => onTabChange('topics')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'topics' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List size={24} strokeWidth={activeTab === 'topics' ? 2.5 : 2} />
            <span className="text-[10px] font-bold tracking-wide">Topics</span>
          </button>

          <button
            onClick={() => onTabChange('archive')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
              activeTab === 'archive' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
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