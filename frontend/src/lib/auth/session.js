import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * expo-secure-store has no web implementation, so session persistence
 * branches to localStorage there and to SecureStore on native.
 */
const isWeb = Platform.OS === 'web';
const ACCESS_KEY = 'icollege.accessToken';
const REFRESH_KEY = 'icollege.refreshToken';
async function getItem(key) {
  if (isWeb) return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  return SecureStore.getItemAsync(key);
}
async function setItem(key, value) {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}
async function deleteItem(key) {
  if (isWeb) {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
export async function getSession() {
  const [accessToken, refreshToken] = await Promise.all([getItem(ACCESS_KEY), getItem(REFRESH_KEY)]);
  if (!accessToken || !refreshToken) return null;
  return {
    accessToken,
    refreshToken,
  };
}
export async function saveSession(session) {
  await Promise.all([setItem(ACCESS_KEY, session.accessToken), setItem(REFRESH_KEY, session.refreshToken)]);
}
export async function clearSession() {
  await Promise.all([deleteItem(ACCESS_KEY), deleteItem(REFRESH_KEY)]);
}
