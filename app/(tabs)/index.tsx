import React, { useState } from 'react';
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
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const { userData } = useUser();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

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
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Trophy size={20} color="#E5C69E" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Task Completed</Text>
                <Text style={styles.activitySubtitle}>Visited Cafe Luna - Earned 150 points</Text>
              </View>
              <Text style={styles.activityTime}>2h ago</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <MapPin size={20} color="#00A85A" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>New Store Added</Text>
                <Text style={styles.activitySubtitle}>Discover Pizza Corner nearby</Text>
              </View>
              <Text style={styles.activityTime}>1d ago</Text>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Share2 size={20} color="#206E56" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>Referral Success</Text>
                <Text style={styles.activitySubtitle}>Friend joined - Earned 200 points</Text>
              </View>
              <Text style={styles.activityTime}>3d ago</Text>
            </View>
          </View>
        </View>

        {/* Featured Stores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Partners</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.storeList}>
              <View style={styles.storeCard}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                  style={styles.storeImage}
                />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>Cafe Luna</Text>
                  <Text style={styles.storeType}>Coffee & Desserts</Text>
                  <View style={styles.storeRating}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.rating}>4.8</Text>
                  </View>
                </View>
              </View>

              <View style={styles.storeCard}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                  style={styles.storeImage}
                />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>Pizza Corner</Text>
                  <Text style={styles.storeType}>Italian Cuisine</Text>
                  <View style={styles.storeRating}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.rating}>4.6</Text>
                  </View>
                </View>
              </View>

              <View style={styles.storeCard}>
                <Image
                  source={{ uri: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                  style={styles.storeImage}
                />
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>Sushi Zen</Text>
                  <Text style={styles.storeType}>Japanese Food</Text>
                  <View style={styles.storeRating}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.rating}>4.9</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
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
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(203, 238, 210, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  points: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
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
  storeList: {
    flexDirection: 'row',
    paddingRight: 20,
  },
  storeCard: {
    width: 160,
    backgroundColor: 'white',
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
    marginBottom: 8,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 4,
  },
});