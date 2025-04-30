import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

export const LanguageSelector = () => {
  const { t } = useTranslation();
  const { currentLanguage, setAppLanguage } = useLanguage();

  const languages = [
    { code: 'en', label: t('settings.english') },
    { code: 'hi', label: t('settings.hindi') },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('settings.languageSelection')}</Text>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageButton,
            currentLanguage === lang.code && styles.selectedLanguage,
          ]}
          onPress={() => setAppLanguage(lang.code)}
        >
          <Text style={[
            styles.languageText,
            currentLanguage === lang.code && styles.selectedLanguageText,
          ]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  languageButton: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedLanguage: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    color: '#fff',
  },
}); 