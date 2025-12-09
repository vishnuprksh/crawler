import React, { useState, useRef } from 'react';
import * as apiService from '../services/apiService';
import { Archive as ArchiveIcon, Clock, Trash2 } from 'lucide-react';

interface ArchiveProps {
  cards: apiService.Article[];
  onReadMore: (card: apiService.Article) => void;
  onDelete: (cardId: string) => void;
}

const ArchiveItem: React.FC<{ 
  card: apiService.Article; 
  onReadMore: () => void; 
  onDelete: () => void; 
}> = ({ card, onReadMore, onDelete }) => {
  const [dragX, setDragX] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // Re-implementing simplified swipe logic
  const [startX, setStartX] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startX === null) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Only allow dragging left (negative diff)
    if (diff < 0) {
       setDragX(diff);
    }
  };

  const onTouchEnd = () => {
    if (dragX < -100) {
      // Trigger delete
      setIsDeleting(true);
      setDragX(-1000); // Animate off
      setTimeout(() => onDelete(), 300);
    } else {
      // Snap back
      setDragX(0);
    }
    setStartX(null);
  };

  if (isDeleting) return null; // Or keep rendering with class to animate height to 0

  return (
    <div className="relative overflow-hidden rounded-2xl mb-4 touch-pan-y select-none group">
      {/* Background (Delete Action) */}
      <div className="absolute inset-0 bg-red-500 flex items-center justify-end px-6 rounded-2xl">
        <Trash2 className="text-white" size={24} />
      </div>

      {/* Foreground Content */}
      <div 
        className="relative bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 transition-transform duration-200 ease-out active:cursor-grabbing"
        style={{ transform: `translateX(${dragX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => {
            if (dragX === 0) onReadMore();
        }}
      >
        <img 
          src={card.image_url} 
          alt={card.title} 
          className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-200 pointer-events-none"
        />
        <div className="flex-1 min-w-0 pointer-events-none">
          <div className="flex items-center justify-between mb-1">
             <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
              {card.topic_id}
             </span>
             <span className="flex items-center text-xs text-gray-400">
               <Clock size={10} className="mr-1" />
               {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
             </span>
          </div>
          <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug mb-1">
            {card.title}
          </h3>
          <p className="text-xs text-gray-500 line-clamp-1">
            {card.teaser}
          </p>
        </div>
      </div>
    </div>
  );
};

const Archive: React.FC<ArchiveProps> = ({ cards, onReadMore, onDelete }) => {
  // Sort by date desc
  const sortedCards = [...cards].sort((a, b) => b.generatedAt - a.generatedAt);

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Archive</h1>
        <p className="text-gray-500">Swipe left to delete permanently.</p>
      </div>

      {sortedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
          <ArchiveIcon size={48} className="mb-4 opacity-50" />
          <p className="font-medium">No archived items.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {sortedCards.map((card) => (
            <ArchiveItem 
              key={card.id} 
              card={card} 
              onReadMore={() => onReadMore(card)} 
              onDelete={() => onDelete(card.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;