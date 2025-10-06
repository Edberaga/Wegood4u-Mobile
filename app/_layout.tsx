import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';

export default function RootLayout() {
  useFrameworkReady();

  useEffect(() => {
    // Handle deep links
    const handleDeepLink = (url: string) => {
      try {
        console.log('Deep link received:', url);
        
        // Parse the URL
        const parsedUrl = Linking.parse(url);
        
        // Check if it's a password reset link
        if (parsedUrl.path === 'reset-password') {
          const { type, token } = parsedUrl.queryParams || {};
          
          if (type === 'recovery' && token) {
            console.log('Password reset deep link detected');
            
            // Only navigate if user is not authenticated (avoids confusing logged-in users)
            const { isAuthenticated } = useAuth();
            if (!isAuthenticated) {
              router.push(`/reset-confirm?token=${token}&type=${type}`);
            } else {
              console.warn('Deep link ignored: User already authenticated');
              // Optional: Redirect to home or show a toast: router.push('/(tabs)');
            }
          }
        }
        // Add more path handlers here if needed (e.g., for other deep links)
      } catch (error) {
        console.error('Error handling deep link:', error);
        // Optional: Show user-friendly error (e.g., via toast) or ignore silently
      }
    };

    // Get initial URL (if app was opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for incoming deep links (when app is already open)
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, []); // Empty deps: Runs once on mount

  return (
    <AuthProvider>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-confirm" />
          <Stack.Screen name="confirm-email/index" />
          <Stack.Screen name="question/index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </UserProvider>
    </AuthProvider>
  );
}