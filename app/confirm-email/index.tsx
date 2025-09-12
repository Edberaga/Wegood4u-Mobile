import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ConfirmEmailScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isResending, setIsResending] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
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
    };
  }, []);

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
      });
      if (error) throw error;
      Alert.alert('Email sent', 'We have re-sent a confirmation email.');
      setSecondsLeft(60);
      if (intervalRef.current) clearInterval(intervalRef.current);
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

      <View style={styles.timerRow}>
        <Text style={[styles.timerText, secondsLeft === 0 && styles.timerExpired]}>
          {secondsLeft === 0 ? 'Confirmation link may have expired.' : `Resend available in ${secondsLeft}s`}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.resendButton, (secondsLeft > 0 || isResending) && styles.resendButtonDisabled]}
        onPress={handleResend}
        disabled={secondsLeft > 0 || isResending}
      >
        <Text style={styles.resendButtonText}>
          {isResending ? 'Resending…' : 'Resend Confirmation Email'}
        </Text>
      </TouchableOpacity>

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
});