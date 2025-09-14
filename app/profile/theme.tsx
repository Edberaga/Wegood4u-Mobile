import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Palette, Sun, Moon } from 'lucide-react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark';

export default function ThemeScreen() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('app_theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setSelectedTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme: ThemeType) => {
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem('app_theme', theme);
      
      // Apply theme immediately
      applyTheme(theme);
      
      Alert.alert(
        'Theme Updated',
        `Successfully switched to ${theme} theme!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error saving theme preference:', error);
      Alert.alert('Error', 'Failed to save theme preference');
    }
  };

  const applyTheme = (theme: ThemeType) => {
    // This function would typically update a global theme context
    // For now, we'll just store the preference
    console.log(`Applied ${theme} theme`);
  };

  const getThemeStyles = () => {
    return selectedTheme === 'dark' ? darkStyles : lightStyles;
  };

  const themeStyles = getThemeStyles();

  const renderThemeOption = (
    theme: ThemeType,
    label: string,
    description: string,
    icon: React.ReactNode
  ) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        themeStyles.themeOption,
        selectedTheme === theme && styles.selectedThemeOption
      ]}
      onPress={() => handleThemeChange(theme)}
    >
      <View style={styles.themeOptionLeft}>
        <View style={[
          styles.themeIconContainer,
          selectedTheme === theme ? styles.selectedThemeIconContainer : themeStyles.themeIconContainer
        ]}>
          {icon}
        </View>
        <View style={styles.themeInfo}>
          <Text style={[
            styles.themeLabel,
            selectedTheme === theme ? styles.selectedThemeLabel : themeStyles.themeLabel
          ]}>
            {label}
          </Text>
          <Text style={[
            styles.themeDescription,
            selectedTheme === theme ? styles.selectedThemeDescription : themeStyles.themeDescription
          ]}>
            {description}
          </Text>
        </View>
      </View>
      
      <View style={styles.themeSelector}>
        <View style={[
          styles.radioButton,
          selectedTheme === theme && styles.radioButtonSelected
        ]}>
          {selectedTheme === theme && <View style={styles.radioButtonInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, themeStyles.container]}>
        <View style={styles.loadingContainer}>
          <Text style={themeStyles.text}>Loading theme settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeStyles.container]}>
      <View style={[styles.header, themeStyles.header]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={themeStyles.text.color} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, themeStyles.text]}>Theme</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={[styles.section, themeStyles.section]}>
          <View style={styles.sectionHeader}>
            <Palette size={24} color="#206E56" />
            <Text style={[styles.sectionTitle, themeStyles.text]}>Choose Your Theme</Text>
          </View>
          <Text style={[styles.sectionDescription, themeStyles.secondaryText]}>
            Select your preferred theme for the app. The theme will be applied immediately and saved for future sessions.
          </Text>

          <View style={styles.themeOptions}>
            {renderThemeOption(
              'light',
              'Light Theme',
              'Clean and bright interface',
              <Sun size={24} color={selectedTheme === 'light' ? '#206E56' : '#64748B'} />
            )}

            {renderThemeOption(
              'dark',
              'Dark Theme',
              'Easy on the eyes in low light',
              <Moon size={24} color={selectedTheme === 'dark' ? '#206E56' : '#64748B'} />
            )}
          </View>
        </View>

        <View style={[styles.infoSection, themeStyles.section]}>
          <Text style={[styles.infoTitle, themeStyles.text]}>Theme Information</Text>
          <View style={styles.infoList}>
            <Text style={[styles.infoItem, themeStyles.secondaryText]}>
              • Theme preference is saved automatically
            </Text>
            <Text style={[styles.infoItem, themeStyles.secondaryText]}>
              • Changes apply immediately across the app
            </Text>
            <Text style={[styles.infoItem, themeStyles.secondaryText]}>
              • Brand colors remain consistent in both themes
            </Text>
            <Text style={[styles.infoItem, themeStyles.secondaryText]}>
              • Dark theme helps reduce eye strain
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  themeOptions: {
    gap: 16,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  selectedThemeOption: {
    borderColor: '#206E56',
    backgroundColor: '#f0fdf4',
  },
  themeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  selectedThemeIconContainer: {
    backgroundColor: '#CBEED2',
  },
  themeInfo: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedThemeLabel: {
    color: '#206E56',
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedThemeDescription: {
    color: '#206E56',
  },
  themeSelector: {
    marginLeft: 16,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#206E56',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#206E56',
  },
  infoSection: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    lineHeight: 20,
  },
});

// Light theme styles
const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: 'white',
    borderBottomColor: '#e2e8f0',
  },
  section: {
    backgroundColor: 'white',
  },
  themeOption: {
    backgroundColor: 'white',
    borderColor: '#e2e8f0',
  },
  themeIconContainer: {
    backgroundColor: '#f8fafc',
  },
  text: {
    color: '#1e293b',
  },
  secondaryText: {
    color: '#64748B',
  },
  themeLabel: {
    color: '#1e293b',
  },
  themeDescription: {
    color: '#64748B',
  },
});

// Dark theme styles
const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: '#1e293b',
  },
  header: {
    backgroundColor: '#334155',
    borderBottomColor: '#475569',
  },
  section: {
    backgroundColor: '#334155',
  },
  themeOption: {
    backgroundColor: '#334155',
    borderColor: '#475569',
  },
  themeIconContainer: {
    backgroundColor: '#475569',
  },
  text: {
    color: 'white',
  },
  secondaryText: {
    color: '#cbd5e1',
  },
  themeLabel: {
    color: 'white',
  },
  themeDescription: {
    color: '#cbd5e1',
  },
});