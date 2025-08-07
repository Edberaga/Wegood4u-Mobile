import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Upload, Camera, MapPin, Calendar, CircleCheck as CheckCircle, Clock, ChevronDown, Gift, Star } from 'lucide-react-native';

interface Submission {
  id: number;
  submissionDate: string;
  restaurantName: string;
  receiptPhoto: string;
  selfiePhoto: string;
  status: 'approved' | 'pending';
  points?: number;
}

interface PartnerStore {
  id: number;
  name: string;
  city: string;
  type: string;
}

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<'submit' | 'rewards'>('submit');
  
  // Form states
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partnerStores: PartnerStore[] = [
    // Chiang Mai stores
    { id: 1, name: 'Tai Toon Baan', city: 'Chiang Mai', type: 'Restaurant' },
    { id: 2, name: 'White Rabbit', city: 'Chiang Mai', type: 'Beverages' },
    { id: 3, name: 'Versailles de Flore', city: 'Chiang Mai', type: 'Restaurant' },
    { id: 4, name: 'The Sax', city: 'Chiang Mai', type: 'Beverages' },
    { id: 5, name: 'Matchappen', city: 'Chiang Mai', type: 'Coffee & Desserts' },
    
    // Kuala Lumpur stores
    { id: 6, name: 'Come True Cafe', city: 'Kuala Lumpur', type: 'Coffee & Desserts' },
    { id: 7, name: 'Zhang Lala Mee Tarik', city: 'Kuala Lumpur', type: 'Restaurant' },
    { id: 8, name: 'Fatt Kee Roast Fish', city: 'Kuala Lumpur', type: 'Restaurant' },
    { id: 9, name: 'Mantra Rooftop Bar & Lounge', city: 'Kuala Lumpur', type: 'Beverages' },
    { id: 10, name: 'Mil Toast House', city: 'Kuala Lumpur', type: 'Coffee & Desserts' },
  ];

  const submissions: Submission[] = [
    {
      id: 1,
      submissionDate: '2024-01-12',
      restaurantName: 'Tai Toon Baan',
      receiptPhoto: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'approved',
      points: 150,
    },
    {
      id: 2,
      submissionDate: '2024-01-10',
      restaurantName: 'White Rabbit',
      receiptPhoto: 'https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'pending',
    },
    {
      id: 3,
      submissionDate: '2024-01-08',
      restaurantName: 'Come True Cafe',
      receiptPhoto: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      selfiePhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      status: 'approved',
      points: 200,
    },
  ];

  const pickImage = async (type: 'receipt' | 'selfie') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'receipt' ? [4, 3] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'receipt') {
        setReceiptPhoto(result.assets[0].uri);
      } else {
        setSelfiePhoto(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (type: 'receipt' | 'selfie') => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: type === 'receipt' ? [4, 3] : [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      if (type === 'receipt') {
        setReceiptPhoto(result.assets[0].uri);
      } else {
        setSelfiePhoto(result.assets[0].uri);
      }
    }
  };

  const showImagePicker = (type: 'receipt' | 'selfie') => {
    Alert.alert(
      'Select Photo',
      'Choose how you want to add your photo',
      [
        { text: 'Camera', onPress: () => takePhoto(type) },
        { text: 'Gallery', onPress: () => pickImage(type) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitProof = async () => {
    if (!selectedStore) {
      Alert.alert('Error', 'Please select a partner store');
      return;
    }
    if (!receiptPhoto) {
      Alert.alert('Error', 'Please upload your receipt photo');
      return;
    }
    if (!selfiePhoto) {
      Alert.alert('Error', 'Please upload your selfie photo');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Success!', 
        'Your proof of travel has been submitted successfully. You will be notified once it\'s reviewed.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setSelectedStore(null);
              setReceiptPhoto(null);
              setSelfiePhoto(null);
            }
          }
        ]
      );
    }, 2000);
  };

  const groupedStores = partnerStores.reduce((acc, store) => {
    if (!acc[store.city]) {
      acc[store.city] = [];
    }
    acc[store.city].push(store);
    return acc;
  }, {} as Record<string, PartnerStore[]>);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'submit' ? (
          <View style={styles.submitContainer}>
            {/* Partner Store Selection */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Select Partner Store</Text>
              <TouchableOpacity
                style={styles.storeSelector}
                onPress={() => setShowStoreDropdown(true)}
              >
                <Text style={[styles.storeSelectorText, !selectedStore && styles.placeholderText]}>
                  {selectedStore ? `${selectedStore.name} (${selectedStore.city})` : 'Choose a partner store'}
                </Text>
                <ChevronDown size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Receipt Photo Upload */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Receipt Photo</Text>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => showImagePicker('receipt')}
              >
                {receiptPhoto ? (
                  <Image source={{ uri: receiptPhoto }} style={styles.uploadedPhoto} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Camera size={32} color="#64748B" />
                    <Text style={styles.uploadPlaceholderText}>Upload Receipt</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Selfie Photo Upload */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Selfie at Restaurant</Text>
              <TouchableOpacity
                style={styles.photoUpload}
                onPress={() => showImagePicker('selfie')}
              >
                {selfiePhoto ? (
                  <Image source={{ uri: selfiePhoto }} style={styles.uploadedPhoto} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Camera size={32} color="#64748B" />
                    <Text style={styles.uploadPlaceholderText}>Upload Selfie</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={submitProof}
              disabled={isSubmitting}
            >
              <Upload size={20} color="white" />
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Submitting...' : 'Submit Proof'}
              </Text>
            </TouchableOpacity>

            {/* Submissions Table */}
            <View style={styles.tableSection}>
              <Text style={styles.tableTitle}>Your Submissions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.dateColumn]}>Date</Text>
                    <Text style={[styles.tableHeaderText, styles.restaurantColumn]}>Restaurant</Text>
                    <Text style={[styles.tableHeaderText, styles.photoColumn]}>Receipt</Text>
                    <Text style={[styles.tableHeaderText, styles.photoColumn]}>Selfie</Text>
                    <Text style={[styles.tableHeaderText, styles.statusColumn]}>Status</Text>
                  </View>

                  {/* Table Rows */}
                  {submissions.map((submission) => (
                    <View key={submission.id} style={styles.tableRow}>
                      <Text style={[styles.tableCellText, styles.dateColumn]}>
                        {submission.submissionDate}
                      </Text>
                      <Text style={[styles.tableCellText, styles.restaurantColumn]}>
                        {submission.restaurantName}
                      </Text>
                      <View style={[styles.tableCell, styles.photoColumn]}>
                        <Image source={{ uri: submission.receiptPhoto }} style={styles.tablePhoto} />
                      </View>
                      <View style={[styles.tableCell, styles.photoColumn]}>
                        <Image source={{ uri: submission.selfiePhoto }} style={styles.tablePhoto} />
                      </View>
                      <View style={[styles.tableCell, styles.statusColumn]}>
                        <View style={[
                          styles.statusBadge,
                          submission.status === 'approved' ? styles.approvedBadge : styles.pendingBadge
                        ]}>
                          {submission.status === 'approved' ? (
                            <CheckCircle size={12} color="#22C55E" />
                          ) : (
                            <Clock size={12} color="#F59E0B" />
                          )}
                          <Text style={[
                            styles.statusText,
                            submission.status === 'approved' ? styles.approvedText : styles.pendingText
                          ]}>
                            {submission.status === 'approved' ? 'Approved' : 'Pending'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.rewardsContainer}>
            <Text style={styles.rewardsTitle}>View Rewards</Text>
            <Text style={styles.rewardsSubtitle}>Coming soon...</Text>
          </View>
        )}
      </ScrollView>

      {/* Store Selection Modal */}
      {showStoreDropdown && (
        <View style={styles.modalOverlay}>
          <View style={styles.storeModal}>
            <Text style={styles.modalTitle}>Select Partner Store</Text>
            <ScrollView style={styles.storeList} showsVerticalScrollIndicator={false}>
              {Object.entries(groupedStores).map(([city, stores]) => (
                <View key={city}>
                  <Text style={styles.cityHeader}>{city}</Text>
                  {stores.map((store) => (
                    <TouchableOpacity
                      key={store.id}
                      style={[
                        styles.storeItem,
                        selectedStore?.id === store.id && styles.selectedStoreItem
                      ]}
                      onPress={() => {
                        setSelectedStore(store);
                        setShowStoreDropdown(false);
                      }}
                    >
                      <Text style={[
                        styles.storeItemText,
                        selectedStore?.id === store.id && styles.selectedStoreItemText
                      ]}>
                        • {store.name}
                      </Text>
                      <Text style={[
                        styles.storeTypeText,
                        selectedStore?.id === store.id && styles.selectedStoreTypeText
                      ]}>
                        {store.type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowStoreDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  storeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  storeSelectorText: {
    fontSize: 16,
    color: '#1e293b',
  },
  placeholderText: {
    color: '#64748b',
  },
  photoUpload: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F33F32',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tableSection: {
    marginTop: 32,
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableCell: {
    justifyContent: 'center',
  },
  tableCellText: {
    fontSize: 14,
    color: '#1e293b',
  },
  dateColumn: {
    width: 80,
  },
  restaurantColumn: {
    width: 120,
  },
  photoColumn: {
    width: 60,
  },
  statusColumn: {
    width: 80,
  },
  tablePhoto: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  approvedBadge: {
    backgroundColor: '#f0fdf4',
  },
  pendingBadge: {
    backgroundColor: '#fefce8',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  approvedText: {
    color: '#22C55E',
  },
  pendingText: {
    color: '#F59E0B',
  },
  rewardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  rewardsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  rewardsSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
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
  cityHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F33F32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fef2f2',
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  storeItem: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedStoreItem: {
    backgroundColor: '#F33F32',
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