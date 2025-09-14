import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Calendar, MapPin, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';

export default function AccountProfileScreen() {
  const { userData } = useUser();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderInfoItem = (icon: React.ReactNode, label: string, value: string | null) => (
    <View style={styles.infoItem}>
      <View style={styles.infoIcon}>
        {icon}
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Not set'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {renderInfoItem(
            <User size={20} color="#64748B" />,
            'Full Name',
            userData?.fullName
          )}
          
          {renderInfoItem(
            <User size={20} color="#64748B" />,
            'Username',
            userData?.username
          )}
          
          {renderInfoItem(
            <Mail size={20} color="#64748B" />,
            'Email Address',
            userData?.email
          )}
          
          {renderInfoItem(
            <Calendar size={20} color="#64748B" />,
            'Date of Birth',
            userData?.dob ? formatDate(userData.dob) : null
          )}
          
          {renderInfoItem(
            <User size={20} color="#64748B" />,
            'Gender',
            userData?.gender
          )}
          
          {renderInfoItem(
            <Phone size={20} color="#64748B" />,
            'Phone Number',
            userData?.phone
          )}
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Account Status</Text>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Role</Text>
            <View style={[styles.statusBadge, styles.roleBadge]}>
              <Text style={styles.statusBadgeText}>
                {userData?.role?.charAt(0).toUpperCase() + userData?.role?.slice(1)}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Email Status</Text>
            <View style={[
              styles.statusBadge,
              userData?.emailConfirmedAt ? styles.verifiedBadge : styles.unverifiedBadge
            ]}>
              <Text style={[
                styles.statusBadgeText,
                userData?.emailConfirmedAt ? styles.verifiedText : styles.unverifiedText
              ]}>
                {userData?.emailConfirmedAt ? 'Verified' : 'Unverified'}
              </Text>
            </View>
          </View>
          
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Verification Status</Text>
            <View style={[
              styles.statusBadge,
              userData?.verificationCompleted ? styles.verifiedBadge : styles.unverifiedBadge
            ]}>
              <Text style={[
                styles.statusBadgeText,
                userData?.verificationCompleted ? styles.verifiedText : styles.unverifiedText
              ]}>
                {userData?.verificationCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          
          {renderInfoItem(
            <Calendar size={20} color="#64748B" />,
            'Member Since',
            userData?.createdAt ? formatDate(userData.createdAt) : null
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  accountSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statusLabel: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadge: {
    backgroundColor: '#f0f9ff',
  },
  verifiedBadge: {
    backgroundColor: '#f0fdf4',
  },
  unverifiedBadge: {
    backgroundColor: '#fef2f2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  verifiedText: {
    color: '#22C55E',
  },
  unverifiedText: {
    color: '#EF4444',
  },
});