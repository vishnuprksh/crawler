import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  LAST_FETCH_DATE: 'last_fetch_date',
};

export const storageService = {
  getLastFetchDate: async (): Promise<string | null> => {
    return await AsyncStorage.getItem(KEYS.LAST_FETCH_DATE);
  },

  setLastFetchDate: async (date: string): Promise<void> => {
    await AsyncStorage.setItem(KEYS.LAST_FETCH_DATE, date);
  },
};
