// Anima - LoginScreen v2.0
// Modern glassmorphic authentication screen

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { GlassCard, GlassButton, GlassInput } from '../../components/glass-ui';
import { useUserStore } from '../../store';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreenV2: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const insets = useSafeAreaInsets();
  const { login, enterGuestMode, isLoading, error, clearError } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      // Error is handled by the store
    }
  };

  const handleRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password
  };

  const handleGuestMode = () => {
    enterGuestMode();
  };

  const isBlurSupported = Platform.OS === 'ios';

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
        <View style={[styles.content, { paddingTop: insets.top + SPACING[8] }]}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>anima</Text>
              <View style={styles.logoDot} />
            </View>
            <Text style={styles.tagline}>Your anime social universe</Text>
          </View>

          {/* Login Card */}
          <GlassCard variant="medium" style={styles.card}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>

            {/* Email Input */}
            <GlassInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              variant="glass"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={error && email.length === 0 ? 'Email is required' : undefined}
            />

            {/* Password Input */}
            <GlassInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              variant="glass"
              secureTextEntry
              error={error && password.length === 0 ? 'Password is required' : undefined}
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

            {/* Forgot Password */}
            <Pressable onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </Pressable>

            {/* Login Button */}
            <GlassButton
              title={isLoading ? 'Signing in...' : 'Sign In'}
              onPress={handleLogin}
              variant="primary"
              size="large"
              fullWidth
              disabled={isLoading || !email.trim() || !password.trim()}
              style={styles.loginButton}
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialButtons}>
              <Pressable style={styles.socialButton}>
                <View style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>G</Text>
                </View>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <View style={styles.socialIcon}>
                  <Text style={styles.socialIconText}>A</Text>
                </View>
              </Pressable>
            </View>
          </GlassCard>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Pressable onPress={handleRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </Pressable>
          </View>

          {/* Guest Mode */}
          <Pressable onPress={handleGuestMode} style={styles.guestButton}>
            <Text style={styles.guestButtonText}>Browse as Guest</Text>
          </Pressable>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING[5],
    justifyContent: 'center',
  },

  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.accent.primary,
    opacity: 0.08,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.accent.secondary,
    opacity: 0.06,
  },

  // Logo
  logoSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    letterSpacing: TYPOGRAPHY.letterSpacing.tight,
  },
  logoDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent.primary,
    marginLeft: 4,
    marginBottom: 24,
  },
  tagline: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    marginTop: SPACING[2],
  },

  // Card
  card: {
    padding: SPACING[6],
  },
  welcomeText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[1],
  },
  subtitleText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING[6],
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

  // Forgot Password
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING[6],
    marginTop: -SPACING[2],
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Login Button
  loginButton: {
    marginBottom: SPACING[6],
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
    marginHorizontal: SPACING[4],
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
    borderRadius: LAYOUT.radius.lg,
    backgroundColor: COLORS.glass.light,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING[6],
  },
  registerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  registerLink: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.accent.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // Guest Mode
  guestButton: {
    alignItems: 'center',
    marginTop: SPACING[4],
    paddingVertical: SPACING[3],
  },
  guestButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.tertiary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default LoginScreenV2;
