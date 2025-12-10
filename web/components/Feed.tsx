import React, { useState } from 'react';
import * as apiService from '../services/apiService';
import { Loader2, Sparkles, X, Archive } from 'lucide-react';

interface FeedProps {
  cards: apiService.Article[];
  isLoading: boolean;
  onReadMore: (card: apiService.Article) => void;
  onArchive: (cardId: string) => void;
  onDiscard: (cardId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ cards, isLoading, onReadMore, onArchive, onDiscard }) => {
  const activeCard = cards[0];
  const nextCard = cards[1];
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);

  const handleAction = (action: 'archive' | 'skip') => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setAnimationDirection(action === 'archive' ? 'right' : 'left');
    
    setTimeout(() => {
      if (action === 'archive') {
        onArchive(activeCard.id);
      } else {
        onDiscard(activeCard.id);
      }
      setIsAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-gray-400 dark:text-gray-500">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500 dark:text-indigo-400" />
        <p className="text-lg font-medium animate-pulse text-gray-600 dark:text-gray-300">Curating your feed...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Finding the best stories for you</p>
      </div>
    );
  }

  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-gray-500 dark:text-gray-400 px-6 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <Sparkles size={40} className="text-indigo-400 dark:text-indigo-300" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">You're all caught up!</h3>
        <p className="max-w-xs text-gray-500 dark:text-gray-400 mb-6">Check back later for new stories or add more topics to your feed.</p>
      </div>
    );
  }

  // Calculate rotation based on X offset
  const rotate = 0;
  const opacityRight = 0;
  const opacityLeft = 0;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] pb-safe overflow-hidden relative">
       {/* Header */}
      <div className="px-6 pt-4 shrink-0 flex justify-between items-center z-10 relative">
        <div>
           <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Crawler</h1>
           <p className="text-gray-500 dark:text-gray-400 text-sm">Discover stories curated just for you.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-sm border border-indigo-100 dark:border-indigo-800">
          {cards.length} left
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center relative w-full max-w-lg mx-auto p-4 perspective-1000">
        
        {/* Background Card (The one behind) */}
        {nextCard && (
          <div className="absolute inset-4 top-8 bottom-8 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 transform scale-95 translate-y-4 opacity-50 z-0 overflow-hidden transition-colors">
             <div className="h-2/3 bg-black" />
          </div>
        )}

        {/* Active Card */}
        <div 
          className="absolute inset-4 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 cursor-pointer overflow-hidden flex flex-col select-none transition-all duration-300"
          style={{
            transform: isAnimating 
              ? animationDirection === 'right' 
                ? 'translateX(1000px) rotate(20deg)' 
                : 'translateX(-1000px) rotate(-20deg)'
              : 'translateX(0) rotate(0)',
            opacity: isAnimating ? 0 : 1,
          }}
          onClick={() => !isAnimating && onReadMore(activeCard)}
        >

          {/* Image Area */}
          <div className="relative h-3/5 shrink-0 pointer-events-none">
            <div className="w-full h-full bg-black" />
            <div className="absolute top-4 left-4">
               <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-xs font-bold text-white rounded-full shadow-sm uppercase tracking-wider border border-white/20">
                {activeCard.topic_id || 'Topic'}
               </span>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white dark:from-gray-800 via-white/80 dark:via-gray-800/80 to-transparent" />
          </div>
          
          {/* Content Area */}
          <div className="px-6 pb-6 flex-1 flex flex-col justify-between pointer-events-none bg-white dark:bg-gray-800 transition-colors -mt-12 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight mb-3 line-clamp-3 drop-shadow-sm">
                {activeCard.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 line-clamp-4 text-sm leading-relaxed font-medium">
                {activeCard.summary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-6 px-6 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction('skip');
          }}
          disabled={isAnimating}
          className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-300 dark:border-gray-600 shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Skip"
        >
          <X size={32} className="text-gray-600 dark:text-gray-300 group-hover:text-red-500 transition-colors" strokeWidth={3} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAction('archive');
          }}
          disabled={isAnimating}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-4 border-white dark:border-gray-900"
          aria-label="Archive"
        >
          <Archive size={36} className="text-white" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default Feed;