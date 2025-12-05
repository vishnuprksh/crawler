import { AppState, Topic, ArticleCard } from '../types';

const STORAGE_KEY = 'crawler_data_v1';

const INITIAL_STATE: AppState = {
  topics: [
    {
      id: 'default-russia-ukraine',
      query: 'what is happening with russia and ukraine now?',
      createdAt: Date.now(),
    }
  ],
  activeCards: [],
  archivedCards: [],
  lastFetchDate: null,
};

export const loadState = (): AppState => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return INITIAL_STATE;
    return JSON.parse(serialized);
  } catch (e) {
    console.error("Failed to load state", e);
    return INITIAL_STATE;
  }
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save state", e);
  }
};

export const clearState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};