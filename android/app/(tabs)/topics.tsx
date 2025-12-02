import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trash2, Plus } from 'lucide-react-native';
import { apiService } from '../../services/apiService';
import { Topic } from '../../types';

export default function TopicsScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await apiService.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Failed to load topics', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic.trim()) return;
    setAdding(true);
    try {
      const topic = await apiService.createTopic(newTopic);
      setTopics([...topics, topic]);
      setNewTopic('');
      
      Alert.alert('Topic Added', 'Generating articles for this topic...');
      await apiService.generateArticle(topic.id);
      Alert.alert('Success', 'Articles generated! Check your feed.');
    } catch (error) {
      Alert.alert('Error', 'Failed to add topic');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    try {
      await apiService.deleteTopic(id);
      setTopics(topics.filter(t => t.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete topic');
    }
  };

  const renderItem = ({ item }: { item: Topic }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>{item.icon} {item.query}</Text>
      <TouchableOpacity onPress={() => handleDeleteTopic(item.id)}>
        <Trash2 size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a topic (e.g. 'Quantum Computing')"
          value={newTopic}
          onChangeText={setNewTopic}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddTopic} disabled={adding}>
          {adding ? <ActivityIndicator color="#fff" /> : <Plus size={24} color="#fff" />}
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={topics}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No topics yet. Add one above!</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addButton: {
    backgroundColor: '#4f46e5',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  list: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
  },
});
