import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { CircleCheck as CheckCircle, ArrowRight, Chrome as Home } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    try {
      // Get the current session to check if user is now verified
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }

      if (session?.user?.email_confirmed_at) {
        setIsSuccess(true);
        
        // Auto-redirect to app after 3 seconds
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 3000);
      } else {
        setError('Email verification failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const goToApp = () => {
    router.replace('/(tabs)');
  };

  const goToLogin = () => {
    router.replace('/login');
  };

  if (isVerifying) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F33F32', '#f38632ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.title}>Verifying Your Email...</Text>
            <Text style={styles.subtitle}>Please wait while we confirm your account</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#F33F32', '#f38632ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/site icon.png')}
                style={styles.logo}
              />
            </View>
            
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{error}</Text>
            
            <TouchableOpacity style={styles.button} onPress={goToLogin}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#F33F32', '#f38632ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/site icon.png')}
              style={styles.logo}
            />
          </View>

          <View style={styles.successIcon}>
            <CheckCircle size={64} color="white" />
          </View>
          
          <Text style={styles.title}>Email Verified Successfully! 🎉</Text>
          <Text style={styles.subtitle}>
            Your account has been confirmed and you're ready to start your food journey with Wegood4u!
          </Text>
          
          <View style={styles.features}>
            <Text style={styles.featureText}>✨ Discover amazing partner restaurants</Text>
            <Text style={styles.featureText}>📸 Upload proof of visits to earn rewards</Text>
            <Text style={styles.featureText}>🏆 Collect badges and unlock achievements</Text>
            <Text style={styles.featureText}>👥 Invite friends and earn referral bonuses</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={goToApp}>
            <Text style={styles.buttonText}>Enter App</Text>
            <ArrowRight size={20} color="#F33F32" />
          </TouchableOpacity>

          <Text style={styles.autoRedirectText}>
            You'll be automatically redirected in a few seconds...
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    marginBottom: 40,
    alignItems: 'flex-start',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'left',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F33F32',
  },
  autoRedirectText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});