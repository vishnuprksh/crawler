import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardStack } from '../../components/CardStack';
import { ArticleModal } from '../../components/ArticleModal';
import { apiService } from '../../services/apiService';
import { cacheService } from '../../services/cacheService';
import { ArticleCard } from '../../types';

export default function FeedScreen() {
  const [cards, setCards] = useState<ArticleCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ArticleCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFeed = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cached = await cacheService.getFeed();
        if (cached) {
          setCards(cached);
          setLoading(false);
          return;
        }
      }

      const data = await apiService.getFeed();
      const shuffled = data.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      await cacheService.setFeed(shuffled);
    } catch (error) {
      console.error('Failed to load feed', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    cacheService.invalidateFeed().then(() => loadFeed(true));
  }, []);

  const handleSwipeLeft = (card: ArticleCard) => {
    setCards(prev => prev.filter(c => c.id !== card.id));
  };

  const handleSwipeRight = async (card: ArticleCard) => {
    try {
      await apiService.archiveArticle(card.id);
      setCards(prev => prev.filter(c => c.id !== card.id));
    } catch (error) {
      console.error('Failed to archive', error);
    }
  };

  const handleReadMore = (card: ArticleCard) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  if (loading) {
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
          <Text style={styles.emptyText}>No new articles for today.</Text>
          <Text style={styles.subText}>Check back later or add more topics!</Text>
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
