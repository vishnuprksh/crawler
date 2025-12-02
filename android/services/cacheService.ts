import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArticleCard } from '../types';

const CACHE_KEYS = {
  FEED: 'feed_cache',
  ARCHIVE: 'archive_cache',
  TIMESTAMP: 'cache_timestamp_',
};

const TTL = {
  FEED: 5 * 60 * 1000, // 5 minutes
  ARCHIVE: 60 * 60 * 1000, // 1 hour
};

export const cacheService = {
  getFeed: async (): Promise<ArticleCard[] | null> => {
    return getCachedData(CACHE_KEYS.FEED, TTL.FEED);
  },

  setFeed: async (data: ArticleCard[]) => {
    await setCachedData(CACHE_KEYS.FEED, data);
  },

  getArchive: async (): Promise<ArticleCard[] | null> => {
    return getCachedData(CACHE_KEYS.ARCHIVE, TTL.ARCHIVE);
  },

  setArchive: async (data: ArticleCard[]) => {
    await setCachedData(CACHE_KEYS.ARCHIVE, data);
  },
  
  invalidateFeed: async () => {
    await AsyncStorage.removeItem(CACHE_KEYS.FEED);
    await AsyncStorage.removeItem(CACHE_KEYS.TIMESTAMP + CACHE_KEYS.FEED);
  }
};

async function getCachedData<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const timestampStr = await AsyncStorage.getItem(CACHE_KEYS.TIMESTAMP + key);
    if (!timestampStr) return null;

    const timestamp = parseInt(timestampStr, 10);
    if (Date.now() - timestamp > ttl) {
      return null; // Expired
    }

    const dataStr = await AsyncStorage.getItem(key);
    return dataStr ? JSON.parse(dataStr) : null;
  } catch (e) {
    console.error('Cache read error', e);
    return null;
  }
}

async function setCachedData(key: string, data: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.TIMESTAMP + key, Date.now().toString());
  } catch (e) {
    console.error('Cache write error', e);
  }
}
