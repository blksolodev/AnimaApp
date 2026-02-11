// Anima - RegisterScreen
// Account creation with pixel art styling

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
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { PixelCard, PixelButton, ScanlineOverlayCSS } from '../../components/pixel-ui';
import { useUserStore } from '../../store';
import { isUsernameAvailable } from '../../services';
import { AuthStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../theme';

type RegisterNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigationProp>();
  const insets = useSafeAreaInsets();
  const { register, isLoading, error, clearError } = useUserStore();

  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameValid, setUsernameValid] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const validateUsername = async (name: string) => {
    if (name.length < 3) {
      setUsernameValid(false);
      return;
    }

    setCheckingUsername(true);
    try {
      const available = await isUsernameAvailable(name);
      setUsernameValid(available);
    } catch (error) {
      setUsernameValid(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (text: string) => {
    const sanitized = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    if (sanitized.length >= 3) {
      validateUsername(sanitized);
    } else {
      setUsernameValid(null);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !displayName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('ERROR', 'Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      Alert.alert('ERROR', 'Username must be at least 3 characters.');
      return;
    }

    if (!usernameValid) {
      Alert.alert('ERROR', 'Username is not available.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('ERROR', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('ERROR', 'Passwords do not match.');
      return;
    }

    try {
      await register(email.trim(), password, username.trim(), displayName.trim());
    } catch (error: any) {
      Alert.alert('REGISTRATION FAILED', error.message || 'Please try again.');
    }
  };

  const handleLogin = () => {
    clearError();
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScanlineOverlayCSS opacity={0.03} enabled={true} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleLogin}>
            <Text style={styles.backButton}>{'<'} BACK</Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>CREATE YOUR</Text>
          <Text style={styles.titleAccent}>ADVENTURER</Text>
        </View>

        {/* Register Card */}
        <PixelCard variant="dialog" style={styles.card}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>USERNAME</Text>
              {checkingUsername && (
                <Text style={styles.checkingText}>CHECKING...</Text>
              )}
              {!checkingUsername && usernameValid === true && (
                <Text style={styles.validText}>AVAILABLE!</Text>
              )}
              {!checkingUsername && usernameValid === false && (
                <Text style={styles.invalidText}>TAKEN</Text>
              )}
            </View>
            <TextInput
              style={[
                styles.input,
                usernameValid === true && styles.inputValid,
                usernameValid === false && styles.inputInvalid,
              ]}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="Choose a unique name..."
              placeholderTextColor={COLORS.mediumGray}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
          </View>

          {/* Display Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>DISPLAY NAME</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your public name..."
              placeholderTextColor={COLORS.mediumGray}
              maxLength={30}
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.mediumGray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters..."
              placeholderTextColor={COLORS.mediumGray}
              secureTextEntry
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <TextInput
              style={[
                styles.input,
                password.length > 0 && confirmPassword.length > 0 && (
                  password === confirmPassword
                    ? styles.inputValid
                    : styles.inputInvalid
                ),
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password..."
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

          {/* Register Button */}
          <PixelButton
            title={isLoading ? 'CREATING...' : 'BEGIN ADVENTURE'}
            onPress={handleRegister}
            variant="primary"
            fullWidth
            disabled={isLoading}
            style={styles.registerButton}
          />
        </PixelCard>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>ALREADY AN ADVENTURER? </Text>
          <Pressable onPress={handleLogin}>
            <Text style={styles.loginLink}>LOG IN</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
    paddingBottom: SPACING[8],
  },
  header: {
    paddingVertical: SPACING[4],
  },
  backButton: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.manaBlue,
  },
  titleContainer: {
    marginBottom: SPACING[6],
  },
  title: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
  },
  titleAccent: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES['2xl'],
    color: COLORS.levelUpLime,
  },
  card: {
    marginBottom: SPACING[6],
  },
  inputContainer: {
    marginBottom: SPACING[4],
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING[2],
  },
  inputLabel: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.lightGray,
  },
  checkingText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.goldCoin,
  },
  validText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.levelUpLime,
  },
  invalidText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.criticalHitCrimson,
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
  inputValid: {
    borderColor: COLORS.levelUpLime,
  },
  inputInvalid: {
    borderColor: COLORS.criticalHitCrimson,
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
  registerButton: {
    marginTop: SPACING[2],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
  },
  loginLink: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.levelUpLime,
  },
});

export default RegisterScreen;
