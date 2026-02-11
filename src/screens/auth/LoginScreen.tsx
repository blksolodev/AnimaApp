// Anima - LoginScreen
// Authentication screen with pixel art styling

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { PixelCard, PixelButton, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { useUserStore } from '../../store';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../theme';

type LoginNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigationProp>();
  const insets = useSafeAreaInsets();
  const { login, isLoading, error, clearError } = useUserStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('ERROR', 'Please fill in all fields.');
      return;
    }

    try {
      await login(email.trim(), password);
    } catch (error: any) {
      Alert.alert('LOGIN FAILED', error.message || 'Please try again.');
    }
  };

  const handleRegister = () => {
    clearError();
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>ANIMA</Text>
          <Text style={styles.subtitle}>QUEST LOG</Text>
        </View>

        {/* Login Card */}
        <PixelCard variant="dialog" style={styles.card}>
          <Text style={styles.cardTitle}>ADVENTURER LOGIN</Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email..."
              placeholderTextColor={COLORS.mediumGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password..."
              placeholderTextColor={COLORS.mediumGray}
              secureTextEntry
            />
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Login Button */}
          <PixelButton
            title={isLoading ? 'LOGGING IN...' : 'START QUEST'}
            onPress={handleLogin}
            variant="primary"
            fullWidth
            disabled={isLoading}
            style={styles.loginButton}
          />

          {/* Forgot Password */}
          <Pressable style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>FORGOT PASSWORD?</Text>
          </Pressable>
        </PixelCard>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>NEW ADVENTURER? </Text>
          <Pressable onPress={handleRegister}>
            <Text style={styles.registerLink}>CREATE ACCOUNT</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING[6],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  logo: {
    fontFamily: FONTS.header,
    fontSize: 40,
    color: COLORS.levelUpLime,
    textShadowColor: COLORS.shadowBlack,
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  subtitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING[1],
  },
  card: {
    marginBottom: SPACING[6],
  },
  cardTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.md,
    color: COLORS.goldCoin,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  inputContainer: {
    marginBottom: SPACING[4],
  },
  inputLabel: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
    marginBottom: SPACING[2],
  },
  input: {
    backgroundColor: COLORS.shadowBlack,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[3],
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  errorContainer: {
    backgroundColor: COLORS.criticalHitCrimson,
    padding: SPACING[2],
    marginBottom: SPACING[4],
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: SPACING[2],
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: SPACING[4],
  },
  forgotPasswordText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.manaBlue,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
  },
  registerLink: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.levelUpLime,
  },
});

export default LoginScreen;
