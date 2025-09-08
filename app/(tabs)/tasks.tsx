import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw } from 'lucide-react-native';
import { useUser } from '@/context/UserContext';
import { fetchPartnerStores, type PartnerStore } from '@/data/partnerStore';
import UnverifiedMember from '../components/unverified-member/UnverifiedMember';
import VerifiedMember from '../components/verified-member/VerifiedMember';

export default function TasksScreen() {
  const { userData, isLoading: userLoading, refreshUserData, resendEmailConfirmation } = useUser();
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);

  useEffect(() => {
    loadPartnerStores();
  }, []);

  const loadPartnerStores = async () => {
    try {
      setStoresLoading(true);
      setStoresError(null);
      const stores = await fetchPartnerStores();
      setPartnerStores(stores);
    } catch (err) {
      console.error('Error loading partner stores:', err);
      setStoresError('Failed to load partner stores');
    } finally {
      setStoresLoading(false);
    }
  };

  // Show loading state
  if (userLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state if no user data
  if (!userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load user data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshUserData}>
            <RefreshCw size={16} color="#F33F32" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render verification checklist for subscribers
  if (userData.role === 'subscriber') {
    return (
      <UnverifiedMember
        userData={userData}
        refreshUserData={refreshUserData}
        resendEmailConfirmation={resendEmailConfirmation}
      />
    );
  }

  // Render main task view for members and affiliates
  return (
    <VerifiedMember
      userData={userData}
      partnerStores={partnerStores}
      storesLoading={storesLoading}
      storesError={storesError}
      refreshUserData={refreshUserData}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F33F32',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#F33F32',
    fontWeight: '600',
  },
});