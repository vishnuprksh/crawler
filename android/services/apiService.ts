import { api, ENDPOINTS } from '../config/api';
import { Topic, ArticleCard } from '../types';

export const apiService = {
  getTopics: async (): Promise<Topic[]> => {
    const response = await api.get<Topic[]>(ENDPOINTS.TOPICS);
    return response.data;
  },

  createTopic: async (query: string, icon: string = '📰'): Promise<Topic> => {
    const id = generateUUID();
    const response = await api.post<Topic>(ENDPOINTS.TOPICS, { id, query, icon });
    return response.data;
  },

  deleteTopic: async (topicId: string): Promise<void> => {
    await api.delete(`${ENDPOINTS.TOPICS}/${topicId}`);
  },

  getFeed: async (): Promise<ArticleCard[]> => {
    const response = await api.get<ArticleCard[]>(ENDPOINTS.FEED);
    return response.data;
  },

  getArchive: async (): Promise<ArticleCard[]> => {
    const response = await api.get<ArticleCard[]>(ENDPOINTS.ARCHIVE);
    return response.data;
  },

  archiveArticle: async (articleId: string): Promise<void> => {
    await api.post(ENDPOINTS.ARCHIVE_ARTICLE(articleId));
  },

  swipeArticle: async (articleId: string): Promise<void> => {
    await api.post(ENDPOINTS.SWIPE_ARTICLE(articleId));
  },

  generateArticle: async (topicId: string): Promise<ArticleCard> => {
    const response = await api.post<ArticleCard>(ENDPOINTS.GENERATE(topicId));
    return response.data;
  }
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
