import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function ChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
 
  // Utility function for timeout wrapper - treats timeout as distinct result
  const updateUserWithTimeout = (client: any, updates: any, ms: number = 3000) => {
    return Promise.race([
      client.auth.updateUser(updates).then((res: any) => ({ result: res })),
      new Promise((resolve) => 
        setTimeout(() => resolve({ timeout: true }), ms)
      )
    ]);
  };

  // Helper: try signOut with timeout
  const trySignOutWithTimeout = async (ms = 5000) => {
    return Promise.race([
      (async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) return { success: false, error };
          return { success: true };
        } catch (err) {
          return { success: false, error: err };
        }
      })(),
      new Promise((resolve) =>
        setTimeout(() => resolve({ success: false, timeout: true }), ms)
      )
    ]);
  };

  // Helper: force clear client-side auth (web + RN examples)
  const forceClearAuth = async () => {
    
  }

  const validatePassword = (password: string) => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('at least 6 characters');
    }
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

  const handleChangePassword = async () => {
    // Input validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      Alert.alert(
        'Invalid Password',
        `Password must contain: ${passwordErrors.join(', ')}`
      );
      return;
    }

    setIsLoading(true);
    console.log('[changePwd] start');

    try {
      // Kick off updateUser but guard with a short client timeout
      const outcome: any = await updateUserWithTimeout(
        supabase, 
        { password: newPassword }, 
        3000
      );
      console.log('[changePwd] updateUser outcome', outcome);

      // If we received a real result from updateUser, check for error
      if (outcome.result) {
        const res = outcome.result; // typically { data, error } shape in v2
        if (res.error) throw res.error;

        // Confirmed success from client SDK
        setNewPassword('');
        setConfirmPassword('');
        console.log('[changePwd] confirmed success from SDK');

        // Show logout prompt and perform normal signOut when user presses OK
        Alert.alert(
          'Password Changed',
          'Your password was updated. Please log in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                setIsLoading(true);
                const signOutOutcome: any = await trySignOutWithTimeout(3000);
                console.log('[changePwd] signOutOutcome', signOutOutcome);
                setIsLoading(false);

                // If signOut succeeded, AuthProvider should redirect. If not, force navigation
                if (!signOutOutcome.success) {
                  router.replace('/login'); // fallback
                }
              }
            }
          ],
          { cancelable: false }
        );

      } else if (outcome.timeout) {
        // Timeout: updateUser promise didn't resolve in 3s. But server-side update did succeed.
        setNewPassword('');
        setConfirmPassword('');
        console.warn('[changePwd] updateUser timed out on client; server may have applied change.');

        Alert.alert(
          'Password Updated',
          'The password has been succesfully changed. Please press OK to log out and sign in with your new password.',
          [
            {
              text: 'OK',
              onPress: async () => {
                setIsLoading(true);
                const signOutOutcome: any = await trySignOutWithTimeout(5000);
                console.log('[changePwd] signOutOutcome after timeout', signOutOutcome);
                setIsLoading(false);

                if (!signOutOutcome.success) {
                  console.log('[changePwd signOutOutcome didnt succed. Forced move to login!')
                  router.replace('/login'); // fallback navigation
                }
              }
            }
          ],
          { cancelable: false }
        );

      } else {
        // Unexpected shape
        throw new Error('Unexpected updateUser outcome');
      }

    } catch (err: any) {
      console.error('[changePwd] error', err);
      Alert.alert(
        'Error',
        err.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setIsLoading(false);
      console.log('[changePwd] finished');
    }
  };

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    showPassword: boolean,
    toggleShow: () => void,
    placeholder: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={toggleShow} style={styles.eyeButton}>
          {showPassword ? (
            <EyeOff size={20} color="#64748B" />
          ) : (
            <Eye size={20} color="#64748B" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Lock size={48} color="#206E56" />
        </View>

        <Text style={styles.description}>
          Choose a new secure password for your account.
        </Text>

        <View style={styles.form}>

          {renderPasswordInput(
            'New Password',
            newPassword,
            setNewPassword,
            showNewPassword,
            () => setShowNewPassword(!showNewPassword),
            'Enter new password'
          )}

          {renderPasswordInput(
            'Confirm New Password',
            confirmPassword,
            setConfirmPassword,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword),
            'Confirm new password'
          )}

          <View style={styles.passwordRequirements}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <Text style={styles.requirementItem}>• At least 6 characters</Text>
            <Text style={styles.requirementItem}>• One uppercase letter</Text>
            <Text style={styles.requirementItem}>• One lowercase letter</Text>
            <Text style={styles.requirementItem}>• One number</Text>
          </View>

          <TouchableOpacity
            style={[styles.changeButton, isLoading && styles.changeButtonDisabled]}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size={20} color="white" />
            ) : (
              <Text style={styles.changeButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeButton: {
    padding: 12,
  },
  passwordRequirements: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  changeButton: {
    backgroundColor: '#206E56',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  changeButtonDisabled: {
    opacity: 0.6,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});