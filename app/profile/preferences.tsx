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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, Save } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { countries } from '@/data/countries';
import DropdownWithOthers from '@/components/DropdownWithOthers';
import type { UserPreferenceData } from '@/types';

export default function PreferencesScreen() {
  const { preferenceData, updatePreferences, isPreferenceLoading } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Form state
  const [preferences, setPreferences] = useState<UserPreferenceData>({
    countryOfResidence: '',
    preferredCommunicationChannel: 'WhatsApp',
    communicationContactDetails: '',
    travelDestinationCategory: '',
    travelDestinationDetail: '',
    travelPreference: '',
    accommodationPreference: '',
    travelBudget: '',
  });

  const [originalPreferences, setOriginalPreferences] = useState<UserPreferenceData>({
    countryOfResidence: '',
    preferredCommunicationChannel: 'WhatsApp',
    communicationContactDetails: '',
    travelDestinationCategory: '',
    travelDestinationDetail: '',
    travelPreference: '',
    accommodationPreference: '',
    travelBudget: '',
  });

  const communicationChannels: ('WhatsApp' | 'Telegram' | 'Line' | 'WeChat')[] = ['WhatsApp', 'Telegram', 'Line', 'WeChat'];
  const travelDestinations = ['Beach Destinations', 'Cultural Destinations', 'Adventure Destinations', 'Urban Destinations'];
  const travelPreferenceOptions = ['Adventure Travel', 'Relaxation Travel', 'Cultural Travel', 'Family Travel', 'Solo Travel', 'Luxury Travel', 'Others'];
  const accommodationTypes = ['Hotels', 'Hostels', 'Vacation Rentals', 'Resorts', 'Bed and Breakfasts/Guesthouses', 'Alternative Accommodations', 'Others'];
  const budgetRanges = [
    'Budget Travel: $500 - $1,000',
    'Mid-range Travel: $1,000 - $3,000',
    'Luxury Travel: $3,000 - $10,000',
    'Ultra-Luxury Travel: $10,000 - $20,000',
    'Other (please specify)'
  ];

  useEffect(() => {
    if (preferenceData) {
      const loadedPreferences: UserPreferenceData = {
        countryOfResidence: preferenceData.countryOfResidence || '',
        preferredCommunicationChannel: preferenceData.preferredCommunicationChannel || 'WhatsApp',
        communicationContactDetails: preferenceData.communicationContactDetails || '',
        travelDestinationCategory: preferenceData.travelDestinationCategory || '',
        travelDestinationDetail: preferenceData.travelDestinationDetail || '',
        travelPreference: preferenceData.travelPreference || '',
        accommodationPreference: preferenceData.accommodationPreference || '',
        travelBudget: preferenceData.travelBudget || '',
      };
      
      setPreferences(loadedPreferences);
      setOriginalPreferences(loadedPreferences);
    }
  }, [preferenceData]);

  // Check for changes whenever preferences update
  useEffect(() => {
    const hasChangedValues = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
    setHasChanges(hasChangedValues);
  }, [preferences, originalPreferences]);

  const handleUpdatePreferences = async () => {
    setIsLoading(true);
    try {
      await updatePreferences(preferences);
      setOriginalPreferences(preferences); // Update original to match current
      setHasChanges(false);
      Alert.alert('Success', 'Your preferences have been updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
      console.error('Error updating preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = <K extends keyof UserPreferenceData>(
    key: K,
    value: UserPreferenceData[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const renderSimpleDropdown = (
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

  if (isPreferenceLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#206E56" />
          <Text style={styles.loadingText}>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Preferences</Text>
        <TouchableOpacity 
          onPress={handleUpdatePreferences} 
          style={styles.saveButton} 
          disabled={isLoading || !hasChanges}
        >
          {isLoading ? (
            <ActivityIndicator size={20} color="#206E56" />
          ) : (
            <Save size={20} color={hasChanges ? "#206E56" : "#9CA3AF"} />
          )}
        </TouchableOpacity>
      </View>

      {hasChanges && (
        <View style={styles.changesIndicator}>
          <Text style={styles.changesText}>You have unsaved changes</Text>
        </View>
      )}

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
          {renderSimpleDropdown(
            'Preferred Communication Channel',
            preferences.preferredCommunicationChannel || '',
            communicationChannels,
            (value) => updatePreference('preferredCommunicationChannel', value as any)
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contact Details</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your contact details"
              value={preferences.communicationContactDetails || ''}
              onChangeText={(text) => updatePreference('communicationContactDetails', text)}
            />
          </View>
        </View>

        {/* Travel Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Travel Preferences</Text>
          {renderSimpleDropdown(
            'Travel Destination Category',
            preferences.travelDestinationCategory || '',
            travelDestinations,
            (value) => updatePreference('travelDestinationCategory', value)
          )}
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Specific Destination</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter specific destinations"
              value={preferences.travelDestinationDetail || ''}
              onChangeText={(text) => updatePreference('travelDestinationDetail', text)}
            />
          </View>
          
          <DropdownWithOthers
            label="Travel Style"
            value={preferences.travelPreference || ''}
            options={travelPreferenceOptions}
            onSelect={(value) => updatePreference('travelPreference', value)}
            placeholder="Enter your travel style"
          />
          
          <DropdownWithOthers
            label="Accommodation Preference"
            value={preferences.accommodationPreference || ''}
            options={accommodationTypes}
            onSelect={(value) => updatePreference('accommodationPreference', value)}
            placeholder="Enter your accommodation preference"
          />
          
          <DropdownWithOthers
            label="Travel Budget"
            value={preferences.travelBudget || ''}
            options={budgetRanges}
            onSelect={(value) => updatePreference('travelBudget', value)}
            placeholder="Enter your budget range"
          />
        </View>

        {/* Update Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!hasChanges || isLoading) && styles.updateButtonDisabled
            ]}
            onPress={handleUpdatePreferences}
            disabled={!hasChanges || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={24} color="white" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text style={styles.updateButtonText}>Update Preferences</Text>
              </>
            )}
          </TouchableOpacity>
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
                    updatePreference('countryOfResidence', country.name);
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#64748B',
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
  changesIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F59E0B',
  },
  changesText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
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
    overflow: 'hidden',
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
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#206E56',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  updateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
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