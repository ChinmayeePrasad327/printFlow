import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  async set(key: string, value: string) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('Storage set error', e);
    }
  },
  async get(key: string) {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('Storage get error', e);
      return null;
    }
  },
  async remove(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage remove error', e);
    }
  }
};
