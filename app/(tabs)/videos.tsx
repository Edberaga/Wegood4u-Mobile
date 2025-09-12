import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play, Heart, Share2, Eye, Clock } from 'lucide-react-native';
import type { Video } from '@/types';

const { width } = Dimensions.get('window');

export default function VideosScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedVideos, setLikedVideos] = useState<number[]>([]);

  const categories = ['All', 'Restaurants', 'Cafes', 'Desserts', 'Street Food', 'Events'];

  const videos: Video[] = [
    {
      id: 1,
      title: 'Amazing Sushi Experience at Zen',
      thumbnail: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '2:45',
      views: 1250,
      likes: 89,
      category: 'Restaurants',
      description: 'Fresh sushi and traditional Japanese atmosphere',
      location: 'Sushi Zen, Harbor District',
    },
    {
      id: 2,
      title: 'Perfect Pizza at Corner',
      thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '1:58',
      views: 892,
      likes: 67,
      category: 'Restaurants',
      description: 'Authentic Italian pizza with fresh ingredients',
      location: 'Pizza Corner, Mall Area',
    },
    {
      id: 3,
      title: 'Cozy Coffee at Luna',
      thumbnail: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '3:12',
      views: 1456,
      likes: 124,
      category: 'Cafes',
      description: 'Premium coffee and artisanal desserts',
      location: 'Cafe Luna, Downtown',
    },
    {
      id: 4,
      title: 'Gourmet Burger Experience',
      thumbnail: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '2:20',
      views: 734,
      likes: 52,
      category: 'Restaurants',
      description: 'Juicy burgers and crispy fries',
      location: 'Burger Palace, Central',
    },
    {
      id: 5,
      title: 'Healthy Bowls & Smoothies',
      thumbnail: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '1:45',
      views: 623,
      likes: 41,
      category: 'Restaurants',
      description: 'Fresh and healthy dining options',
      location: 'Green Garden, Uptown',
    },
    {
      id: 6,
      title: 'Sweet Treats & Desserts',
      thumbnail: 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=400',
      duration: '2:33',
      views: 1089,
      likes: 98,
      category: 'Desserts',
      description: 'Delicious pastries and sweet treats',
      location: 'Sweet Corner, Shopping District',
    },
  ];

  const filteredVideos = selectedCategory === 'All' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const playVideo = (video: Video) => {
    Alert.alert(
      'Play Video',
      `Playing: ${video.title}`,
      [
        { text: 'OK', onPress: () => console.log('Playing video:', video.id) }
      ]
    );
  };

  const toggleLike = (videoId: number) => {
    setLikedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const shareVideo = (video: Video) => {
    Alert.alert(
      'Share Video',
      `Share "${video.title}" with friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => Alert.alert('Shared successfully!') },
      ]
    );
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Video Collection</Text>
        <Text style={styles.subtitle}>Discover amazing food experiences</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category && styles.selectedCategoryButtonText,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.videosContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.videoGrid}>
          {filteredVideos.map((video) => (
            <View key={video.id} style={styles.videoCard}>
              <TouchableOpacity
                style={styles.videoThumbnail}
                onPress={() => playVideo(video)}
              >
                <Image source={{ uri: video.thumbnail }} style={styles.thumbnailImage} />
                <View style={styles.playButton}>
                  <Play size={24} color="white" />
                </View>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.videoInfo}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                  {video.title}
                </Text>
                <Text style={styles.videoLocation} numberOfLines={1}>
                  {video.location}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                  {video.description}
                </Text>

                <View style={styles.videoStats}>
                  <View style={styles.statItem}>
                    <Eye size={14} color="#64748B" />
                    <Text style={styles.statText}>{formatViews(video.views)}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Heart
                      size={14}
                      color={likedVideos.includes(video.id) ? '#EF4444' : '#64748B'}
                      fill={likedVideos.includes(video.id) ? '#EF4444' : 'transparent'}
                    />
                    <Text style={styles.statText}>
                      {video.likes + (likedVideos.includes(video.id) ? 1 : 0)}
                    </Text>
                  </View>
                </View>

                <View style={styles.videoActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.likeButton,
                      likedVideos.includes(video.id) && styles.likedButton,
                    ]}
                    onPress={() => toggleLike(video.id)}
                  >
                    <Heart
                      size={16}
                      color={likedVideos.includes(video.id) ? 'white' : '#64748B'}
                      fill={likedVideos.includes(video.id) ? 'white' : 'transparent'}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        likedVideos.includes(video.id) && styles.likedButtonText,
                      ]}
                    >
                      {likedVideos.includes(video.id) ? 'Liked' : 'Like'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={() => shareVideo(video)}
                  >
                    <Share2 size={16} color="white" />
                    <Text style={[styles.actionButtonText, {color: '#ffffff'}]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
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
  categoriesContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    maxHeight: 78,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#F33F32',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  videosContainer: {
    flex: 1,
  },
  videoGrid: {
    padding: 20,
    gap: 16,
  },
  videoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  videoThumbnail: {
    position: 'relative',
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  videoInfo: {
    padding: 16,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  videoLocation: {
    fontSize: 12,
    color: '#F33F32',
    fontWeight: '600',
    marginBottom: 8,
  },
  videoDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  videoStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  videoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  likeButton: {
    backgroundColor: '#f1f5f9',
  },
  likedButton: {
    backgroundColor: '#EF4444',
  },
  shareButton: {
    backgroundColor: '#F33F32',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  likedButtonText: {
    color: 'white',
  },
});