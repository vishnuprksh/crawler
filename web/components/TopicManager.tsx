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
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Your Radar</h1>
        <p className="text-gray-500">Define what the collector should look for.</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="e.g. 'Quantum Computing Breakthroughs'"
            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-400 font-medium transition-shadow"
          />
          <button
            type="submit"
            disabled={!newQuery.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-400 px-4">
          Try specific topics like "New papers on PINN" or "SpaceX launch updates".
        </p>
      </form>

      <div className="space-y-4">
        {topics.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl">
            <Tag size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No topics defined yet.</p>
          </div>
        )}

        {topics.map((topic) => (
          <div 
            key={topic.id} 
            className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 group hover:border-indigo-100 transition-colors"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                {topic.icon}
              </div>
              <span className="font-bold text-gray-800 truncate">{topic.query}</span>
            </div>
            <button
              onClick={() => onRemoveTopic(topic.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
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