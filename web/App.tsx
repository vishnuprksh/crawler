import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './components/Feed';
import TopicManager from './components/TopicManager';
import Archive from './components/Archive';
import ArticleModal from './components/ArticleModal';
import Settings from './components/Settings';
import { TabView } from './types';
import * as apiService from './services/apiService';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';

const MainApp: React.FC = () => {
  const { isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [activeCards, setActiveCards] = useState<apiService.Article[]>([]);
  const [archivedCards, setArchivedCards] = useState<apiService.Article[]>([]);
  const [topics, setTopics] = useState<apiService.Topic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<apiService.Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        setError(null);
        
        const [topics, feed, archive] = await Promise.all([
          apiService.getTopics(),
          apiService.getFeed(),
          apiService.getArchive(),
        ]);
        
        setTopics(topics);
        setActiveCards(feed);
        setArchivedCards(archive);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <Login />;
  }

  // Show loading screen until all initial data is loaded
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your content...</p>
        </div>
      </div>
    );
  }

  const handleAddTopic = async (query: string) => {
    try {
      setError(null);
      const newTopic = await apiService.createTopic(query, '🔍');
      setTopics(prev => [...prev, newTopic]);
      setActiveTab('feed');

      // Generate article for new topic
      setIsLoading(true);
      await apiService.generateArticle(newTopic.id);
      
      // Refresh feed
      const feed = await apiService.getFeed();
      setActiveCards(feed);
    } catch (error) {
      console.error('Error adding topic:', error);
      setError('Failed to add topic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTopic = async (id: string) => {
    try {
      setError(null);
      await apiService.removeTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error removing topic:', error);
      setError('Failed to remove topic.');
    }
  };

  // Archive (Swipe Right)
  const handleArchiveCard = async (cardId: string) => {
    try {
      await apiService.archiveArticle(cardId);
      setActiveCards(prev => {
        const card = prev.find(c => c.id === cardId);
        if (!card) return prev;
        setArchivedCards(archived => [{ ...card, is_archived: true }, ...archived]);
        return prev.filter(c => c.id !== cardId);
      });
    } catch (error) {
      console.error('Error archiving article:', error);
      setError('Failed to archive article.');
    }
  };

  // Discard (Swipe Left)
  const handleDiscardCard = async (cardId: string) => {
    try {
      await apiService.markArticleAsConsumed(cardId);
      setActiveCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error marking article as consumed:', error);
      setError('Failed to discard article.');
    }
  };

  // Delete from Archive
  const handleDeleteFromArchive = async (cardId: string) => {
    try {
      await apiService.deleteArticle(cardId);
      setArchivedCards(prev => prev.filter(c => c.id !== cardId));
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Failed to delete article.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <Feed 
            cards={activeCards} 
            isLoading={isLoading} 
            onReadMore={setSelectedCard} 
            onArchive={handleArchiveCard} 
            onDiscard={handleDiscardCard}
          />
        );
      case 'topics':
        return <TopicManager topics={topics} onAddTopic={handleAddTopic} onRemoveTopic={handleRemoveTopic} />;
      case 'archive':
        return <Archive cards={archivedCards} onReadMore={setSelectedCard} onDelete={handleDeleteFromArchive} />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <HashRouter>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        error={error}
        onErrorDismiss={() => setError(null)}
      >
        {renderContent()}
      </Layout>
      <ArticleModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;