import axios from 'axios';

// API Base URL Configuration
// For production: http://31.97.232.229:8000
// For local development: http://localhost:8000 (or your machine IP for device testing)
// For Codespace development: https://redesigned-tribble-xxxxx-8000.app.github.dev
export const API_BASE_URL = 'http://31.97.232.229:8000';

export const ENDPOINTS = {
  TOPICS: '/topics',
  FEED: '/feed',
  ARCHIVE: '/archive',
  GENERATE: (topicId: string) => `/generate/${topicId}`,
  ARCHIVE_ARTICLE: (articleId: string) => `/articles/${articleId}/archive`,
  SWIPE_ARTICLE: (articleId: string) => `/articles/${articleId}/swipe`,
  DELETE_ARTICLE: (articleId: string) => `/articles/${articleId}`,
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
