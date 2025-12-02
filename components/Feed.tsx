import React from 'react';
import { ArticleCard } from '../types';
import { ArrowRight, Loader2, Sparkles, Archive } from 'lucide-react';

interface FeedProps {
  cards: ArticleCard[];
  isLoading: boolean;
  onReadMore: (card: ArticleCard) => void;
  onArchive: (cardId: string) => void;
}

const Feed: React.FC<FeedProps> = ({ cards, isLoading, onReadMore, onArchive }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
        <Loader2 size={48} className="animate-spin mb-4 text-indigo-500" />
        <p className="text-lg font-medium animate-pulse">Scouring the web for intel...</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500 px-6 text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Sparkles size={32} className="text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
        <p className="max-w-xs">You've cleared your feed or haven't added any topics yet. Head to the Topics tab to start collecting.</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6 max-w-xl mx-auto">
      <div className="px-4 pt-6">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Today's Brief</h1>
        <p className="text-gray-500 mt-1">Curated intelligence just for you.</p>
      </div>

      <div className="space-y-6 px-4">
        {cards.map((card) => (
          <div 
            key={card.id} 
            className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative h-56 overflow-hidden">
              <img 
                src={card.imageUrl} 
                alt={card.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-4 left-4">
                 <span className="px-3 py-1 bg-white/90 backdrop-blur text-xs font-bold text-indigo-600 rounded-full shadow-sm uppercase tracking-wider">
                  {card.topicQuery}
                 </span>
              </div>
              <div className="absolute top-4 right-4">
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     onArchive(card.id);
                   }}
                   className="p-2 bg-white/90 backdrop-blur text-gray-600 hover:text-indigo-600 rounded-full shadow-sm transition-colors hover:bg-indigo-50"
                   aria-label="Archive card"
                   title="Archive"
                 >
                   <Archive size={18} />
                 </button>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-extrabold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {card.title}
              </h2>
              <p className="text-gray-600 line-clamp-3 mb-6 text-sm leading-relaxed">
                {card.teaser}
              </p>
              
              <button 
                onClick={() => onReadMore(card)}
                className="w-full py-3 px-4 bg-gray-50 hover:bg-indigo-50 text-gray-900 hover:text-indigo-700 font-bold rounded-xl flex items-center justify-center transition-colors group-active:scale-95"
              >
                Read More
                <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;