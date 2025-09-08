import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Search, X, ChevronRight } from 'lucide-react-native';
import { type PartnerStore, groupStoresByCity } from '@/data/partnerStore';

interface PartnerStoreModalProps {
  visible: boolean;
  partnerStores: PartnerStore[];
  selectedStore: PartnerStore | null;
  onSelectStore: (store: PartnerStore) => void;
  onClose: () => void;
}

export default function PartnerStoreModal({
  visible,
  partnerStores,
  selectedStore,
  onSelectStore,
  onClose,
}: PartnerStoreModalProps) {
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [expandedCities, setExpandedCities] = useState<{[key: string]: boolean}>({});

  const groupedStores = useMemo(() => groupStoresByCity(partnerStores), [partnerStores]);

  const filteredGroupedStores = useMemo(() => {
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

  const handleClose = () => {
    setStoreSearchQuery('');
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.storeModal}>
        <Text style={styles.modalTitle}>Select Partner Store</Text>
        <ScrollView style={styles.storeList} showsVerticalScrollIndicator={false}>
          
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
                  onPress={() => onSelectStore(store)}
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
          onPress={handleClose}
        >
          <Text style={styles.modalCloseButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // Ensure it overlays SafeAreaView & other parents
    flex: 1,
    zIndex: 5000,
  },
  storeModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 20,
    paddingBottom: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  storeList: {
    maxHeight: 300,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1f2937',
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  cityHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F33F32',
    marginRight: 8,
  },
  cityStoreCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cityChevron: {
    transform: [{ rotate: '0deg' }],
  },
  cityChevronExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedStoreItem: {
    backgroundColor: '#F33F32',
  },
  storeItemContent: {
    flex: 1,
  },
  storeItemText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 2,
  },
  selectedStoreItemText: {
    color: 'white',
  },
  storeTypeText: {
    fontSize: 12,
    color: '#64748b',
  },
  selectedStoreTypeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  clearSearchButton: {
    backgroundColor: '#F33F32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearSearchButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});