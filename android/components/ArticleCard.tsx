import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArticleCard as ArticleCardType } from '../types';
import { ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface ArticleCardProps {
  card: ArticleCardType;
  onReadMore: () => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ card, onReadMore }) => {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: card.image_url || 'https://picsum.photos/400/600' }}
          style={styles.image}
          contentFit="cover"
          transition={200}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.topic}>{card.topic_id}</Text> 
        <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
        <Text style={styles.summary} numberOfLines={3}>{card.summary}</Text>
        
        <TouchableOpacity style={styles.button} onPress={onReadMore}>
          <Text style={styles.buttonText}>Read More</Text>
          <ArrowRight size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    height: '50%',
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    height: '50%',
    padding: 20,
    gap: 8,
    backgroundColor: '#fff',
  },
  topic: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    color: '#1f2937',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  summary: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 'auto',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
