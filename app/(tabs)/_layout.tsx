import { Tabs } from 'expo-router';
import { CircleEllipsis as Home, MapPin, Store, SquareCheck as CheckSquare, User } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#E5C69E',
          tabBarInactiveTintColor: '#FFFFFF',
          tabBarStyle: {
            backgroundColor: '#206E56',
            borderTopWidth: 1,
            borderTopColor: '#CBEED2',
            paddingBottom: 8,
            paddingTop: 8,
            height: 100,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ size, color }) => (
              <CheckSquare size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            title: 'Map',
            tabBarIcon: ({ size, color }) => (
              <MapPin size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            title: 'Store',
            tabBarIcon: ({ size, color }) => (
              <Store size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ size, color }) => (
              <User size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}