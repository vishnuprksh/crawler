import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter } from 'react-router-dom';
import Layout from './components/Layout';
import Feed from './components/Feed';
import TopicManager from './components/TopicManager';
import Archive from './components/Archive';
import ArticleModal from './components/ArticleModal';
import { AppState, TabView, Topic, ArticleCard } from './types';
import { loadState, saveState } from './services/storageService';
import { generateCardsForTopic } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [state, setState] = useState<AppState>(loadState());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ArticleCard | null>(null);

  // Persistence effect
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Daily Archive & Fetch Logic
  const checkAndFetchContent = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const lastFetch = state.lastFetchDate;

    // If day changed, archive current cards
    let currentArchived = [...state.archivedCards];
    let currentActive = [...state.activeCards];

    if (lastFetch !== today) {
      console.log("New day detected. Archiving old cards...");
      // Archive everything that was active
      const cardsToArchive = currentActive.map(c => ({ ...c, isArchived: true }));
      currentArchived = [...currentArchived, ...cardsToArchive];
      currentActive = []; // Clear active for new day
      
      // Update state immediately before fetch to show empty feed or loading
      setState(prev => ({
        ...prev,
        activeCards: currentActive,
        archivedCards: currentArchived,
        lastFetchDate: today // Set today as fetch date
      }));

      // If we have topics, fetch new content
      if (state.topics.length > 0) {
        setIsLoading(true);
        try {
          const newCards: ArticleCard[] = [];
          
          // Fetch for all topics concurrently
          const promises = state.topics.map(topic => 
            generateCardsForTopic(topic.id, topic.query)
              .catch(err => {
                console.error(`Error fetching for ${topic.query}`, err);
                return [];
              })
          );
          
          const results = await Promise.all(promises);
          results.forEach(topicCards => newCards.push(...topicCards));

          // Shuffle cards for a better feed experience
          const shuffledCards = newCards.sort(() => Math.random() - 0.5);

          setState(prev => ({
            ...prev,
            activeCards: shuffledCards,
          }));
        } catch (error) {
          console.error("Failed to fetch daily content", error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [state.lastFetchDate, state.topics, state.activeCards, state.archivedCards]);

  // Run check on mount
  useEffect(() => {
    checkAndFetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const handleAddTopic = async (query: string) => {
    const newTopic: Topic = {
      id: crypto.randomUUID(),
      query,
      createdAt: Date.now(),
    };
    
    // Add topic
    setState(prev => ({ ...prev, topics: [...prev.topics, newTopic] }));
    
    // Immediate fetch for this specific topic if we are already "today"
    // to give instant gratification
    setIsLoading(true);
    try {
      const newCards = await generateCardsForTopic(newTopic.id, newTopic.query);
      setState(prev => ({
        ...prev,
        activeCards: [...newCards, ...prev.activeCards] // Add new on top
      }));
      setActiveTab('feed');
    } catch (e) {
      console.error("Error fetching initial topic data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTopic = (id: string) => {
    setState(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t.id !== id),
      // Optionally remove active cards associated with this topic?
      // Let's keep them until the day ends.
    }));
  };

  const handleArchiveCard = (cardId: string) => {
    setState(prev => {
      const cardIndex = prev.activeCards.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;

      const card = prev.activeCards[cardIndex];
      const newActive = [...prev.activeCards];
      newActive.splice(cardIndex, 1);

      const newArchived = [{ ...card, isArchived: true }, ...prev.archivedCards];

      return {
        ...prev,
        activeCards: newActive,
        archivedCards: newArchived,
      };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <Feed cards={state.activeCards} isLoading={isLoading} onReadMore={setSelectedCard} onArchive={handleArchiveCard} />;
      case 'topics':
        return <TopicManager topics={state.topics} onAddTopic={handleAddTopic} onRemoveTopic={handleRemoveTopic} />;
      case 'archive':
        return <Archive cards={state.archivedCards} onReadMore={setSelectedCard} />;
      default:
        return null;
    }
  };

  return (
    <HashRouter>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderContent()}
      </Layout>
      <ArticleModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </HashRouter>
  );
};

export default App;