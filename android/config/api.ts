import axios from 'axios';

// For Codespace development: Use the forwarded port URL from the PORTS tab
// Make sure port 8000 visibility is set to "Public" in VS Code PORTS panel
// Example: https://redesigned-tribble-xxxxx-8000.app.github.dev
// For local testing: http://localhost:8000
export const API_BASE_URL = 'https://redesigned-tribble-69wg7g659vfr95j-8000.app.github.dev';

export const ENDPOINTS = {
  TOPICS: '/topics',
  FEED: '/feed',
  ARCHIVE: '/archive',
  GENERATE: (topicId: string) => `/generate/${topicId}`,
  ARCHIVE_ARTICLE: (articleId: string) => `/articles/${articleId}/archive`,
  SWIPE_ARTICLE: (articleId: string) => `/articles/${articleId}/swipe`,
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
