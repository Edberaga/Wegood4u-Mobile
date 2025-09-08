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
import { Upload, Camera, MapPin, Calendar, CircleCheck as CheckCircle, Clock, ChevronDown, Gift, Star, Award, Coffee, UtensilsCrossed, Store, Mail, Phone, FileText, X, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { useUser } from '@/context/UserContext';

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

interface BadgeLevel {
  level: number;
  requirement: number;
  achieved: boolean;
  progress: number;
}

interface BadgeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  levels: BadgeLevel[];
}

export default function TasksScreen() {
  const { userData, isLoading: userLoading, refreshUserData, resendEmailConfirmation } = useUser();
  const [activeTab, setActiveTab] = useState<'submit' | 'rewards'>('submit');
  
  // Form states
  const [selectedStore, setSelectedStore] = useState<PartnerStore | null>(null);
  const [receiptPhoto, setReceiptPhoto] = useState<string | null>(null);
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(null);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  const isEmailConfirmed = !!userData.emailConfirmedAt;
  const partnerStores: PartnerStore[] = [
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

  // Calculate achievements
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const totalPoints = approvedSubmissions.length * 10;
  
  // Count visits by store type
  const getStoreType = (restaurantName: string) => {
    const store = partnerStores.find(s => s.name === restaurantName);
    return store?.type || '';
  };
  
  const totalVisits = approvedSubmissions.length;
  const cafeVisits = approvedSubmissions.filter(s => {
    const storeType = getStoreType(s.restaurantName);
    return storeType === 'Coffee & Desserts';
  }).length;
  const restaurantVisits = approvedSubmissions.filter(s => {
    const storeType = getStoreType(s.restaurantName);
    return storeType === 'Restaurant';
  }).length;

  const createBadgeLevels = (currentCount: number): BadgeLevel[] => {
    const requirements = [10, 20, 30, 40];
    return requirements.map((req, index) => ({
      level: index + 1,
      requirement: req,
      achieved: currentCount >= req,
      progress: Math.min((currentCount / req) * 100, 100),
    }));
  };

  const badgeCategories: BadgeCategory[] = [
    {
      id: 'any',
      name: 'Explorer',
      icon: <Store size={24} color="#8B5CF6" />,
      color: '#8B5CF6',
      bgColor: '#F3F4F6',
      levels: createBadgeLevels(totalVisits),
    },
    {
      id: 'cafe',
      name: 'Coffee Lover',
      icon: <Coffee size={24} color="#F59E0B" />,
      color: '#F59E0B',
      bgColor: '#FEF3C7',
      levels: createBadgeLevels(cafeVisits),
    },
    {
      id: 'restaurant',
      name: 'Foodie',
      icon: <UtensilsCrossed size={24} color="#EF4444" />,
      color: '#EF4444',
      bgColor: '#FEE2E2',
      levels: createBadgeLevels(restaurantVisits),
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

  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    try {
      await resendEmailConfirmation();
      Alert.alert('Success', 'Confirmation email sent! Please check your inbox.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsResendingEmail(false);
    }
  };

  const navigateToQuestionnaire = () => {
    router.push('/question');
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
    const isEmailConfirmed = !!userData.emailConfirmedAt;
    const isPhoneConfirmed = !!userData.phoneConfirmedAt;
    const isQuestionnaireComplete = userData.verificationCompleted;
    const stepsCompleted = (isEmailConfirmed ? 1 : 0) + (isQuestionnaireComplete ? 1 : 0);
    const allStepsCompleted = stepsCompleted === 2;
    const handleRequestMember = () => {
      Alert.alert(
        'Request Submitted',
        'Your request to become a Member has been recorded. Our team will review it shortly.'
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Unverified Member</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.verificationContainer}>
            <Text style={styles.verificationTitle}>Verification Checklist</Text>
            <Text style={styles.verificationSubtitle}>
              Complete all steps below to become a verified member and unlock travel proof uploads and rewards.
            </Text>

            {/* Email Confirmation */}
            <View style={styles.checklistItem}>
              <View style={styles.checklistHeader}>
                <View style={styles.checklistIconContainer}>
                  <Mail size={20} color={isEmailConfirmed ? '#22C55E' : '#64748B'} />
                </View>
                <View style={styles.checklistContent}>
                  <Text style={styles.checklistTitle}>Confirm Email Address</Text>
                  <Text style={styles.checklistDescription}>
                    {isEmailConfirmed 
                      ? 'Your email has been confirmed' 
                      : 'Please check your email and click the confirmation link'
                    }
                  </Text>
                </View>
                <View style={styles.checklistStatus}>
                  {isEmailConfirmed ? (
                    <CheckCircle size={24} color="#22C55E" />
                  ) : (
                    <X size={24} color="#EF4444" />
                  )}
                </View>
              </View>
              {!isEmailConfirmed && (
                <TouchableOpacity
                  style={[styles.actionButton, isResendingEmail && styles.actionButtonDisabled]}
                  onPress={handleResendEmail}
                  disabled={isResendingEmail}
                >
                  <Mail size={16} color="#F33F32" />
                  <Text style={styles.actionButtonText}>
                    {isResendingEmail ? 'Sending...' : 'Resend Confirmation Email'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Questionnaire */}
            <View style={styles.checklistItem}>
              <View style={styles.checklistHeader}>
                <View style={styles.checklistIconContainer}>
                  <FileText size={20} color={isQuestionnaireComplete ? '#22C55E' : '#64748B'} />
                </View>
                <View style={styles.checklistContent}>
                  <Text style={styles.checklistTitle}>Fill the Questionnaire Form</Text>
                  <Text style={styles.checklistDescription}>
                    {isQuestionnaireComplete 
                      ? 'Questionnaire has been completed' 
                      : 'Complete the travel questionnaire to help us serve you better'
                    }
                  </Text>
                </View>
                <View style={styles.checklistStatus}>
                  {isQuestionnaireComplete ? (
                    <CheckCircle size={24} color="#22C55E" />
                  ) : (
                    <X size={24} color="#EF4444" />
                  )}
                </View>
              </View>
              {!isQuestionnaireComplete && (
                <TouchableOpacity style={styles.actionButton} onPress={navigateToQuestionnaire}>
                  <FileText size={16} color="#F33F32" />
                  <Text style={styles.actionButtonText}>Fill Out Verification Form</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Progress Summary */}
            <View style={styles.progressSummary}>
              <Text style={styles.progressTitle}>Verification Progress</Text>
              <Text style={styles.progressDescription}>
                Once you have completed all the verification requirements, please click the button to request the Member Role
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${stepsCompleted / 2 * 100}%` 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {stepsCompleted} of 2 steps completed
              </Text>

              <TouchableOpacity
                style={[styles.requestButton, !allStepsCompleted && styles.requestButtonDisabled]}
                onPress={handleRequestMember}
                disabled={!allStepsCompleted}
              >
                <Text style={styles.requestButtonText}>Request to be Member</Text>
              </TouchableOpacity>

              {!allStepsCompleted && (
                <Text style={styles.requestHintText}>✗ Please complete all requirements to be a member</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render main task view for members and affiliates
  const groupedStores = partnerStores.reduce((acc, store) => {
    if (!acc[store.city]) {
      acc[store.city] = [];
    }
    acc[store.city].push(store);
    return acc;
  }, {} as Record<string, PartnerStore[]>);

  const renderProgressBar = (progress: number, color: string) => (
    <View style={styles.progressBarSmall}>
      <View style={[styles.progressFillSmall, { width: `${progress}%`, backgroundColor: color }]} />
    </View>
  );

  const renderBadgeLevel = (category: BadgeCategory, level: BadgeLevel) => (
    <View key={level.level} style={[styles.badgeLevel, level.achieved && styles.achievedBadge]}>
      <View style={[styles.badgeIcon, { backgroundColor: level.achieved ? category.color : '#F3F4F6' }]}>
        {level.achieved ? (
          <Star size={16} color="white" fill="white" />
        ) : (
          <Text style={styles.badgeLevelNumber}>{level.level}</Text>
        )}
      </View>
      <View style={styles.badgeInfo}>
        <Text style={[styles.badgeLevelText, level.achieved && styles.achievedBadgeText]}>
          Level {level.level}
        </Text>
        <Text style={styles.badgeRequirement}>
          {level.requirement} visits
        </Text>
        {!level.achieved && renderProgressBar(level.progress, category.color)}
      </View>
      {level.achieved && (
        <CheckCircle size={20} color={category.color} />
      )}
    </View>
  );

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
            {/* Points Summary */}
            <View style={styles.pointsCard}>
              <View style={styles.pointsHeader}>
                <Star size={32} color="#F59E0B" fill="#F59E0B" />
                <View style={styles.pointsInfo}>
                  <Text style={styles.pointsNumber}>{totalPoints}</Text>
                  <Text style={styles.pointsLabel}>Token Points</Text>
                </View>
              </View>
              <Text style={styles.pointsDescription}>
                Earn 10 points for each approved submission
              </Text>
            </View>

            {/* Achievement Summary */}
            <View style={styles.achievementSummary}>
              <Text style={styles.sectionTitle}>Achievement Progress</Text>
              <View style={styles.summaryStats}>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>{totalVisits}</Text>
                  <Text style={styles.summaryLabel}>Total Visits</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>{cafeVisits}</Text>
                  <Text style={styles.summaryLabel}>Café Visits</Text>
                </View>
                <View style={styles.summaryStat}>
                  <Text style={styles.summaryNumber}>{restaurantVisits}</Text>
                  <Text style={styles.summaryLabel}>Restaurant Visits</Text>
                </View>
              </View>
            </View>

            {/* Badge Categories */}
            {badgeCategories.map((category) => (
              <View key={category.id} style={styles.badgeCategory}>
                <View style={styles.categoryHeader}>
                  <View style={[styles.categoryIconContainer, { backgroundColor: category.bgColor }]}>
                    {category.icon}
                  </View>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryProgress}>
                      {category.levels.filter(l => l.achieved).length} of {category.levels.length} badges earned
                    </Text>
                  </View>
                </View>

                <View style={styles.badgeLevels}>
                  {category.levels.map((level) => renderBadgeLevel(category, level))}
                </View>
              </View>
            ))}

            {/* Tips Section */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Tips to Earn More Badges</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Visit different types of partner stores</Text>
                <Text style={styles.tipItem}>• Take clear photos of your receipt and selfie</Text>
                <Text style={styles.tipItem}>• Submit proof within 24 hours of your visit</Text>
                <Text style={styles.tipItem}>• Check out our partner stores in different cities</Text>
              </View>
            </View>
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
  verificationContainer: {
    padding: 20,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  verificationSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  checklistItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checklistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checklistIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  checklistContent: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  checklistDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 18,
  },
  checklistStatus: {
    marginLeft: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#F33F32',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonText: {
    color: '#F33F32',
    fontSize: 14,
    fontWeight: '600',
  },
  progressSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F33F32',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  requestButton: {
    marginTop: 12,
    backgroundColor: '#F33F32',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    opacity: 0.6,
  },
  requestButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  requestHintText: {
    marginTop: 8,
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  rewardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  pointsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  pointsInfo: {
    flex: 1,
  },
  pointsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  pointsLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  pointsDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  achievementSummary: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryStat: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F33F32',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  badgeCategory: {
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
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  categoryProgress: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  badgeLevels: {
    gap: 12,
  },
  badgeLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  achievedBadge: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  badgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLevelNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
  },
  badgeInfo: {
    flex: 1,
  },
  badgeLevelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  achievedBadgeText: {
    color: '#22C55E',
  },
  badgeRequirement: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  progressBarSmall: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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