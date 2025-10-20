import React, { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { UserProvider } from '@/context/UserContext';

// Deep Link Handler Component
function DeepLinkHandler() {
  const { isAuthenticated } = useAuth();

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
            if (!isAuthenticated) {
              router.push(`/reset-confirm?token=${token}&type=${type}`);
            } else {
              console.warn('Deep link ignored: User already authenticated');
              // Optional: Redirect to home or show a toast: router.push('/(tabs)');
            }
          }
        }
        // Check if it's an email confirmation link
        else if (parsedUrl.path === 'confirm-email') {
          const { access_token, refresh_token, type } = parsedUrl.queryParams || {};
          
          if (type === 'signup' && access_token) {
            console.log('Email confirmation deep link detected');
            
            // Only navigate if user is not authenticated
            if (!isAuthenticated) {
              router.push(`/confirm-email?access_token=${access_token}&refresh_token=${refresh_token}&type=${type}`);
            } else {
              console.warn('Deep link ignored: User already authenticated');
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
  }, [isAuthenticated]); // Include isAuthenticated in dependencies

  return null; // This component doesn't render anything
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <UserProvider>
        <DeepLinkHandler />
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