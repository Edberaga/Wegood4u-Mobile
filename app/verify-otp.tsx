import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

export default function VerifyOTPScreen() {
  const { email, password, username, invitationCode } = useLocalSearchParams<{
    email: string;
    password: string;
    username: string;
    invitationCode?: string;
  }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && value) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      // Verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email: email!,
        token: otpCode,
        type: 'signup',
      });

      if (error) throw error;

      if (data.user) {
        // Now create the user profile with additional data
        const profileUpdates: any = {
          username: username,
          full_name: username,
        };

        // If invitation code was provided, find the inviter
        if (invitationCode) {
          const { data: inviteData, error: inviteError } = await supabase
            .from('invitation_codes')
            .select('user_id')
            .eq('code', invitationCode)
            .eq('is_active', true)
            .single();

          if (!inviteError && inviteData) {
            profileUpdates.inviter_id = inviteData.user_id;
          }
        }

        // Update the profile
        await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', data.user.id);

        Alert.alert(
          'Account Created Successfully! 🎉',
          'Your email has been verified and your account is ready to use.',
          [
            { text: 'Continue', onPress: () => router.replace('/(tabs)') }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const resendOTP = async () => {
    if (!canResend) return;

    try {
      const { error } = await supabase.auth.signUp({
        email: email!,
        password: password!,
        options: {
          data: {
            username: username,
            full_name: username,
          }
        },
      });

      if (error) throw error;

      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
      
      // Reset countdown
      setCanResend(false);
      setCountdown(60);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#F33F32', '#f38632ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/site icon.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to
            </Text>
            <Text style={styles.email}>{email}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    isVerifying && styles.otpInputDisabled,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  editable={!isVerifying}
                  autoFocus={index === 0}
                />
              ))}
            </View>

            <TouchableOpacity
              style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
              onPress={() => verifyOTP(otp.join(''))}
              disabled={isVerifying || otp.some(digit => !digit)}
            >
              <Text style={styles.verifyButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify Code'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code?</Text>
              <TouchableOpacity
                style={[styles.resendButton, !canResend && styles.resendButtonDisabled]}
                onPress={resendOTP}
                disabled={!canResend}
              >
                <RefreshCw size={16} color={canResend ? '#F33F32' : '#94a3b8'} />
                <Text style={[styles.resendButtonText, !canResend && styles.resendButtonTextDisabled]}>
                  {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.helpContainer}>
              <Mail size={16} color="rgba(255, 255, 255, 0.6)" />
              <Text style={styles.helpText}>
                Check your spam folder if you don't see the email
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    height: 56,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  otpInputFilled: {
    borderColor: '#F33F32',
    backgroundColor: 'white',
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  verifyButton: {
    backgroundColor: '#F33F32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F33F32',
  },
  resendButtonTextDisabled: {
    color: '#94a3b8',
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});