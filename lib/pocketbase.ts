import PocketBase, { AsyncAuthStore } from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@aos:pb_auth';

const store = new AsyncAuthStore({
  save: (serialized) => AsyncStorage.setItem(STORAGE_KEY, serialized),
  initial: AsyncStorage.getItem(STORAGE_KEY).then((v) => v ?? ''),
  clear: () => AsyncStorage.removeItem(STORAGE_KEY),
});

const PB_URL = process.env.EXPO_PUBLIC_PB_URL;

if (!PB_URL) {
  throw new Error('EXPO_PUBLIC_PB_URL is not defined');
}

export const pb = new PocketBase(PB_URL, store);
