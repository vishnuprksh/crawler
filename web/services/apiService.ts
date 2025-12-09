// API service for backend communication
const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';

// Log the API base URL for debugging
console.log('[API Service] Using backend URL:', API_BASE_URL);

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
  const response = await fetch(`${API_BASE_URL}/topics`);
  if (!response.ok) throw new Error('Failed to fetch topics');
  return response.json();
}

export async function createTopic(query: string, icon: string): Promise<Topic> {
  const response = await fetch(`${API_BASE_URL}/topics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: generateId(), query, icon })
  });
  if (!response.ok) throw new Error('Failed to create topic');
  return response.json();
}

export async function removeTopic(topicId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to remove topic');
}

// Feed API
export async function getFeed(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/feed`);
  if (!response.ok) throw new Error('Failed to fetch feed');
  return response.json();
}

// Archive API
export async function getArchive(): Promise<Article[]> {
  const response = await fetch(`${API_BASE_URL}/archive`);
  if (!response.ok) throw new Error('Failed to fetch archive');
  return response.json();
}

// Article Actions
export async function archiveArticle(articleId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}/archive`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to archive article');
}

export async function markArticleAsConsumed(articleId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}/swipe`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to mark article as consumed');
}

export async function deleteArticle(articleId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/articles/${articleId}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete article');
}

export async function generateArticle(topicId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/generate/${topicId}`, {
    method: 'POST'
  });
  if (!response.ok) throw new Error('Failed to generate article');
}

// Helper function to generate unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
