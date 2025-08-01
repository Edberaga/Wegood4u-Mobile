import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { User, CreditCard as Edit3, Star, Gift, Share2, Settings, Bell, Shield, LogOut, Camera, Copy, Trophy, MapPin, Calendar } from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.displayName || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Food enthusiast and travel lover. Always exploring new flavors!',
    profileImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
  });
  const [settings, setSettings] = useState({
    notifications: true,
    locationServices: true,
    marketingEmails: false,
  });

  const referralCode = 'WG4U2024';
  const userStats = {
    totalPoints: 2450,
    tasksCompleted: 12,
    vouchersEarned: 8,
    memberSince: 'January 2024',
  };

  const recentAchievements = [
    { id: 1, title: 'First Review', description: 'Posted your first restaurant review', date: '2024-01-10' },
    { id: 2, title: 'Point Collector', description: 'Earned 1000 points', date: '2024-01-08' },
    { id: 3, title: 'Social Butterfly', description: 'Referred 3 friends', date: '2024-01-05' },
  ];

  const pickProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileData({ ...profileData, profileImage: result.assets[0].uri });
    }
  };

  const saveProfile = () => {
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const copyReferralCode = () => {
    Alert.alert('Copied!', `Referral code ${referralCode} copied to clipboard`);
  };

  const shareReferralCode = () => {
    Alert.alert(
      'Share Referral Code',
      `Share your referral code ${referralCode} with friends and earn rewards!`
    );
  };

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
            await logout();
            // Note: You might want to navigate to login screen here
            // router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#F33F32', '#f38632ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.profileImageContainer} onPress={pickProfileImage}>
            <Image source={{ uri: profileData.profileImage }} style={styles.profileImage} />
            <View style={styles.cameraIcon}>
              <Camera size={16} color="white" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>

          <View style={styles.pointsContainer}>
            <Star size={20} color="#FFD700" />
            <Text style={styles.points}>{userStats.totalPoints} Points</Text>
          </View>
        </LinearGradient>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Trophy size={20} color="#F33F32" />
              <Text style={styles.statNumber}>{userStats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statItem}>
              <Gift size={20} color="#00A85A" />
              <Text style={styles.statNumber}>{userStats.vouchersEarned}</Text>
              <Text style={styles.statLabel}>Vouchers</Text>
            </View>
            <View style={styles.statItem}>
              <Calendar size={20} color="#F59E0B" />
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Months</Text>
            </View>
          </View>
        </View>

        {/* Referral Code Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Code</Text>
          <View style={styles.referralCard}>
            <View style={styles.referralInfo}>
              <Text style={styles.referralLabel}>Your Referral Code</Text>
              <Text style={styles.referralCode}>{referralCode}</Text>
              <Text style={styles.referralDescription}>
                Share with friends and earn 200 points for each signup!
              </Text>
            </View>
            <View style={styles.referralActions}>
              <TouchableOpacity style={styles.referralButton} onPress={copyReferralCode}>
                <Copy size={16} color="#F33F32" />
                <Text style={styles.referralButtonText}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.referralButton, styles.shareReferralButton]}
                onPress={shareReferralCode}
              >
                <Share2 size={16} color="white" />
                <Text style={[styles.referralButtonText, { color: 'white' }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Edit3 size={16} color="#F33F32" />
              <Text style={styles.editButtonText}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Name</Text>
              <TextInput
                style={[styles.formInput, !isEditing && styles.disabledInput]}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                editable={isEditing}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email</Text>
              <TextInput
                style={[styles.formInput, !isEditing && styles.disabledInput]}
                value={profileData.email}
                onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                editable={isEditing}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone</Text>
              <TextInput
                style={[styles.formInput, !isEditing && styles.disabledInput]}
                value={profileData.phone}
                onChangeText={(text) => setProfileData({ ...profileData, phone: text })}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bio</Text>
              <TextInput
                style={[styles.formInput, styles.textArea, !isEditing && styles.disabledInput]}
                value={profileData.bio}
                onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                editable={isEditing}
                multiline
                numberOfLines={3}
              />
            </View>

            {isEditing && (
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            {recentAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.achievementItem}>
                <View style={styles.achievementIcon}>
                  <Trophy size={16} color="#F59E0B" />
                </View>
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  <Text style={styles.achievementDate}>{achievement.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsContainer}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Bell size={20} color="#64748B" />
                <Text style={styles.settingLabel}>Push Notifications</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={(value) => setSettings({ ...settings, notifications: value })}
                trackColor={{ false: '#e2e8f0', true: '#F33F32' }}
                thumbColor={settings.notifications ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <MapPin size={20} color="#64748B" />
                <Text style={styles.settingLabel}>Location Services</Text>
              </View>
              <Switch
                value={settings.locationServices}
                onValueChange={(value) => setSettings({ ...settings, locationServices: value })}
                trackColor={{ false: '#e2e8f0', true: '#F33F32' }}
                thumbColor={settings.locationServices ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Shield size={20} color="#64748B" />
                <Text style={styles.settingLabel}>Marketing Emails</Text>
              </View>
              <Switch
                value={settings.marketingEmails}
                onValueChange={(value) => setSettings({ ...settings, marketingEmails: value })}
                trackColor={{ false: '#e2e8f0', true: '#F33F32' }}
                thumbColor={settings.marketingEmails ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F33F32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 16,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  referralCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  referralInfo: {
    marginBottom: 16,
  },
  referralLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F33F32',
    marginBottom: 8,
  },
  referralDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  referralActions: {
    flexDirection: 'row',
    gap: 12,
  },
  referralButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F33F32',
    gap: 8,
  },
  shareReferralButton: {
    backgroundColor: '#F33F32',
    borderColor: '#F33F32',
  },
  referralButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F33F32',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F33F32',
  },
  profileForm: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  disabledInput: {
    backgroundColor: '#f8fafc',
    color: '#64748b',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#F33F32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  achievementsList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 10,
    color: '#94a3b8',
  },
  settingsContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1e293b',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
});