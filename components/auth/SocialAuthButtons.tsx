import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import GoogleAuthButton from './GoogleAuthButton';
import FacebookAuthButton from './FacebookAuthButton';
import AppleAuthButton from './AppleAuthButton';

export default function SocialAuthButtons() {
//   const { signInWithProvider } = useAuth();

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
    //   await signInWithProvider(provider);
    } catch (error: any) {
      Alert.alert('Authentication Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <FacebookAuthButton onPress={() => handleSocialAuth('facebook')} />
      <AppleAuthButton onPress={() => handleSocialAuth('apple')} />
      <GoogleAuthButton onPress={() => handleSocialAuth('google')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
});