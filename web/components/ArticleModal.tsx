import React from 'react';
import { X, ExternalLink, Calendar } from 'lucide-react';
import { ArticleCard } from '../types';

interface ArticleModalProps {
  card: ArticleCard | null;
  onClose: () => void;
}

const ArticleModal: React.FC<ArticleModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col transform transition-transform duration-300">
        
        {/* Header Image */}
        <div className="relative h-48 sm:h-64 shrink-0">
          <img 
            src={card.imageUrl} 
            alt={card.title} 
            className="w-full h-full object-cover"
          />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 pointer-events-none">
            <span className="inline-block px-2 py-1 mb-2 text-xs font-bold text-white bg-indigo-600 rounded uppercase tracking-wider">
              {card.topicQuery}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {card.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto">
          <div className="flex items-center text-gray-500 text-sm mb-6 space-x-4">
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {new Date(card.generatedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="prose prose-indigo max-w-none text-gray-800 leading-relaxed mb-8">
            <p className="font-semibold text-lg text-gray-900 mb-4">{card.teaser}</p>
            <div className="whitespace-pre-line">
              {card.content}
            </div>
          </div>

          {/* Sources Section */}
          {card.sources.length > 0 && (
            <div className="border-t border-gray-100 pt-6 mt-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                Sources & Grounding
              </h3>
              <ul className="space-y-2">
                {card.sources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={14} className="mr-2" />
                      <span className="truncate">{source.title || source.uri}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;