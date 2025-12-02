import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { X, ExternalLink } from 'lucide-react-native';
import { ArticleCard } from '../types';

interface ArticleModalProps {
  visible: boolean;
  card: ArticleCard | null;
  onClose: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({ visible, card, onClose }) => {
  if (!card) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: card.image_url || '' }} style={styles.image} contentFit="cover" />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.title}>{card.title}</Text>
            <Text style={styles.date}>{card.published_date || 'Just now'}</Text>
            
            <Text style={styles.summary}>{card.summary}</Text>
            
            {card.source_url && (
              <TouchableOpacity style={styles.sourceLink}>
                <Text style={styles.sourceText}>Read original source</Text>
                <ExternalLink size={16} color="#4f46e5" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 24,
  },
  sourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceText: {
    color: '#4f46e5',
    fontWeight: '600',
  },
});
