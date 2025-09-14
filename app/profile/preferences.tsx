import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/lib/supabase';
import { countries } from '@/data/countries';

export default function PreferencesScreen() {
  const { userData, refreshUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  
  // Form state
  const [preferences, setPreferences] = useState({
    countryOfResidence: '',
    communicationChannel: 'WhatsApp',
    communicationDetails: '',
    travelDestinationCategory: '',
    travelDestinationDetail: '',
    travelPreference: '',
    accommodationPreference: '',
    travelBudget: '',
  });

  const communicationChannels = ['WhatsApp', 'Telegram', 'Line', 'WeChat'];
  const travelDestinations = ['Beach Destinations', 'Cultural Destinations', 'Adventure Destinations', 'Urban Destinations'];
  const travelPreferenceOptions = ['Adventure Travel', 'Relaxation Travel', 'Cultural Travel', 'Family Travel', 'Solo Travel', 'Luxury Travel', 'Others'];
  const accommodationTypes = ['Hotels', 'Hostels', 'Vacation Rentals', 'Resorts', 'Bed and Breakfasts/Guesthouses', 'Alternative Accommodations'];
  const budgetRanges = [
    'Budget Travel: $500 - $1,000',
    'Mid-range Travel: $1,000 - $3,000',
    'Luxury Travel: $3,000 - $10,000',
    'Ultra-Luxury Travel: $10,000 - $20,000',
    'Other (please specify)'
  ];

  useEffect(() => {
    if (userData) {
      // Load existing preferences from user data
      setPreferences({
        countryOfResidence: userData.countryOfResidence || '',
        communicationChannel: userData.preferredCommunicationChannel || 'WhatsApp',
        communicationDetails: userData.communicationContactDetails || '',
        travelDestinationCategory: userData.travelDestinationCategory || '',
        travelDestinationDetail: userData.travelDestinationDetail || '',
        travelPreference: userData.travelPreference || '',
        accommodationPreference: userData.accommodationPreference || '',
        travelBudget: userData.travelBudget || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          country_of_residence: preferences.countryOfResidence,
          preferred_communication_channel: preferences.communicationChannel as any,
          communication_contact_details: preferences.communicationDetails,
          travel_destination_category: preferences.travelDestinationCategory,
          travel_destination_detail: preferences.travelDestinationDetail,
          travel_preference: preferences.travelPreference,
          accommodation_preference: preferences.accommodationPreference,
          travel_budget: preferences.travelBudget,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData?.id);

      if (error) {
        throw error;
      }

      await refreshUserData();
      Alert.alert('Success', 'Your preferences have been updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
      console.error('Error updating preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdown = (
    label: string,
    value: string,
    options: string[],
    onSelect: (value: string) => void
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.dropdownContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.dropdownOption,
              value === option && styles.selectedDropdownOption
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.dropdownOptionText,
              value === option && styles.selectedDropdownOptionText
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Preferences</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isLoading}>
          <Save size={20} color="#206E56" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Country of Residence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Country of Residence</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCountryModal(true)}
            >
              <Text style={styles.dropdownText}>
                {preferences.countryOfResidence || 'Select Country'}
              </Text>
              <ChevronDown size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Communication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Communication</Text>
          {renderDropdown(
            'Preferred Communication Channel',
            preferences.communicationChannel,
            communicationChannels,
            (value) => setPreferences(prev => ({ ...prev, communicationChannel: value }))
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your contact details"
              value={preferences.communicationDetails}
              onChangeText={(text) => setPreferences(prev => ({ ...prev, communicationDetails: text }))}
            />
          </View>
        </View>

        {/* Travel Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          {renderDropdown(
            'Travel Destination Category',
            preferences.travelDestinationCategory,
            travelDestinations,
            (value) => setPreferences(prev => ({ ...prev, travelDestinationCategory: value }))
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specific Destination</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter specific destinations"
              value={preferences.travelDestinationDetail}
              onChangeText={(text) => setPreferences(prev => ({ ...prev, travelDestinationDetail: text }))}
            />
          </View>
          
          {renderDropdown(
            'Travel Style',
            preferences.travelPreference,
            travelPreferenceOptions,
            (value) => setPreferences(prev => ({ ...prev, travelPreference: value }))
          )}
          
          {renderDropdown(
            'Accommodation Preference',
            preferences.accommodationPreference,
            accommodationTypes,
            (value) => setPreferences(prev => ({ ...prev, accommodationPreference: value }))
          )}
          
          {renderDropdown(
            'Travel Budget',
            preferences.travelBudget,
            budgetRanges,
            (value) => setPreferences(prev => ({ ...prev, travelBudget: value }))
          )}
        </View>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.countryList}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={styles.countryOption}
                  onPress={() => {
                    setPreferences(prev => ({ ...prev, countryOfResidence: country.name }));
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={styles.countryName}>{country.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
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
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1f2937',
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedDropdownOption: {
    backgroundColor: '#f0fdf4',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  selectedDropdownOptionText: {
    color: '#206E56',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalClose: {
    fontSize: 16,
    color: '#206E56',
    fontWeight: '600',
  },
  countryList: {
    flex: 1,
  },
  countryOption: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  countryName: {
    fontSize: 16,
    color: '#1f2937',
  },
});