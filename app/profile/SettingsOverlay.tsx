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
import { useTheme } from '@/context/ThemeContext';

interface SettingsOverlayProps {
  visible: boolean;
  onClose: () => void;
  userData: any;
}

export default function SettingsOverlay({ visible, onClose, userData }: SettingsOverlayProps) {
  const { signOut } = useAuth();
  const { colors } = useTheme();

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

  const renderMenuItem = (
    icon: React.ReactNode,
    title: string,
    onPress: () => void,
    showChevron: boolean = true
  ) => (
    <TouchableOpacity style={[styles.menuItem, { borderBottomColor: colors.border }]} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuItemIcon, { backgroundColor: colors.background }]}>
          {icon}
        </View>
        <Text style={[styles.menuItemText, { color: colors.text }]}>{title}</Text>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.textSecondary} />}
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
        <View style={[styles.sidebar, { backgroundColor: colors.surface }]}>
          <SafeAreaView style={styles.sidebarContent}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* General Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>General</Text>
                
                {renderMenuItem(
                  <User size={20} color={colors.textSecondary} />,
                  'Account Profile',
                  handleAccountProfile
                )}
                
                {renderMenuItem(
                  <Settings size={20} color={colors.textSecondary} />,
                  'Edit Preferences',
                  handleEditPreferences
                )}

                {renderMenuItem(
                  <Palette size={20} color={colors.textSecondary} />,
                  'Theme',
                  handleTheme
                )}
              </View>

              {/* Security Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Security</Text>
                
                {renderMenuItem(
                  <Lock size={20} color={colors.textSecondary} />,
                  'Change Password',
                  handleChangePassword
                )}
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>About</Text>
                
                {renderMenuItem(
                  <Info size={20} color={colors.textSecondary} />,
                  'About This App',
                  handleAboutApp
                )}
                
                {renderMenuItem(
                  <MessageCircle size={20} color={colors.textSecondary} />,
                  'Contact Us',
                  handleContactUs
                )}
                
                {renderMenuItem(
                  <HelpCircle size={20} color={colors.textSecondary} />,
                  'FAQ',
                  handleFAQ
                )}

                {/* Logout */}
                <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.logoutIcon, { backgroundColor: '#fef2f2' }]}>
                      <LogOut size={20} color={colors.error} />
                    </View>
                    <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
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
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});