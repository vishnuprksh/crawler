import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './components/Feed';
import TopicManager from './components/TopicManager';
import Archive from './components/Archive';
import ArticleModal from './components/ArticleModal';
import { TabView } from './types';
import * as apiService from './services/apiService';
import { ThemeProvider } from './context/ThemeContext';

interface AppState {
  activeCards: apiService.Article[];
  archivedCards: apiService.Article[];
  topics: apiService.Topic[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [state, setState] = useState<AppState>({
    activeCards: [],
    archivedCards: [],
    topics: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<apiService.Article | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [topics, feed, archive] = await Promise.all([
          apiService.getTopics(),
          apiService.getFeed(),
          apiService.getArchive(),
        ]);
        setState({
          topics,
          activeCards: feed,
          archivedCards: archive,
        });
      } catch (error) {
        console.error('Failed to load data:', error);
        setError('Failed to load content. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddTopic = async (query: string) => {
    try {
      setError(null);
      const newTopic = await apiService.createTopic(query, '🔍');
      setState(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic],
      }));
      setActiveTab('feed');

      // Generate article for new topic
      setIsLoading(true);
      await apiService.generateArticle(newTopic.id);
      
      // Refresh feed
      const feed = await apiService.getFeed();
      setState(prev => ({
        ...prev,
        activeCards: feed,
      }));
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
      setState(prev => ({
        ...prev,
        topics: prev.topics.filter(t => t.id !== id),
      }));
    } catch (error) {
      console.error('Error removing topic:', error);
      setError('Failed to remove topic.');
    }
  };

  // Archive (Swipe Right)
  const handleArchiveCard = async (cardId: string) => {
    try {
      await apiService.archiveArticle(cardId);
      setState(prev => {
        const card = prev.activeCards.find(c => c.id === cardId);
        if (!card) return prev;
        return {
          ...prev,
          activeCards: prev.activeCards.filter(c => c.id !== cardId),
          archivedCards: [{ ...card, is_archived: true }, ...prev.archivedCards],
        };
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
      setState(prev => ({
        ...prev,
        activeCards: prev.activeCards.filter(c => c.id !== cardId),
      }));
    } catch (error) {
      console.error('Error marking article as consumed:', error);
      setError('Failed to discard article.');
    }
  };

  // Delete from Archive
  const handleDeleteFromArchive = async (cardId: string) => {
    try {
      await apiService.deleteArticle(cardId);
      setState(prev => ({
        ...prev,
        archivedCards: prev.archivedCards.filter(c => c.id !== cardId),
      }));
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
            cards={state.activeCards} 
            isLoading={isLoading} 
            onReadMore={setSelectedCard} 
            onArchive={handleArchiveCard} 
            onDiscard={handleDiscardCard}
          />
        );
      case 'topics':
        return <TopicManager topics={state.topics} onAddTopic={handleAddTopic} onRemoveTopic={handleRemoveTopic} />;
      case 'archive':
        return <Archive cards={state.archivedCards} onReadMore={setSelectedCard} onDelete={handleDeleteFromArchive} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
};

export default App;