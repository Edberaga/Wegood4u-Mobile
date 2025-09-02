import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, User, Gift, Calendar, Users, ChevronDown } from 'lucide-react-native';
import DatePicker from 'react-native-date-picker';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [gender, setGender] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { signUp, isLoading } = useAuth();

  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (!/[a-z]/.test(password)) {
      errors.push('lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('uppercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('digit');
    }
    
    return errors;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordErrors(validatePassword(text));
  };

  const getPasswordHelperText = () => {
    if (!password) return null;
    
    if (passwordErrors.length === 0) {
      return (
        <Text style={styles.passwordHelperValid}>
          ✓ Password meets all requirements
        </Text>
      );
    }
    
    return (
      <Text style={styles.passwordHelperInvalid}>
        Missing: {passwordErrors.join(', ')}
      </Text>
    );
  };

  const handleRegister = async () => {
    if (!email || !password || !displayName || !dateOfBirth || !gender) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate date is not in the future
    const today = new Date();
    if (dateOfBirth > today) {
      Alert.alert('Error', 'Date of birth cannot be in the future');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    const passwordValidationErrors = validatePassword(password);
    if (passwordValidationErrors.length > 0) {
      Alert.alert(
        'Invalid Password', 
        `Password must contain: ${passwordValidationErrors.join(', ')}`
      );
      return;
    }

    try {
      // Format date as YYYY-MM-DD for database
      const formattedDate = dateOfBirth.toISOString().split('T')[0];
      await signUp(email, password, displayName, formattedDate, gender, invitationCode || undefined);
      
      Alert.alert(
        'Account Created Successfully! 🎉',
        'Welcome to Wegood4u! You can now start exploring partner stores and earning rewards.',
        [
          { text: 'Continue', onPress: () => router.replace('/(tabs)') }
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  const goToLogin = () => {
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Join Wegood4u</Text>
            <Text style={styles.subtitle}>Start your food journey today</Text>
          </View>

          <View style={styles.inputContainer}>
            <Calendar size={20} color="#666" style={styles.inputIcon} />
            <TouchableOpacity
              style={styles.dateSelector}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateSelectorText}>
                {dateOfBirth.toLocaleDateString()}
              </Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Users size={20} color="#666" style={styles.inputIcon} />
            <TouchableOpacity
              style={styles.genderSelector}
              onPress={() => setShowGenderDropdown(true)}
            >
              <Text style={[styles.genderSelectorText, !gender && styles.placeholderText]}>
                {gender || 'Select Gender'}
              </Text>
              <ChevronDown size={20} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <User size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Display Name"
                placeholderTextColor="#666"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>
            
            {getPasswordHelperText()}

            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Gift size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Invitation Code (Optional)"
                placeholderTextColor="#666"
                value={invitationCode}
                onChangeText={setInvitationCode}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={goToLogin}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Login here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Date Picker Modal */}
      <DatePicker
        modal
        open={showDatePicker}
        date={dateOfBirth}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setDateOfBirth(date);
        }}
        onCancel={() => {
          setShowDatePicker(false);
        }}
      />

      {/* Gender Selection Modal */}
      {showGenderDropdown && (
        <View style={styles.modalOverlay}>
          <View style={styles.genderModal}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.genderOption,
                  gender === option && styles.selectedGenderOption
                ]}
                onPress={() => {
                  setGender(option);
                  setShowGenderDropdown(false);
                }}
              >
                <Text style={[
                  styles.genderOptionText,
                  gender === option && styles.selectedGenderOptionText
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGenderDropdown(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  passwordHelperValid: {
    fontSize: 12,
    color: '#22C55E',
    marginBottom: 16,
    marginTop: -8,
    paddingHorizontal: 16,
  },
  passwordHelperInvalid: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 16,
    marginTop: -8,
    paddingHorizontal: 16,
  },
  registerButton: {
    backgroundColor: '#F33F32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkHighlight: {
    color: '#F33F32',
    fontWeight: '600',
  },
  genderSelector: {
    flex: 1,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genderSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  dateSelector: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dateSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#666',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  genderModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    padding: 20,
    paddingBottom: 16,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  genderOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  selectedGenderOption: {
    backgroundColor: '#F33F32',
  },
  genderOptionText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  selectedGenderOptionText: {
    color: 'white',
  },
  modalCloseButton: {
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});