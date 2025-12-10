import React, { useState } from 'react';
import { Plus, Trash2, Tag, Search } from 'lucide-react';
import * as apiService from '../services/apiService';

interface TopicManagerProps {
  topics: apiService.Topic[];
  onAddTopic: (query: string) => void;
  onRemoveTopic: (id: string) => void;
}

const TopicManager: React.FC<TopicManagerProps> = ({ topics, onAddTopic, onRemoveTopic }) => {
  const [newQuery, setNewQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuery.trim()) {
      onAddTopic(newQuery.trim());
      setNewQuery('');
    }
  };

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-6">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Your Radar</h1>
          <p className="text-gray-500 dark:text-gray-400">Define what the collector should look for.</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full text-indigo-600 dark:text-indigo-300 font-bold text-sm border border-indigo-100 dark:border-indigo-800 mb-2">
          {topics.length} Active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="e.g. 'Quantum Computing Breakthroughs'"
            className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium transition-shadow"
          />
          <button
            type="submit"
            disabled={!newQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 px-4">
          Try specific topics like "New papers on PINN" or "SpaceX launch updates".
        </p>
      </form>

      <div className="space-y-4">
        {topics.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
            <Tag size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">No topics defined yet.</p>
          </div>
        )}

        {topics.map((topic) => (
          <div 
            key={topic.id} 
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                {topic.icon}
              </div>
              <span className="font-bold text-gray-800 dark:text-gray-200 truncate">{topic.query}</span>
            </div>
            <button
              onClick={() => onRemoveTopic(topic.id)}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors"
              aria-label="Remove topic"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopicManager;