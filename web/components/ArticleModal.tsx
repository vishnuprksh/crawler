import React from 'react';
import { X, ExternalLink, Calendar } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import * as apiService from '../services/apiService';

interface ArticleModalProps {
  card: apiService.Article | null;
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
      <div className="relative w-full max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white dark:bg-gray-900 sm:rounded-2xl lg:rounded-3xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col transform transition-transform duration-300">
        
        {/* Header Image */}
        <div className="relative h-48 sm:h-64 lg:h-80 shrink-0">
          <div className="w-full h-full bg-black" />
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
              {card.topic_id || 'Topic'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {card.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto bg-white dark:bg-gray-900 transition-colors">
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-6 space-x-4">
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />
              {card.created_at ? new Date(card.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="space-y-4 text-gray-800 dark:text-gray-200 leading-relaxed mb-8">
            <p className="font-semibold text-lg text-gray-900 dark:text-white mb-4">{card.summary}</p>
            <div className="prose prose-indigo dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  a: ({node, ...props}) => (
                    <a {...props} className="text-indigo-600 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer" />
                  ),
                  h1: ({node, ...props}) => <h1 {...props} className="text-3xl font-bold mt-6 mb-3 text-gray-900 dark:text-white" />,
                  h2: ({node, ...props}) => <h2 {...props} className="text-2xl font-bold mt-5 mb-2 text-gray-900 dark:text-white" />,
                  h3: ({node, ...props}) => <h3 {...props} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-white" />,
                  p: ({node, ...props}) => <p {...props} className="mb-4 text-gray-800 dark:text-gray-300" />,
                  li: ({node, ...props}) => <li {...props} className="ml-4 list-disc text-gray-800 dark:text-gray-300" />,
                }}
              >
                {card.content || ''}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sources Section */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-6 mt-6">
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Sources & References
            </h3>
            <ul className="space-y-2">
              {card.source_url && (
                 <li>
                    <a 
                      href={card.source_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
                    >
                      <ExternalLink size={14} className="mr-2" />
                      <span className="truncate">Original Source</span>
                    </a>
                  </li>
              )}
              {card.citations && card.citations.map((citation, idx) => (
                <li key={idx}>
                  <a 
                    href={citation} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    <ExternalLink size={14} className="mr-2" />
                    <span className="truncate">{citation}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleModal;