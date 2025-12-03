import React, { useState, useRef, useEffect } from 'react';
import { ArticleCard } from '../types';
import { Loader2, Sparkles, Info } from 'lucide-react';

interface FeedProps {
  cards: ArticleCard[];
  isLoading: boolean;
  onReadMore: (card: ArticleCard) => void;
  onArchive: (cardId: string) => void;
  onDiscard: (cardId: string) => void;
}

const SWIPE_THRESHOLD = 100;

const Feed: React.FC<FeedProps> = ({ cards, isLoading, onReadMore, onArchive, onDiscard }) => {
  // We only really care about the top card (index 0) and the one behind it (index 1)
  // because the parent removes the card from the array when we call onArchive/onDiscard.
  const activeCard = cards[0];
  const nextCard = cards[1];

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset state when active card changes
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
    setIsAnimating(false);
    setDragStart(null);
  }, [activeCard]);

  const handleStart = (clientX: number, clientY: number) => {
    if (isAnimating) return;
    setDragStart({ x: clientX, y: clientY });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!dragStart || isAnimating) return;
    const offsetX = clientX - dragStart.x;
    const offsetY = clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleEnd = () => {
    if (!dragStart || isAnimating) return;

    if (Math.abs(dragOffset.x) > SWIPE_THRESHOLD) {
      // Swipe Triggered
      const direction = dragOffset.x > 0 ? 'right' : 'left';
      completeSwipe(direction);
    } else {
      // Reset (Snap back)
      setDragOffset({ x: 0, y: 0 });
      // Check for click (minimal movement)
      if (Math.abs(dragOffset.x) < 5 && Math.abs(dragOffset.y) < 5) {
        onReadMore(activeCard);
      }
    }
    setDragStart(null);
  };

  const completeSwipe = (direction: 'left' | 'right') => {
    setIsAnimating(true);
    // Animate off screen
    const endX = direction === 'right' ? 1000 : -1000;
    setDragOffset({ x: endX, y: dragOffset.y });

    // Wait for animation to finish then trigger action
    setTimeout(() => {
      if (direction === 'right') {
        onArchive(activeCard.id);
      } else {
        onDiscard(activeCard.id);
      }
      // State reset happens in useEffect when prop changes
    }, 300);
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart) handleMove(e.clientX, e.clientY);
  };
  const onMouseUp = () => handleEnd();
  const onMouseLeave = () => {
    if (dragStart) handleEnd();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-gray-400">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-lg font-medium animate-pulse">Scouring the web...</p>
      </div>
    );
  }

  if (!activeCard) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-gray-500 px-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Sparkles size={40} className="text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">You're all caught up!</h3>
        <p className="max-w-xs text-gray-500">Check back later for new stories or add more topics.</p>
      </div>
    );
  }

  // Calculate rotation based on X offset
  const rotate = dragOffset.x * 0.05;
  const opacityRight = Math.min(Math.max(dragOffset.x / (SWIPE_THRESHOLD * 1.5), 0), 1);
  const opacityLeft = Math.min(Math.max(-dragOffset.x / (SWIPE_THRESHOLD * 1.5), 0), 1);

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] pb-safe overflow-hidden relative">
       {/* Header */}
      <div className="px-6 pt-4 shrink-0 flex justify-between items-center z-10 relative">
        <div>
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Crawler</h1>
           <p className="text-gray-500 text-sm">Swipe right to archive, left to discard.</p>
        </div>
        <div className="bg-indigo-50 px-3 py-1 rounded-full text-indigo-600 font-bold text-sm">
          {cards.length} left
        </div>
      </div>

      {/* Card Container */}
      <div className="flex-1 flex items-center justify-center relative w-full max-w-lg mx-auto p-4 perspective-1000">
        
        {/* Background Card (The one behind) */}
        {nextCard && (
          <div className="absolute inset-4 top-8 bottom-8 bg-white rounded-3xl shadow-sm border border-gray-100 transform scale-95 translate-y-4 opacity-50 z-0 overflow-hidden">
             <div className="h-2/3 bg-gray-200" />
          </div>
        )}

        {/* Active Card */}
        <div 
          ref={cardRef}
          className="absolute inset-4 bg-white rounded-3xl shadow-xl border border-gray-100 z-20 cursor-grab active:cursor-grabbing overflow-hidden flex flex-col touch-none select-none transition-transform duration-75"
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotate}deg)`,
            transition: isAnimating ? 'transform 0.3s ease-in-out' : 'none',
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {/* Swipe Indicators Overlay */}
          <div 
            className="absolute top-8 left-8 border-4 border-green-500 rounded-lg p-2 px-4 z-50 transform -rotate-12 pointer-events-none transition-opacity"
            style={{ opacity: opacityRight }}
          >
            <span className="text-2xl font-black text-green-500 uppercase tracking-widest">Archive</span>
          </div>
          
          <div 
            className="absolute top-8 right-8 border-4 border-red-500 rounded-lg p-2 px-4 z-50 transform rotate-12 pointer-events-none transition-opacity"
            style={{ opacity: opacityLeft }}
          >
            <span className="text-2xl font-black text-red-500 uppercase tracking-widest">Discard</span>
          </div>

          {/* Image Area */}
          <div className="relative h-1/2 shrink-0 pointer-events-none">
            <img 
              src={activeCard.imageUrl} 
              alt={activeCard.title} 
              className="w-full h-full object-cover"
              draggable={false}
            />
            <div className="absolute top-4 left-4">
               <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold text-indigo-600 rounded-full shadow-sm uppercase tracking-wider">
                {activeCard.topicQuery}
               </span>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="p-6 flex-1 flex flex-col justify-between pointer-events-none bg-white">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-2 line-clamp-3">
                {activeCard.title}
              </h2>
              <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
                {activeCard.teaser}
              </p>
            </div>
            
            <div className="flex items-center text-indigo-600 font-bold text-sm mt-4">
              <Info size={16} className="mr-1" />
              Tap to read full story
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;