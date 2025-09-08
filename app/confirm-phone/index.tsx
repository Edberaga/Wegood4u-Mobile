import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronDown, Search, X } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { countries, type Country } from '@/data/countries';

type Step = 'phone' | 'otp';

export default function ConfirmPhoneScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+60');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  
  const intervalRef = useRef<NodeJS.Timer | null>(null);
  const otpInputRefs = useRef<TextInput[]>([]);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.phoneCode.includes(countrySearch)
  );

  useEffect(() => {
    if (currentStep === 'otp') {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentStep]);

  const selectCountry = (country: Country) => {
    setCountryCode(country.phoneCode);
    setShowCountryModal(false);
    setCountrySearch('');
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    
    // Basic phone validation
    if (phoneNumber.length < 7) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('fullPhoneNumber', fullPhoneNumber);
      console.log('currentStep', currentStep);
      const { error } = await supabase.auth.updateUser({
        phone: fullPhoneNumber
      });

      if (error) {
        if (error.message.includes('Invalid phone number')) {
          Alert.alert('Invalid Phone Number', 'Please enter a valid phone number format');
        } else {
          Alert.alert('Error', error.message);
        }
        return;
      }

      setCurrentStep('otp');
      console.log('currentStep', currentStep);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase.auth.verifyOtp({
        type: 'phone_change',
        token: otpCode,
        phone: `${countryCode}${phoneNumber}`
      });

      if (error) {
        Alert.alert('Invalid OTP', 'The OTP you entered is incorrect. Please try again.');
        return;
      }

      Alert.alert(
        'Phone Number Verified! 🎉',
        'Your phone number has been successfully verified.',
        [
          { text: 'Continue to Dashboard', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to verify OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsLeft > 0) return;

    try {
      setIsResending(true);
      const { error } = await supabase.auth.updateUser({
        phone: `${countryCode}${phoneNumber}`
      });

      if (error) {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
        return;
      }

      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone number.');
      setSecondsLeft(60);
      setOtp(['', '', '', '', '', '']);
      
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
      Alert.alert('Error', err.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const goBack = () => {
    if (currentStep === 'otp') {
      setCurrentStep('phone');
      setOtp(['', '', '', '', '', '']);
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <ChevronLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {currentStep === 'phone' ? 'Add Your Phone Number' : 'Verify Your Phone Number'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'phone' ? (
          <View style={styles.stepContainer}>
            <Text style={styles.description}>
              Enter your phone number and we'll send you a verification code to confirm it.
            </Text>

            <View style={styles.phoneInputContainer}>
              <TouchableOpacity
                style={styles.countryCodeButton}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={styles.countryCodeText}>{countryCode}</Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handlePhoneSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Sending...' : 'Verify Phone Number'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.stepContainer}>
            <Text style={styles.description}>
              Enter the 6-digit verification code sent to {countryCode}{phoneNumber}
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) otpInputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                />
              ))}
            </View>

            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, secondsLeft === 0 && styles.timerExpired]}>
                {secondsLeft === 0 ? 'OTP may have expired' : `Resend available in ${secondsLeft}s`}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleOtpSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.resendButton, (secondsLeft > 0 || isResending) && styles.resendButtonDisabled]}
              onPress={handleResendOtp}
              disabled={secondsLeft > 0 || isResending}
            >
              <Text style={styles.resendButtonText}>
                {isResending ? 'Resending...' : 'Resend Verify Phone OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Country Code Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country Code</Text>
            <TouchableOpacity onPress={() => setShowCountryModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search country or code..."
              placeholderTextColor="#9CA3AF"
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
          </View>

          <ScrollView style={styles.countryList}>
            {filteredCountries.map((country) => (
              <TouchableOpacity
                key={country.code}
                style={styles.countryOption}
                onPress={() => selectCountry(country)}
              >
                <Text style={styles.countryName}>{country.name}</Text>
                <Text style={styles.countryPhoneCode}>{country.phoneCode}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingTop: 32,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 32,
    textAlign: 'center',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  countryCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  countryCodeText: {
    fontSize: 16,
    color: '#1f2937',
    marginRight: 8,
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    backgroundColor: '#F9FAFB',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  timerExpired: {
    color: '#EF4444',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#F33F32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: '#F33F32',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  countryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  countryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  countryName: {
    fontSize: 16,
    color: '#1f2937',
  },
  countryPhoneCode: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
});
