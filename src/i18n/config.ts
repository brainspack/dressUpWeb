import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import en from './locales/en';
import hi from './locales/hi';

const LANGUAGE_STORAGE_KEY = '@app_language';
const API_URL = 'YOUR_API_URL'; // Replace with your actual API URL

export const updateLanguageOnServer = async (language: string) => {
  try {
    await axios.patch('/language', { language });
  } catch (error) {
    console.error('Failed to update language on server:', error);
    throw error;
  }
};

export const loadStoredLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage;
  } catch (error) {
    console.error('Failed to load language from storage:', error);
    return null;
  }
};

export const saveLanguageToStorage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Failed to save language to storage:', error);
  }
};

export const changeLanguage = async (language: string) => {
  try {
    await i18n.changeLanguage(language);
    await saveLanguageToStorage(language);
    await updateLanguageOnServer(language);
  } catch (error) {
    console.error('Failed to change language:', error);
    throw error;
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en,
      hi,
    },
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

// Load stored language on app start
loadStoredLanguage().then((language) => {
  if (language) {
    i18n.changeLanguage(language);
  }
});

export default i18n; 