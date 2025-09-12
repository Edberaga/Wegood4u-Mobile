import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  Star,
  MapPin,
  Gift,
  Upload,
  Share2,
  Trophy,
  Clock,
  ChevronRight,
  UtensilsCrossed,
  Coffee,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { fetchPartnerStores } from '@/data/partnerStore';
import type { PartnerStore } from '@/types';

export default function HomeScreen() {
  const { user } = useAuth();
  const { userData } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [partnerStores, setPartnerStores] = useState<PartnerStore[]>([]);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<PartnerStore[]>([]);
  const [recommendedCafes, setRecommendedCafes] = useState<PartnerStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const userStats = {
    totalPoints: 2450,
    tasksCompleted: 12,
    vouchersEarned: 8,
    memberSince: 'January 2024',
  };

  const recentAchievements = [
    { id: 1, title: 'First Review', description: 'Posted your first restaurant review', date: '2024-01-10' },
    { id: 2, title: 'Point Collector', description: 'Earned 1000 points', date: '2024-01-08' },
    { id: 3, title: 'Social Butterfly', description: 'Referred 3 friends', date: '2024-01-05' },
  ];

  // Load partner stores and filter recommendations
  useEffect(() => {
    loadPartnerStores();
  }, []);

  const loadPartnerStores = async () => {
    try {
      setIsLoading(true);
      const stores = await fetchPartnerStores();
      setPartnerStores(stores);

      // Filter and sort restaurants by rating (top 6)
      const restaurants = stores
        .filter(store => store.type.toLowerCase().includes('restaurant') || 
                        store.type.toLowerCase().includes('italian') ||
                        store.type.toLowerCase().includes('japanese') ||
                        store.type.toLowerCase().includes('fast food') ||
                        store.type.toLowerCase().includes('healthy food'))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

      // Filter and sort cafes by rating (top 6)
      const cafes = stores
        .filter(store => store.type.toLowerCase().includes('coffee') || 
                        store.type.toLowerCase().includes('dessert') ||
                        store.type.toLowerCase().includes('cafe'))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);

      setRecommendedRestaurants(restaurants);
      setRecommendedCafes(cafes);
    } catch (error) {
      console.error('Error loading partner stores:', error);
      Alert.alert('Error', 'Failed to load partner stores');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setUploadedImage(result.assets[0].uri);
      Alert.alert('Success', 'Proof of travel uploaded successfully!');
    }
  };

  const shareReferralCode = () => {
    Alert.alert('Referral Code', 'Your referral code: WG4U2024\nShare with friends to earn rewards!');
  };

  const renderStoreCard = (store: PartnerStore, index: number) => (
    <TouchableOpacity key={store.id} style={styles.storeCard}>
      <Image source={{ uri: store.image }} style={styles.storeImage} />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
        <Text style={styles.storeType} numberOfLines={1}>{store.type}</Text>
        <View style={styles.storeRating}>
          <Star size={12} color="#FFD700" fill="#FFD700" />
          <Text style={styles.rating}>{store.rating}</Text>
        </View>
        <View style={styles.storeLocation}>
          <MapPin size={10} color="#64748B" />
          <Text style={styles.locationText} numberOfLines={1}>{store.city}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendationSection = (title: string, stores: PartnerStore[], icon: React.ReactNode) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          {icon}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.seeAllButton}>
          <Text style={styles.seeAllText}>See All</Text>
          <ChevronRight size={16} color="#206E56" />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      ) : stores.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storeList}>
          {stores.map((store, index) => renderStoreCard(store, index))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {title.toLowerCase()} available</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={['#206E56', '#CBEED2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.username}>{userData?.fullName || userData?.username || 'User'}</Text>
          </View>
        </LinearGradient>

        {/* Advertisement Banner */}
        <View style={styles.section}>
          <View style={styles.advertisementBanner}>
            <Text style={styles.advertisementText}>Advertisement</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
              <View style={styles.actionIcon}>
                <Camera size={24} color="#206E56" />
              </View>
              <Text style={styles.actionText}>Upload Proof</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={shareReferralCode}>
              <View style={styles.actionIcon}>
                <Share2 size={24} color="#00A85A" />
              </View>
              <Text style={styles.actionText}>Share Code</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Gift size={24} color="#E5C69E" />
              </View>
              <Text style={styles.actionText}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recommended Restaurants */}
        {renderRecommendationSection(
          'Recommended Restaurant', 
          recommendedRestaurants, 
          <UtensilsCrossed size={20} color="#EF4444" />
        )}

        {/* Recommended Cafes */}
        {renderRecommendationSection(
          'Recommended Cafe', 
          recommendedCafes, 
          <Coffee size={20} color="#F59E0B" />
        )}

        {/* Uploaded Image */}
        {uploadedImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Upload</Text>
            <View style={styles.uploadedImageContainer}>
              <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
              <View style={styles.uploadBadge}>
                <Upload size={16} color="white" />
                <Text style={styles.uploadBadgeText}>Proof Uploaded</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activityList}>
            {recentAchievements.map((achievement) => (
              <View key={achievement.id} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Trophy size={20} color="#E5C69E" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{achievement.title}</Text>
                  <Text style={styles.activitySubtitle}>{achievement.description}</Text>
                </View>
                <Text style={styles.activityTime}>2h ago</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#206E56',
  },
  advertisementBanner: {
    backgroundColor: '#9CA3AF',
    borderRadius: 16,
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  advertisementText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  storeList: {
    paddingRight: 20,
  },
  storeCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: 90,
  },
  storeInfo: {
    padding: 12,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  storeType: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 10,
    color: '#64748b',
    marginLeft: 2,
  },
  uploadedImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  uploadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22c55e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  uploadBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  activityList: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
});