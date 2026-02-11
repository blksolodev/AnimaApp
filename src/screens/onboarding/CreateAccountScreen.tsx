// Anima - Create Account Screen
// Registration step in onboarding flow

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useUserStore } from '../../store';
import { isUsernameAvailable } from '../../services/AuthService';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type OnboardingNavProp = StackNavigationProp<any>;

export const CreateAccountScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const insets = useSafeAreaInsets();
  const { updateData, nextStep, data, completeOnboarding } = useOnboardingStore();
  const { register, login, isLoading, error, clearError } = useUserStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState(data.username);
  const [displayName, setDisplayName] = useState(data.displayName);
  const [showPassword, setShowPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Check username availability with debounce
  useEffect(() => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const available = await isUsernameAvailable(username);
        setUsernameAvailable(available);
      } catch (err) {
        console.error('Username check failed:', err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const validateForm = (): boolean => {
    setLocalError(null);

    if (!email.trim()) {
      setLocalError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setLocalError('Please enter a valid email');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return false;
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return false;
      }

      if (username.length < 3) {
        setLocalError('Username must be at least 3 characters');
        return false;
      }

      if (usernameAvailable === false) {
        setLocalError('Username is already taken');
        return false;
      }

      if (!displayName.trim()) {
        setLocalError('Display name is required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    clearError();

    try {
      if (mode === 'register') {
        await register(email, password, username, displayName);
        updateData({ username, displayName });
        nextStep();
        navigation.navigate('ProfileSetup');
      } else {
        await login(email, password);
        // Complete onboarding for returning users
        // The root navigator will automatically switch to Main when isAuthenticated becomes true
        await completeOnboarding();
      }
    } catch (err) {
      // Error is handled by the store
    }
  };

  const displayError = localError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + SPACING[4] },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Back Button */}
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.text.primary} />
          </Pressable>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'register' ? 'Create Account' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'register'
                ? 'Join the anime community'
                : 'Sign in to continue'}
            </Text>
          </View>

          {/* Mode Toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeButton, mode === 'register' && styles.modeButtonActive]}
              onPress={() => setMode('register')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'register' && styles.modeButtonTextActive,
                ]}
              >
                Sign Up
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
              onPress={() => setMode('login')}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'login' && styles.modeButtonTextActive,
                ]}
              >
                Sign In
              </Text>
            </Pressable>
          </View>

          {/* Error Message */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.accent.error} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={COLORS.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Username (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="at" size={20} color={COLORS.text.tertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="username"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={username}
                    onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={20}
                  />
                  {checkingUsername && (
                    <ActivityIndicator size="small" color={COLORS.accent.primary} />
                  )}
                  {!checkingUsername && usernameAvailable === true && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.accent.success} />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <Ionicons name="close-circle" size={20} color={COLORS.accent.error} />
                  )}
                </View>
              </View>
            )}

            {/* Display Name (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Display Name</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={COLORS.text.tertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={displayName}
                    onChangeText={setDisplayName}
                    maxLength={30}
                  />
                </View>
              </View>
            )}

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.tertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.text.tertiary}
                  />
                </Pressable>
              </View>
            </View>

            {/* Confirm Password (register only) */}
            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.text.tertiary} />
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.text.tertiary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <Pressable
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={[COLORS.accent.primary, '#FF8A50']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={COLORS.text.primary} />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {mode === 'register' ? 'Create Account' : 'Sign In'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.text.primary} />
                </>
              )}
            </LinearGradient>
          </Pressable>

          {/* Social Login Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialButtons}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color={COLORS.text.primary} />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color={COLORS.text.primary} />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="logo-twitter" size={24} color={COLORS.text.primary} />
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING[8],
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING[6],
  },

  // Back Button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: LAYOUT.radius.lg,
    backgroundColor: COLORS.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[4],
  },

  // Header
  header: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.lg,
    padding: 4,
    marginBottom: SPACING[6],
  },
  modeButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: COLORS.accent.primary,
  },
  modeButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  modeButtonTextActive: {
    color: COLORS.text.primary,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.accent.error}20`,
    borderRadius: LAYOUT.radius.lg,
    padding: SPACING[3],
    marginBottom: SPACING[4],
    gap: SPACING[2],
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.error,
  },

  // Form
  form: {
    gap: SPACING[4],
    marginBottom: SPACING[6],
  },
  inputGroup: {
    gap: SPACING[2],
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.tertiary,
    borderRadius: LAYOUT.radius.lg,
    paddingHorizontal: SPACING[4],
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    gap: SPACING[3],
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },

  // Submit Button
  submitButton: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
    marginBottom: SPACING[6],
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.glass.border,
  },
  dividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    paddingHorizontal: SPACING[4],
  },

  // Social Buttons
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING[4],
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: LAYOUT.radius.xl,
    backgroundColor: COLORS.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
});

export default CreateAccountScreen;
