import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { apiService } from '../../services/apiService';
import { ArticleCard } from '../../types';
import { ArticleModal } from '../../components/ArticleModal';

export default function ArchiveScreen() {
  const [articles, setArticles] = useState<ArticleCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<ArticleCard | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadArchive = async () => {
      try {
        const data = await apiService.getArchive();
        setArticles(data);
      } catch (error) {
        console.error('Failed to load archive', error);
      }
    };
    loadArchive();
  }, []);

  const handleDelete = async (articleId: string) => {
    try {
      await apiService.deleteArticle(articleId);
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch (error) {
      console.error('Failed to delete article', error);
    }
  };

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteAction}>
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>🗑️</Animated.Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: ArticleCard }) => (
    <Swipeable
      renderLeftActions={renderLeftActions}
      onSwipeableOpen={() => handleDelete(item.id)}
      overshootLeft={false}
    >
      <TouchableOpacity 
        style={styles.item} 
        onPress={() => {
          setSelectedCard(item);
          setModalVisible(true);
        }}
      >
        <Image source={{ uri: item.image_url || 'https://picsum.photos/100' }} style={styles.thumbnail} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.date}>{item.published_date || 'Unknown date'}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={articles}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />
      
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
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9ca3af',
  },
  deleteAction: {
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
  },
  deleteText: {
    fontSize: 32,
  },
});
