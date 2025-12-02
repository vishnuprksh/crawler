import React from 'react';
import { ArticleCard } from '../types';
import { Archive as ArchiveIcon, Clock } from 'lucide-react';

interface ArchiveProps {
  cards: ArticleCard[];
  onReadMore: (card: ArticleCard) => void;
}

const Archive: React.FC<ArchiveProps> = ({ cards, onReadMore }) => {
  // Sort by date desc
  const sortedCards = [...cards].sort((a, b) => b.generatedAt - a.generatedAt);

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Archive</h1>
        <p className="text-gray-500">History of your collected intelligence.</p>
      </div>

      {sortedCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
          <ArchiveIcon size={48} className="mb-4 opacity-50" />
          <p className="font-medium">No archived items yet.</p>
          <p className="text-sm mt-1">Cards are archived automatically at the end of the day.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedCards.map((card) => (
            <div 
              key={card.id} 
              onClick={() => onReadMore(card)}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <img 
                src={card.imageUrl} 
                alt={card.title} 
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                   <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {card.topicQuery}
                   </span>
                   <span className="flex items-center text-xs text-gray-400">
                     <Clock size={10} className="mr-1" />
                     {new Date(card.generatedAt).toLocaleDateString()}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default Archive;