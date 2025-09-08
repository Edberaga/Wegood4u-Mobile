import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Star, CircleCheck as CheckCircle, Coffee, UtensilsCrossed, Store } from 'lucide-react-native';
import { type PartnerStore } from '@/data/partnerStore';

interface Submission {
  id: number;
  submissionDate: string;
  restaurantName: string;
  receiptPhoto: string;
  selfiePhoto: string;
  status: 'approved' | 'pending';
  points?: number;
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

interface BadgesProps {
  submissions: Submission[];
  partnerStores: PartnerStore[];
}

export default function Badges({ submissions, partnerStores }: BadgesProps) {
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
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
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
});