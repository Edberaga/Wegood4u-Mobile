import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MapPin, Star, Phone, Clock, Navigation, ChevronDown } from 'lucide-react-native';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';
interface PartnerStore {
  id: number;
  name: string;
  type: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: string;
  phone: string;
  hours: string;
  description: string;
}

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedCities, setExpandedCities] = useState<{[key: string]: boolean}>({
    'Chiang Mai': false,
    'Kuala Lumpur': false,
  });

  // Fetch partner stores from Firestore
  const fetchPartnerStores = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'partner_store'));
      const stores: PartnerStore[] = [];
      let index = 1;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        stores.push({
          id: index, // Generate sequential ID
          name: data.name,
          type: data.type,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          rating: data.rating,
          image: data.image,
          phone: data.phone,
          hours: data.hours,
          description: data.description,
        });
        index++;
      });
      
      setPartnerStores(stores);
      console.log('Fetched partner stores:', stores.length);
    } catch (error) {
      console.error('Error fetching partner stores:', error);
      Alert.alert('Error', 'Failed to load partner stores. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const chiangMaiStores = partnerStores.filter(store => store.city === 'Chiang Mai');
  const kualaLumpurStores = partnerStores.filter(store => store.city === 'Kuala Lumpur');

  const getFilteredStores = () => {
    if (selectedFilter === 'All') {
      return partnerStores;
    }
    
    // Check if it's a city filter
    if (selectedFilter === 'Chiang Mai' || selectedFilter === 'Kuala Lumpur') {
      return partnerStores.filter(store => store.city === selectedFilter);
    }
    
    // Check if it's a specific store
    const specificStore = partnerStores.find(store => store.name === selectedFilter);
    return specificStore ? [specificStore] : partnerStores;
  };
  
  const filteredStores = getFilteredStores();
  
  const getDropdownDisplayText = () => {
    if (selectedFilter === 'All') return 'All Locations';
    
    // Check if it's a specific store
    const specificStore = partnerStores.find(store => store.name === selectedFilter);
    if (specificStore) {
      return specificStore.name;
    }
    
    return selectedFilter;
  };
  
  const getMapRegion = () => {
    // If a specific store is selected, center on that store
    const specificStore = partnerStores.find(store => store.name === selectedFilter);
    if (specificStore) {
      return {
        latitude: specificStore.latitude,
        longitude: specificStore.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
    
    if (selectedFilter === 'Kuala Lumpur') {
      return {
        latitude: 3.1390,
        longitude: 101.6869,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else if (selectedFilter === 'Chiang Mai') {
      return {
        latitude: 18.7883,
        longitude: 98.9853,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else {
      // Show both cities
      return {
        latitude: 10.9,
        longitude: 100.3,
        latitudeDelta: 20,
        longitudeDelta: 20,
      };
    }
  };
  
  const getSubtitleText = () => {
    const count = filteredStores.length;
    if (selectedFilter === 'All') {
      return `${count} locations total`;
    }
    
    const specificStore = partnerStores.find(store => store.name === selectedFilter);
    if (specificStore) {
      return `${specificStore.city} • ${specificStore.type}`;
    }
    
    return `${count} locations in ${selectedFilter}`;
  };

  useEffect(() => {
    getUserLocation();
    fetchPartnerStores();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required to show your position on the map.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Thailand coordinates
      setUserLocation({
        latitude: 18.79210626514222, 
        longitude: 98.99534619999957,
      });
    }
  };

  const toggleCityExpansion = (city: string) => {
    setExpandedCities(prev => ({
      ...prev,
      [city]: !prev[city]
    }));
  };
  const getDirections = (store: PartnerStore) => {
    Alert.alert(
      'Get Directions',
      `Open directions to ${store.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open', onPress: () => Alert.alert('Opening directions...') },
      ]
    );
  };

  const callStore = (phone: string) => {
    if (!phone) {
      Alert.alert('No Phone Number', 'This store does not have a phone number available.');
      return;
    }
    
    Alert.alert(
      'Call Store',
      `Call ${phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Alert.alert('Calling...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#F33F32" />
          <Text style={styles.loadingText}>Loading partner stores...</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.title}>Partner Stores</Text>
        <Text style={styles.subtitle}>{getSubtitleText()}</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.dropdown}
          onPress={() => setShowDropdown(true)}
        >
          <Text style={styles.dropdownText}>{getDropdownDisplayText()}</Text>
          <ChevronDown size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={getMapRegion()}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {partnerStores.map((store) => (
            <Marker
              key={store.id}
              coordinate={{
                latitude: store.latitude,
                longitude: store.longitude,
              }}
              onPress={() => setSelectedStore(store)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <MapPin size={20} color="#F33F32" />
                </View>
              </View>
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{store.name}</Text>
                  <Text style={styles.calloutType}>{store.type}</Text>
                  <Text style={styles.calloutCity}>{store.city}</Text>
                  <View style={styles.calloutRating}>
                    <Star size={12} color="#FFD700" />
                    <Text style={styles.calloutRatingText}>{store.rating}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {selectedStore && (
        <View style={styles.storeDetailsContainer}>
          <ScrollView style={styles.storeDetails} showsVerticalScrollIndicator={false}>
            <View style={styles.storeHeader}>
              <Image source={{ uri: selectedStore.image }} style={styles.storeImage} />
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{selectedStore.name}</Text>
                <Text style={styles.storeType}>{selectedStore.type}</Text>
                <View style={styles.storeRating}>
                  <Star size={16} color="#FFD700" />
                  <Text style={styles.storeRatingText}>{selectedStore.rating}</Text>
                </View>
                <Text style={styles.storeDescription}>{selectedStore.description}</Text>
              </View>
            </View>

            <View style={styles.storeContact}>
              {selectedStore.phone && (
                <View style={styles.contactItem}>
                  <Phone size={16} color="#64748B" />
                  <Text style={styles.contactText}>{selectedStore.phone}</Text>
                </View>
              )}
              <View style={styles.contactItem}>
                <Clock size={16} color="#64748B" />
                <Text style={styles.contactText}>{selectedStore.hours}</Text>
              </View>
            </View>

            <View style={styles.storeActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => getDirections(selectedStore)}
              >
                <Navigation size={18} color="white" />
                <Text style={styles.actionButtonText}>Directions</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.callButton]}
                onPress={() => callStore(selectedStore.phone)}
              >
                <Phone size={18} color="white" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedStore(null)}
          >
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <ScrollView 
              style={styles.dropdownScrollView}
              showsVerticalScrollIndicator={false}
            >
            <Text style={styles.dropdownTitle}>Select Location or Store</Text>
            
            {/* All Locations Option */}
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                selectedFilter === 'All' && styles.selectedDropdownItem
              ]}
              onPress={() => {
                setSelectedFilter('All');
                setShowDropdown(false);
                setSelectedStore(null);
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                selectedFilter === 'All' && styles.selectedDropdownItemText
              ]}>
                All Locations
              </Text>
              <Text style={styles.storeCount}>
                {partnerStores.length} stores
              </Text>
            </TouchableOpacity>

            {/* Chiang Mai Section */}
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                styles.cityHeader,
                selectedFilter === 'Chiang Mai' && styles.selectedDropdownItem
              ]}
              onPress={() => {
                if (expandedCities['Chiang Mai']) {
                  // If expanded, collapse it
                  toggleCityExpansion('Chiang Mai');
                } else {
                  // If collapsed, expand it and optionally select the city
                  toggleCityExpansion('Chiang Mai');
                  setSelectedFilter('Chiang Mai');
                  setSelectedStore(null);
                }
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                styles.cityHeaderText,
                selectedFilter === 'Chiang Mai' && styles.selectedDropdownItemText
              ]}>
                Chiang Mai
              </Text>
              <Text style={[
                styles.storeCount,
                selectedFilter === 'Chiang Mai' && { color: 'rgba(255,255,255,0.8)' }
              ]}>
                {chiangMaiStores.length} stores
              </Text>
            </TouchableOpacity>

            {/* Chiang Mai Stores */}
            {expandedCities['Chiang Mai'] && chiangMaiStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.dropdownItem,
                  styles.storeItem,
                  selectedFilter === store.name && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  setSelectedFilter(store.name);
                  setShowDropdown(false);
                  setSelectedStore(store);
                }}
              >
                <Text style={[
                  styles.storeItemText,
                  selectedFilter === store.name && styles.selectedDropdownItemText
                ]}>
                  • {store.name}
                </Text>
                <Text style={[
                  styles.storeTypeText,
                  selectedFilter === store.name && { color: 'rgba(255,255,255,0.8)' }
                ]}>
                  {store.type}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Kuala Lumpur Section */}
            <TouchableOpacity
              style={[
                styles.dropdownItem,
                styles.cityHeader,
                selectedFilter === 'Kuala Lumpur' && styles.selectedDropdownItem
              ]}
              onPress={() => {
                if (expandedCities['Kuala Lumpur']) {
                  // If expanded, collapse it
                  toggleCityExpansion('Kuala Lumpur');
                } else {
                  // If collapsed, expand it and optionally select the city
                  toggleCityExpansion('Kuala Lumpur');
                  setSelectedFilter('Kuala Lumpur');
                  setSelectedStore(null);
                }
              }}
            >
              <Text style={[
                styles.dropdownItemText,
                styles.cityHeaderText,
                selectedFilter === 'Kuala Lumpur' && styles.selectedDropdownItemText
              ]}>
                Kuala Lumpur
              </Text>
              <Text style={[
                styles.storeCount,
                selectedFilter === 'Kuala Lumpur' && { color: 'rgba(255,255,255,0.8)' }
              ]}>
                {kualaLumpurStores.length} stores
              </Text>
            </TouchableOpacity>

            {/* Kuala Lumpur Stores */}
            {expandedCities['Kuala Lumpur'] && kualaLumpurStores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={[
                  styles.dropdownItem,
                  styles.storeItem,
                  selectedFilter === store.name && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  setSelectedFilter(store.name);
                  setShowDropdown(false);
                  setSelectedStore(store);
                }}
              >
                <Text style={[
                  styles.storeItemText,
                  selectedFilter === store.name && styles.selectedDropdownItemText
                ]}>
                  • {store.name}
                </Text>
                <Text style={[
                  styles.storeTypeText,
                  selectedFilter === store.name && { color: 'rgba(255,255,255,0.8)' }
                ]}>
                  {store.type}
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  header: {
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 30,
    height: 30,
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  calloutContainer: {
    width: 150,
    padding: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  calloutType: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  calloutCity: {
    fontSize: 11,
    color: '#F33F32',
    fontWeight: '600',
    marginBottom: 4,
  },
  calloutRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calloutRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  storeDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  storeDetails: {
    padding: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  storeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  storeType: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  storeRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  storeDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  storeContact: {
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#1e293b',
  },
  storeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F33F32',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#00A85A',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    maxWidth: 350,
    width: '90%',
    maxHeight: '75%',
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownScrollView: {
    paddingHorizontal: 20,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDropdownItem: {
    backgroundColor: '#F33F32',
  },
  cityHeader: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
    marginBottom: 8,
  },
  cityHeaderText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  storeItem: {
    marginLeft: 16,
    backgroundColor: '#fafbfc',
    borderLeftWidth: 3,
    borderLeftColor: '#e2e8f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  storeItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  selectedDropdownItemText: {
    color: 'white',
  },
  storeCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  storeTypeText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontStyle: 'italic',
  },
});