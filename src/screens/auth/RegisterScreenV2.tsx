// Anima - RegisterScreen v2.0
// Modern glassmorphic account creation

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';

import { GlassCard, GlassButton, GlassInput } from '../../components/glass-ui';
import { useUserStore } from '../../store';
import { isUsernameAvailable } from '../../services';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type RegisterNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreenV2: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useUserStore();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  const validateUsername = async (name: string) => {
    if (name.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    try {
      const available = await isUsernameAvailable(name);
      setUsernameStatus(available ? 'available' : 'taken');
    } catch (error) {
      setUsernameStatus('idle');
    }
  };

  const handleUsernameChange = (text: string) => {
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    if (sanitized.length >= 3) {
      validateUsername(sanitized);
    } else {
      setUsernameStatus('idle');
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !displayName.trim() || !email.trim() || !password.trim()) {
      return;
    }

    if (username.length < 3) {
      return;
    }

    if (usernameStatus === 'taken') {
      return;
    }

    if (password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await register(email.trim(), password, username.trim(), displayName.trim());
    } catch (error: any) {
      // Error is handled by the store
    }
  };

  const handleLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  const getUsernameHelper = () => {
    switch (usernameStatus) {
      case 'checking':
        return 'Checking availability...';
      case 'available':
        return 'Username is available!';
      case 'taken':
        return 'Username is already taken';
      default:
        return 'At least 3 characters, letters, numbers, and underscores only';
    }
  };

  const getUsernameError = () => {
    if (usernameStatus === 'taken') {
      return 'Username is already taken';
    }
    return undefined;
  };

  const getPasswordError = () => {
    if (password.length > 0 && password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return undefined;
  };

  const getConfirmPasswordError = () => {
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      return 'Passwords do not match';
    }
    return undefined;
  };

  const isFormValid = () => {
    return (
      username.length >= 3 &&
      usernameStatus !== 'taken' &&
      usernameStatus !== 'checking' &&
      displayName.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      password === confirmPassword
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient */}
      <LinearGradient
        colors={[COLORS.background.secondary, COLORS.background.primary, '#0D0D14']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + SPACING[4],
              paddingBottom: insets.bottom + SPACING[8],
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleLogin} style={styles.backButton}>
              <View style={styles.backIcon}>
                <View style={styles.backArrow} />
              </View>
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the anime community</Text>
          </View>

          {/* Register Card */}
          <GlassCard variant="medium" style={styles.card}>
            {/* Username */}
            <GlassInput
              label="Username"
              placeholder="Choose a unique username"
              value={username}
              onChangeText={handleUsernameChange}
              variant="glass"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              error={getUsernameError()}
              helper={usernameStatus !== 'taken' ? getUsernameHelper() : undefined}
              rightIcon={
                usernameStatus === 'available' ? (
                  <View style={styles.checkIcon}>
                    <View style={styles.checkMark} />
                  </View>
                ) : usernameStatus === 'checking' ? (
                  <View style={styles.loadingDot} />
                ) : undefined
              }
            />

            {/* Display Name */}
            <GlassInput
              label="Display Name"
              placeholder="How should we call you?"
              value={displayName}
              onChangeText={setDisplayName}
              variant="glass"
              maxLength={30}
              helper="This is your public name shown to others"
            />

            {/* Email */}
            <GlassInput
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              variant="glass"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Password */}
            <GlassInput
              label="Password"
              placeholder="At least 6 characters"
              value={password}
              onChangeText={setPassword}
              variant="glass"
              secureTextEntry
              error={getPasswordError()}
            />

            {/* Confirm Password */}
            <GlassInput
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              variant="glass"
              secureTextEntry
              error={getConfirmPasswordError()}
            />

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <View style={styles.errorIcon}>
                  <View style={styles.errorIconLine1} />
                  <View style={styles.errorIconLine2} />
                </View>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Terms */}
            <Text style={styles.termsText}>
              By signing up, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>

            {/* Register Button */}
            <GlassButton
              title={isLoading ? 'Creating Account...' : 'Create Account'}
              onPress={handleRegister}
              variant="primary"
              size="large"
              fullWidth
              disabled={isLoading || !isFormValid()}
              style={styles.registerButton}
            />
          </GlassCard>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[5],
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent.secondary,
    opacity: 0.08,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: 100,
    left: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent.primary,
    opacity: 0.06,
  },

  // Header
  header: {
    marginBottom: SPACING[6],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: SPACING[2],
  },
  backIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[2],
  },
  backArrow: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.accent.primary,
    transform: [{ rotate: '45deg' }],
  },
  backText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Title
  titleSection: {
    marginBottom: SPACING[6],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
  },

  // Card
  card: {
    padding: SPACING[6],
  },

  // Check Icon
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    width: 8,
    height: 5,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: COLORS.text.primary,
    transform: [{ rotate: '-45deg' }, { translateY: -1 }],
  },
  loadingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent.primary,
    borderTopColor: 'transparent',
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: SPACING[4],
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING[3],
  },
  errorIconLine1: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  errorIconLine2: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  errorText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.error,
  },

  // Terms
  termsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING[6],
  },
  termsLink: {
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Register Button
  registerButton: {
    marginBottom: 0,
  },

  // Login
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING[6],
  },
  loginText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  loginLink: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default RegisterScreenV2;
