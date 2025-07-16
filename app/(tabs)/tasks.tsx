import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircleCheck as CheckCircle, Clock, MapPin, Star, Gift, Calendar, Target } from 'lucide-react-native';

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');

  const ongoingTasks = [
    {
      id: 1,
      title: 'Visit Cafe Luna',
      description: 'Take a photo of your meal and upload proof',
      location: 'Downtown District',
      points: 150,
      deadline: '2024-01-15',
      type: 'restaurant',
    },
    {
      id: 2,
      title: 'Try New Pizza Place',
      description: 'Share your experience at Pizza Corner',
      location: 'Mall Area',
      points: 200,
      deadline: '2024-01-20',
      type: 'restaurant',
    },
    {
      id: 3,
      title: 'Weekend Brunch Challenge',
      description: 'Visit any partner restaurant for brunch',
      location: 'Multiple Locations',
      points: 100,
      deadline: '2024-01-14',
      type: 'challenge',
    },
  ];

  const completedTasks = [
    {
      id: 4,
      title: 'Sushi Zen Experience',
      description: 'Posted review and photos',
      location: 'Harbor District',
      points: 250,
      completedDate: '2024-01-10',
      voucher: 'Free Appetizer',
    },
    {
      id: 5,
      title: 'Coffee Shop Review',
      description: 'Shared Instagram post',
      location: 'City Center',
      points: 100,
      completedDate: '2024-01-08',
      voucher: '10% Discount',
    },
    {
      id: 6,
      title: 'Refer a Friend',
      description: 'Successfully referred Sarah',
      location: 'Online',
      points: 200,
      completedDate: '2024-01-05',
      voucher: 'Bonus Points',
    },
  ];

  const redeemVoucher = (voucher: string) => {
    Alert.alert(
      'Redeem Voucher',
      `Are you sure you want to redeem: ${voucher}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', onPress: () => Alert.alert('Success', 'Voucher redeemed successfully!') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>3</Text>
            <Text style={styles.statLabel}>Ongoing</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ongoing' && styles.activeTab]}
          onPress={() => setActiveTab('ongoing')}
        >
          <Clock size={20} color={activeTab === 'ongoing' ? '#F33F32' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'ongoing' && styles.activeTabText]}>
            Ongoing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <CheckCircle size={20} color={activeTab === 'completed' ? '#F33F32' : '#64748B'} />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'ongoing' ? (
          <View style={styles.taskList}>
            {ongoingTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.taskType}>
                    <Target size={16} color="#F33F32" />
                    <Text style={styles.taskTypeText}>
                      {task.type === 'restaurant' ? 'Restaurant' : 'Challenge'}
                    </Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.pointsText}>{task.points}</Text>
                  </View>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskDetails}>
                  <View style={styles.taskDetail}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.taskDetailText}>{task.location}</Text>
                  </View>
                  <View style={styles.taskDetail}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.taskDetailText}>Due: {task.deadline}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.taskButton}>
                  <Text style={styles.taskButtonText}>Start Task</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.taskList}>
            {completedTasks.map((task) => (
              <View key={task.id} style={styles.completedTaskCard}>
                <View style={styles.taskHeader}>
                  <View style={styles.completedBadge}>
                    <CheckCircle size={16} color="#22C55E" />
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                  <View style={styles.pointsBadge}>
                    <Star size={14} color="#FFD700" />
                    <Text style={styles.pointsText}>{task.points}</Text>
                  </View>
                </View>

                <Text style={styles.taskTitle}>{task.title}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>

                <View style={styles.taskDetails}>
                  <View style={styles.taskDetail}>
                    <MapPin size={14} color="#64748B" />
                    <Text style={styles.taskDetailText}>{task.location}</Text>
                  </View>
                  <View style={styles.taskDetail}>
                    <Calendar size={14} color="#64748B" />
                    <Text style={styles.taskDetailText}>Completed: {task.completedDate}</Text>
                  </View>
                </View>

                <View style={styles.voucherContainer}>
                  <View style={styles.voucherInfo}>
                    <Gift size={16} color="#F33F32" />
                    <Text style={styles.voucherText}>{task.voucher}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.redeemButton}
                    onPress={() => redeemVoucher(task.voucher)}
                  >
                    <Text style={styles.redeemButtonText}>Redeem</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  taskList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedTaskCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  taskTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F33F32',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  taskDetails: {
    gap: 8,
    marginBottom: 16,
  },
  taskDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDetailText: {
    fontSize: 12,
    color: '#64748b',
  },
  taskButton: {
    backgroundColor: '#F33F32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  taskButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  voucherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  voucherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  voucherText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  redeemButton: {
    backgroundColor: '#F33F32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  redeemButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});