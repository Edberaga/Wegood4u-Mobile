import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RefreshCw, Search, X, ChevronRight } from 'lucide-react-native';
import { useUser } from '@/context/UserContext';
import { fetchPartnerStores, type PartnerStore, groupStoresByCity } from '@/data/partnerStore';
import UnverifiedMember from '../components/unverified-member/UnverifiedMember';
import VerifiedMember from '../components/verified-member/VerifiedMember';

export default function TasksScreen() {
  const { userData, isLoading: userLoading, refreshUserData, resendEmailConfirmation } = useUser();
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storesError, setStoresError] = useState<string | null>(null);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [expandedCities, setExpandedCities] = useState<{[key: string]: boolean}>({});

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

  const groupedStores = groupStoresByCity(partnerStores);
  
  const filteredGroupedStores = React.useMemo(() => {
    if (!storeSearchQuery.trim()) {
      return groupedStores;
    }
    
    const filtered: {[key: string]: PartnerStore[]} = {};
    Object.entries(groupedStores).forEach(([city, stores]) => {
      const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(storeSearchQuery.toLowerCase())
      );
      if (filteredStores.length > 0) {
        filtered[city] = filteredStores;
      }
    });
    return filtered;
  }, [groupedStores, storeSearchQuery]);

  const toggleCityExpansion = (city: string) => {
    setExpandedCities(prev => ({
      ...prev,
      [city]: !prev[city]
    }));
  };

  const handleSelectStore = (store: PartnerStore) => {
    setSelectedStore(store);
    setShowStoreModal(false);
    setStoreSearchQuery('');
  };

  const handleCloseModal = () => {
    setShowStoreModal(false);
    setStoreSearchQuery('');
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
    <SafeAreaView style={styles.container}>
      <VerifiedMember
        userData={userData}
        partnerStores={partnerStores}
        storesLoading={storesLoading}
        storesError={storesError}
        refreshUserData={refreshUserData}
      />

      {/* Partner Store Modal */}
      <Modal
        visible={showStoreModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.storeModal}>
            <Text style={styles.modalTitle}>Select Partner Store</Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search partner stores..."
                value={storeSearchQuery}
                onChangeText={setStoreSearchQuery}
              />
              {storeSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setStoreSearchQuery('')}>
                  <X size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.storeList} showsVerticalScrollIndicator={false}>
              {/* Store List */}
              {Object.entries(filteredGroupedStores).map(([city, stores]) => (
                <React.Fragment key={city}>
                  {/* City Header - Collapsible */}
                  <TouchableOpacity 
                    style={styles.cityHeader}
                    onPress={() => toggleCityExpansion(city)}
                  >
                    <View style={styles.cityHeaderContent}>
                      <Text style={styles.cityHeaderText}>{city}</Text>
                      <Text style={styles.cityStoreCount}>({stores.length} stores)</Text>
                    </View>
                    <ChevronRight 
                      size={20} 
                      color="#64748B" 
                      style={[
                        styles.cityChevron,
                        expandedCities[city] && styles.cityChevronExpanded
                      ]}
                    />
                  </TouchableOpacity>

                  {/* Store Items - Show when expanded */}
                  {expandedCities[city] && stores.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      style={[
                        styles.storeItem,
                        selectedStore?.id === store.id && styles.selectedStoreItem
                      ]}
                      onPress={() => handleSelectStore(store)}
                    >
                      <View style={styles.storeItemContent}>
                        <Text style={[
                          styles.storeItemText,
                          selectedStore?.id === store.id && styles.selectedStoreItemText
                        ]}>
                          {store.name}
                        </Text>
                        <Text style={[
                          styles.storeTypeText,
                          selectedStore?.id === store.id && styles.selectedStoreTypeText
                        ]}>
                          {store.type === "Coffee & Desserts" ? "Cafe" : store.type}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </React.Fragment>
              ))}

              {/* No Results Message */}
              {Object.keys(filteredGroupedStores).length === 0 && storeSearchQuery.length > 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No stores found matching "{storeSearchQuery}"</Text>
                  <TouchableOpacity 
                    style={styles.clearSearchButton}
                    onPress={() => setStoreSearchQuery('')}
                  >
                    <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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