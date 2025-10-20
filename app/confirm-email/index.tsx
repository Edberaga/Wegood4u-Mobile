import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle } from 'lucide-react-native';

export default function ConfirmEmailScreen() {
  const { email, access_token, refresh_token, type } = useLocalSearchParams<{ 
    email?: string;
    access_token?: string;
    refresh_token?: string;
    type?: string;
  }>();
  const { signIn } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState<boolean>(false);
  const [isCheckingConfirmation, setIsCheckingConfirmation] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const confirmationCheckRef = useRef<number | null>(null);

  useEffect(() => {
    // If we have tokens from deep link, handle them immediately
    if (access_token && refresh_token && type === 'signup') {
      handleDeepLinkConfirmation();
      return;
    }

    // Start checking for email confirmation
    startConfirmationCheck();
    
    // Start countdown timer
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (confirmationCheckRef.current) clearInterval(confirmationCheckRef.current);
    };
  }, [access_token, refresh_token, type]);

  // Function to check email confirmation status
  const checkEmailConfirmation = useCallback(async () => {
    try {
      setIsCheckingConfirmation(true);
      
      // Get current user from Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      // Check if email is confirmed
      if (user && user.email_confirmed_at) {
        console.log('Email confirmed at:', user.email_confirmed_at);
        setIsEmailConfirmed(true);
        
        // Stop the confirmation checking
        if (confirmationCheckRef.current) {
          clearInterval(confirmationCheckRef.current);
        }
        
        // Auto-login after a short delay to show the success message
        setTimeout(() => {
          handleAutoLogin();
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking email confirmation:', error);
    } finally {
      setIsCheckingConfirmation(false);
    }
  }, []);

  // Function to start periodic confirmation checking
  const startConfirmationCheck = useCallback(() => {
    // Check immediately
    checkEmailConfirmation();
    
    // Then check every 3 seconds
    confirmationCheckRef.current = setInterval(() => {
      checkEmailConfirmation();
    }, 3000);
  }, [checkEmailConfirmation]);

  // Function to handle deep link confirmation
  const handleDeepLinkConfirmation = async () => {
    try {
      console.log('Handling deep link confirmation with tokens');
      setIsEmailConfirmed(true);
      
      // Set the session with the tokens from the deep link
      const { data, error } = await supabase.auth.setSession({
        access_token: access_token!,
        refresh_token: refresh_token!,
      });

      if (error) {
        console.error('Error setting session:', error);
        throw error;
      }

      console.log('Session set successfully, user confirmed');
      
      // Auto-login after a short delay to show the success message
      setTimeout(() => {
        handleAutoLogin();
      }, 2000);
    } catch (error) {
      console.error('Deep link confirmation error:', error);
      Alert.alert(
        'Confirmation Error',
        'There was an issue confirming your email. Please try again.',
        [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]
      );
    }
  };

  // Function to handle auto-login
  const handleAutoLogin = async () => {
    try {
      console.log('Auto-login: Email confirmed, redirecting to app...');
      
      Alert.alert(
        'Email Confirmed! 🎉',
        'Your email has been verified successfully. You will be automatically logged in.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to main app
              router.replace('/(tabs)');
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('Auto-login error:', error);
      Alert.alert(
        'Email Confirmed',
        'Your email has been verified! Please go back to login.',
        [
          { text: 'OK', onPress: () => router.replace('/login') }
        ]
      );
    }
  };

  const handleResend = async () => {
    if (!email || typeof email !== 'string') {
      Alert.alert('Missing email', 'Unable to resend without an email address.');
      return;
    }
    if (secondsLeft > 0) return;

    try {
      setIsResending(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'wegood4u://confirm-email',
        },
      });
      if (error) throw error;
      Alert.alert('Email sent', 'We have re-sent a confirmation email.');
      setSecondsLeft(60);
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Restart confirmation checking after resend
      startConfirmationCheck();
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      Alert.alert('Resend failed', err.message || 'Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm your email</Text>
      <Text style={styles.message}>
        {email ? `We sent a confirmation link to ${email}.` : 'We sent a confirmation link to your email.'}
        {'\n'}Please tap the link in your inbox to verify your account.
      </Text>

      {/* Email Confirmation Status */}
      {isEmailConfirmed && (
        <View style={styles.confirmationStatus}>
          <CheckCircle size={24} color="#22C55E" />
          <Text style={styles.confirmationText}>
            ✅ Email Confirmed! Redirecting you to the app...
          </Text>
        </View>
      )}

      <View style={styles.timerRow}>
        <Text style={[styles.timerText, secondsLeft === 0 && styles.timerExpired]}>
          {secondsLeft === 0 ? 'Confirmation link may have expired.' : `Resend available in ${secondsLeft}s`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.resendButton, (secondsLeft > 0 || isResending) && styles.resendButtonDisabled]}
        onPress={handleResend}
        disabled={secondsLeft > 0 || isResending || isEmailConfirmed}
      >
        <Text style={styles.resendButtonText}>
          {isEmailConfirmed 
            ? 'Email Confirmed!' 
            : isResending 
              ? 'Resending…' 
              : 'Resend Confirmation Email'
          }
        </Text>
      </TouchableOpacity>

      <Text style={styles.message}>Once you have clicked the confirm email address. Head back to Login</Text>

      <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/login')}>
        <Text style={styles.backText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
  },
  timerRow: {
    marginTop: 28,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timerExpired: {
    color: '#EF4444',
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 20,
    backgroundColor: '#206E56',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 20,
    gap: 12,
  },
  confirmationText: {
    fontSize: 16,
    color: '#15803D',
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
  },
});