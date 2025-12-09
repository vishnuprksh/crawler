import axios from 'axios';

// API service for backend communication
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';

// Log the API base URL for debugging
console.log('[API Service] Using backend URL:', API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Article {
  id: string;
  topic_id?: string;
  title: string;
  summary: string;
  content?: string;
  image_url?: string;
  source_url?: string;
  published_date?: string;
  citations: string[];
  is_archived: boolean;
  is_read: boolean;
  is_consumed: boolean;
  word_count: number;
  created_at?: string;
}

export interface Topic {
  id: string;
  query: string;
  icon: string;
}

// Topics API
export async function getTopics(): Promise<Topic[]> {
  const response = await api.get('/topics');
  return response.data;
}

export async function createTopic(query: string, icon: string): Promise<Topic> {
  const response = await api.post('/topics', { id: generateId(), query, icon });
  return response.data;
}

export async function removeTopic(topicId: string): Promise<void> {
  await api.delete(`/topics/${topicId}`);
}

// Feed API
export async function getFeed(): Promise<Article[]> {
  const response = await api.get('/feed');
  return response.data;
}

// Archive API
export async function getArchive(): Promise<Article[]> {
  const response = await api.get('/archive');
  return response.data;
}

// Article Actions
export async function archiveArticle(articleId: string): Promise<void> {
  await api.post(`/articles/${articleId}/archive`);
}

export async function markArticleAsConsumed(articleId: string): Promise<void> {
  await api.post(`/articles/${articleId}/swipe`);
}

export async function deleteArticle(articleId: string): Promise<void> {
  await api.delete(`/articles/${articleId}`);
}

export async function generateArticle(topicId: string): Promise<void> {
  await api.post(`/generate/${topicId}`);
}

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
