import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Upload, Gift } from 'lucide-react-native';
import Submission from './submission/Submission';
import Badges from './badges/Badges';
import { type PartnerStore } from '@/data/partnerStore';

interface VerifiedMemberProps {
  userData: any;
  partnerStores: PartnerStore[];
  storesLoading: boolean;
  storesError: string | null;
  refreshUserData: () => Promise<void>;
}

export default function VerifiedMember({
  userData,
  partnerStores,
  storesLoading,
  storesError,
  refreshUserData,
}: VerifiedMemberProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'rewards'>('submit');

  // Mock submissions data - in real app this would come from props or API
  const submissions = [
    {
      id: 1,
      submissionDate: '2024-01-12',
      restaurantName: 'Tai Toon Baan',
      receiptPhoto: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'approved' as const,
      points: 150,
    },
    {
      id: 2,
      submissionDate: '2024-01-10',
      restaurantName: 'White Rabbit',
      receiptPhoto: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending' as const,
    },
    {
      id: 3,
      submissionDate: '2024-01-08',
      restaurantName: 'Come True Cafe',
      receiptPhoto: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'approved' as const,
      points: 200,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Travel Proof</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{submissions.filter(s => s.status === 'approved').length}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{submissions.filter(s => s.status === 'pending').length}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'submit' && styles.activeTab]}
          onPress={() => setActiveTab('submit')}
        >
          <Upload size={20} color={activeTab === 'submit' ? '#F33F32' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'submit' && styles.activeTabText]}>
            Submit Proof
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.activeTab]}
          onPress={() => setActiveTab('rewards')}
        >
          <Gift size={20} color={activeTab === 'rewards' ? '#F33F32' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'rewards' && styles.activeTabText]}>
            View Rewards
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'submit' ? (
        <Submission
          partnerStores={partnerStores}
          submissions={submissions}
          storesLoading={storesLoading}
          storesError={storesError}
        />
      ) : (
        <Badges
          submissions={submissions}
          partnerStores={partnerStores}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F33F32',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#f1f5f9',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  activeTabText: {
    color: '#F33F32',
  },
});