import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { X } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
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
            
            <Markdown style={markdownStyles}>{card.content || card.summary}</Markdown>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 20,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 14,
    marginBottom: 8,
  },
  paragraph: {
    marginBottom: 12,
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  link: {
    color: '#4f46e5',
    textDecorationLine: 'underline',
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  list_item: {
    marginBottom: 6,
  },
  code_inline: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  blockquote: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 4,
    borderLeftColor: '#d1d5db',
    paddingLeft: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
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
});
