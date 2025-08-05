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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import MapView, { Marker, Callout } from 'react-native-maps';
import { MapPin, Star, Phone, Clock, Navigation, ChevronDown } from 'lucide-react-native';

import taitoonbaan from '../../assets/images/tai_toon_baan.jpeg';
import white_rabbit from '../../assets/images/white_rabbit.jpeg';
import versaile from '../../assets/images/versaile.jpeg';
import sax from '../../assets/images/sax.jpeg';
import matcha from '../../assets/images/matcha.jpeg';

import come_true_cafe from '../../assets/images/come_true_cafe.jpeg';
import zhang_lala from '../../assets/images/zhang_lala.jpeg';
import fatt_kee from '@/assets/images/fatt_kee.jpeg';
import mantra_bar from '@/assets/images/mantra_bar.jpeg';
import mil_toast from '@/assets/images/mil_toast.jpeg';

interface PartnerStore {
  id: number;
  name: string;
  type: string;
  city: string;
  latitude: number;
  longitude: number;
  rating: number;
  image: number;
  phone: string;
  hours: string;
  description: string;
}

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const partnerStores: PartnerStore[] = [
    {
      id: 1,
      name: 'Tai Toon Baan',
      type: 'Restaurant',
      city: 'Chiang Mai',
      latitude: 18.79210626514222, 
      longitude: 98.99534619999957,
      rating: 4.8,
      image: taitoonbaan,
      phone: '+1 (555) 123-4567',
      hours: '7:00 AM - 9:00 PM',
      description: 'Premium coffee and artisanal desserts in a cozy atmosphere',
    },
    {
      id: 2,
      name: 'White Rabbit',
      type: 'Beverages',
      city: 'Chiang Mai',
      latitude: 18.79457375170442, 
      longitude: 98.9871313730753,
      rating: 4.6,
      image: white_rabbit,
      phone: '+1 (555) 234-5678',
      hours: '11:00 AM - 11:00 PM',
      description: 'Authentic Italian pizza made with fresh ingredients',
    },
    {
      id: 3,
      name: 'Versailles de Flore',
      type: 'Restaurant',
      city: 'Chiang Mai',
      latitude: 18.795686889496963, 
      longitude: 98.97918708594416,
      rating: 4.9,
      image: versaile,
      phone: '+1 (555) 345-6789',
      hours: '12:00 PM - 10:00 PM',
      description: 'Fresh sushi and traditional Japanese dishes',
    },
    {
      id: 4,
      name: 'The Sax',
      type: 'Beverages',
      city: 'Chiang Mai',
      latitude: 18.80070339757342,
      longitude: 98.96800241540333,
      rating: 4.4,
      image: sax,
      phone: '+1 (555) 456-7890',
      hours: '10:00 AM - 12:00 AM',
      description: 'Gourmet burgers and crispy fries',
    },
    {
      id: 5,
      name: 'Matchappen',
      type: 'Coffee & Deserts',
      city: 'Chiang Mai',
      latitude: 18.83660650511071,
      longitude: 99.0076904403956,
      rating: 4.7,
      image: matcha,
      phone: '+1 (555) 567-8901',
      hours: '8:00 AM - 8:00 PM',
      description: 'Fresh salads, smoothies, and healthy options',
    },
    {
      id: 6,
      name: 'Come True Cafe',
      type: 'Coffee & Deserts',
      city: 'Kuala Lumpur',
      latitude: 3.1508999154009265, 
      longitude: 101.61523084010264,
      rating: 4.7,
      image: come_true_cafe,
      phone: '+60125628150',
      hours: '8:00 AM - 8:00 PM',
      description: 'Steps into dreams to find expression in the art of coffee brewing',
    },
    {
      id: 7,
      name: 'Zhang Lala Mee Tarik',
      type: 'Restaurant',
      city: 'Kuala Lumpur',
      latitude: 3.145256933974581,  
      longitude: 101.70920651179703,
      rating: 4.5,
      image: zhang_lala,
      phone: '+60176666989',
      hours: '8:00 AM - 8:00 PM',
      description: 'Famous Noodles Chinese Restaurant',
    },
    {
      id: 8,
      name: 'Fatt Kee Roast Fish',
      type: 'Restaurant',
      city: 'Kuala Lumpur',
      latitude: 3.134100932844353,   
      longitude: 101.7178196922422,
      rating: 3.7,
      image: fatt_kee,
      phone: '+60392263310',
      hours: '8:00 AM - 8:00 PM',
      description: 'Chinese restaurant consistently attracts food lovers with its bold, and spicy seafood offering',
    },
    {
      id: 9,
      name: 'Mantra Rooftop Bar & Lounge',
      type: 'Beverages',
      city: 'Kuala Lumpur',
      latitude: 3.130762841002217,     
      longitude: 101.67153123815568,
      rating: 4.5,
      image: mantra_bar,
      phone: '+60173448299',
      hours: '8:00 AM - 8:00 PM',
      description: 'Famous and Luxury Bar located at tallest rooftop',
    },
    {
      id: 10,
      name: 'Mil Toast House',
      type: 'Coffee & Desserts',
      city: 'Kuala Lumpur',
      latitude: 3.1427845661664073,      
      longitude: 101.7187573549815,
      rating: 4.5,
      image: mil_toast,
      phone: '',
      hours: '8:00 AM - 8:00 PM',
      description: 'A Korean Dessert Paradise in Malaysia',
    },
  ];

  const cities = ['All', 'Chiang Mai', 'Kuala Lumpur'];
  
  const filteredStores = selectedCity === 'All' 
    ? partnerStores 
    : partnerStores.filter(store => store.city === selectedCity);

  const getMapRegion = () => {
    if (selectedCity === 'Kuala Lumpur') {
      return {
        latitude: 3.1390,
        longitude: 101.6869,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    } else if (selectedCity === 'Chiang Mai') {
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
  useEffect(() => {
    getUserLocation();
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
      <View style={styles.header}>
        <Text style={styles.title}>Partner Stores</Text>
        <Text style={styles.subtitle}>{filteredStores.length} locations {selectedCity === 'All' ? 'total' : `in ${selectedCity}`}</Text>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={styles.cityDropdown}
          onPress={() => setShowCityDropdown(true)}
        >
          <Text style={styles.cityDropdownText}>{selectedCity}</Text>
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
          {filteredStores.map((store) => (
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
              <Image source={selectedStore.image} style={styles.storeImage} />
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
              <View style={styles.contactItem}>
                <Phone size={16} color="#64748B" />
                <Text style={styles.contactText}>{selectedStore.phone}</Text>
              </View>
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
        visible={showCityDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCityDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowCityDropdown(false)}
        >
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Location</Text>
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.dropdownItem,
                  selectedCity === city && styles.selectedDropdownItem
                ]}
                onPress={() => {
                  setSelectedCity(city);
                  setShowCityDropdown(false);
                  setSelectedStore(null); // Clear selected store when changing city
                }}
              >
                <Text style={[
                  styles.dropdownItemText,
                  selectedCity === city && styles.selectedDropdownItemText
                ]}>
                  {city}
                </Text>
                {city !== 'All' && (
                  <Text style={styles.storeCount}>
                    {partnerStores.filter(store => store.city === city).length} stores
                  </Text>
                )}
              </TouchableOpacity>
            ))}
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
  cityDropdown: {
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
  cityDropdownText: {
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
    padding: 20,
    margin: 20,
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDropdownItem: {
    backgroundColor: '#F33F32',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
  },
  selectedDropdownItemText: {
    color: 'white',
  },
  storeCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
});