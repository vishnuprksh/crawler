import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardStack } from '../../components/CardStack';
import { ArticleModal } from '../../components/ArticleModal';
import { apiService } from '../../services/apiService';
import { ArticleCard } from '../../types';

export default function FeedScreen() {
  const [cards, setCards] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ArticleCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFeed = async () => {
    try {
      const newArticles = await apiService.getFeed();
      setCards(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const uniqueNew = newArticles.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to load feed', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCards([]);
    setRefreshKey(prev => prev + 1);
    loadFeed().then(() => setRefreshing(false));
  }, []);

  const handleSwipe = async (card: ArticleCard) => {
    apiService.swipeArticle(card.id);
    // Fetch more to keep the buffer full locally
    loadFeed();
  };

  const handleSwipeLeft = (card: ArticleCard) => {
    handleSwipe(card);
  };

  const handleSwipeRight = async (card: ArticleCard) => {
    try {
      await apiService.archiveArticle(card.id);
      handleSwipe(card);
    } catch (error) {
      console.error('Failed to archive', error);
    }
  };

  const handleReadMore = (card: ArticleCard) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  if (loading && cards.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {cards.length > 0 ? (
        <CardStack
          key={refreshKey}
          cards={cards}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onReadMore={handleReadMore}
        />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text style={styles.emptyText}>No articles loaded.</Text>
          <Text style={styles.subText}>Pull down to refresh and load articles.</Text>
        </ScrollView>
      )}

      <ArticleModal
        visible={modalVisible}
        card={selectedCard}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
