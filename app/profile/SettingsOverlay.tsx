import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, User, Settings, Palette, Lock, Info, MessageCircle, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

interface SettingsOverlayProps {
  visible: boolean;
  onClose: () => void;
  userData: any;
}

export default function SettingsOverlay({ visible, onClose, userData }: SettingsOverlayProps) {
  const { signOut } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            onClose();
            await signOut();
          }
        },
      ]
    );
  };

  const handleAccountProfile = () => {
    onClose();
    router.push('/profile/account');
  };

  const handleEditPreferences = () => {
    onClose();
    router.push('/profile/preferences');
  };

  const handleChangePassword = () => {
    onClose();
    router.push('/profile/change-password');
  };

  const handleAboutApp = () => {
    onClose();
    router.push('/profile/about');
  };

  const handleContactUs = () => {
    onClose();
    router.push('./contact');
  };

  const handleFAQ = () => {
    onClose();
    router.push('/profile/faq');
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setSelectedTheme(theme);
    Alert.alert('Theme Changed', `Switched to ${theme} theme`);
  };

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    showChevron: boolean = true
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuItemIcon}>
          {icon}
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color="#94A3B8" />}
    </TouchableOpacity>
  );

  const renderThemeOption = (theme: 'light' | 'dark', label: string) => (
    <TouchableOpacity
      style={[styles.themeOption, selectedTheme === theme && styles.selectedThemeOption]}
      onPress={() => handleThemeChange(theme)}
    >
      <View style={styles.themeOptionContent}>
        <View style={[
          styles.themePreview,
          theme === 'dark' ? styles.darkThemePreview : styles.lightThemePreview
        ]} />
        <Text style={[
          styles.themeOptionText,
          selectedTheme === theme && styles.selectedThemeOptionText
        ]}>
          {label}
        </Text>
      </View>
      {selectedTheme === theme && (
        <View style={styles.selectedIndicator} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sidebar}>
          <SafeAreaView style={styles.sidebarContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* General Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General</Text>
                
                {renderMenuItem(
                  <User size={20} color="#64748B" />,
                  'Account Profile',
                  handleAccountProfile
                )}
                
                {renderMenuItem(
                  <Settings size={20} color="#64748B" />,
                  'Edit Preferences',
                  handleEditPreferences
                )}

                {/* Theme Section */}
                <View style={styles.menuItem}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuItemIcon}>
                      <Palette size={20} color="#64748B" />
                    </View>
                    <Text style={styles.menuItemText}>Theme</Text>
                  </View>
                </View>
                
                <View style={styles.themeOptions}>
                  {renderThemeOption('light', 'Light')}
                  {renderThemeOption('dark', 'Dark')}
                </View>
              </View>

              {/* Security Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                
                {renderMenuItem(
                  <Lock size={20} color="#64748B" />,
                  'Change Password',
                  handleChangePassword
                )}
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                
                {renderMenuItem(
                  <Info size={20} color="#64748B" />,
                  'About This App',
                  handleAboutApp
                )}
                
                {renderMenuItem(
                  <MessageCircle size={20} color="#64748B" />,
                  'Contact Us',
                  handleContactUs
                )}
                
                {renderMenuItem(
                  <HelpCircle size={20} color="#64748B" />,
                  'FAQ',
                  handleFAQ
                )}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                    <View style={styles.logoutIcon}>
                      <LogOut size={20} color="#EF4444" />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
        
        {/* Backdrop */}
        <TouchableOpacity 
          style={styles.backdrop} 
          onPress={onClose}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  sidebarContent: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 16,
    marginHorizontal: 20,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  themeOptions: {
    paddingHorizontal: 20,
    gap: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedThemeOption: {
    borderColor: '#206E56',
    backgroundColor: '#f0fdf4',
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themePreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  lightThemePreview: {
    backgroundColor: '#ffffff',
  },
  darkThemePreview: {
    backgroundColor: '#1e293b',
  },
  themeOptionText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  selectedThemeOptionText: {
    color: '#206E56',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#206E56',
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
});