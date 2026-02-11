// Anima - GuestPrompt Component
// Modal prompt for guest users to sign up/login

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';

import { GlassModal } from './GlassModal';
import { GlassButton } from './GlassButton';
import { useUserStore } from '../../store';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

export interface GuestPromptProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: string;
}

export const GuestPrompt: React.FC<GuestPromptProps> = ({
  visible,
  onClose,
  title = 'Join Anima',
  message = 'Create an account to like, comment, post, and connect with other anime fans.',
  action = 'interact',
}) => {
  const navigation = useNavigation();
  const { exitGuestMode } = useUserStore();

  const handleSignUp = () => {
    onClose();
    exitGuestMode();
    // Navigate to register screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

  const handleSignIn = () => {
    onClose();
    exitGuestMode();
    // Navigate to login screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      })
    );
  };

  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      variant="alert"
      showCloseButton={true}
    >
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <View style={styles.iconPerson} />
            <View style={styles.iconBody} />
          </View>
          <View style={styles.iconPlus}>
            <View style={styles.plusH} />
            <View style={styles.plusV} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <GlassButton
            title="Create Account"
            onPress={handleSignUp}
            variant="primary"
            size="large"
            fullWidth
            style={styles.primaryButton}
          />
          <GlassButton
            title="Sign In"
            onPress={handleSignIn}
            variant="ghost"
            size="large"
            fullWidth
          />
        </View>

        {/* Continue Browsing */}
        <Text style={styles.continueText} onPress={onClose}>
          Continue browsing
        </Text>
      </View>
    </GlassModal>
  );
};

// Hook to manage guest prompt state
export const useGuestPrompt = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [promptConfig, setPromptConfig] = React.useState<{
    title?: string;
    message?: string;
    action?: string;
  }>({});

  const { isGuest } = useUserStore();

  const showPrompt = (configOrMessage?: string | { title?: string; message?: string; action?: string }) => {
    if (isGuest) {
      // Support both string and object config
      if (typeof configOrMessage === 'string') {
        setPromptConfig({ title: configOrMessage });
      } else {
        setPromptConfig(configOrMessage || {});
      }
      setIsVisible(true);
      return true;
    }
    return false;
  };

  const hidePrompt = () => {
    setIsVisible(false);
  };

  const checkGuest = (callback: () => void, config?: { title?: string; message?: string }) => {
    if (isGuest) {
      showPrompt(config);
    } else {
      callback();
    }
  };

  // Create prompt as JSX element for direct rendering: {GuestPromptComponent}
  const GuestPromptElement = (
    <GuestPrompt
      visible={isVisible}
      onClose={hidePrompt}
      {...promptConfig}
    />
  );

  // Create as function component for JSX usage: <PromptComponent />
  const PromptComponent: React.FC = () => GuestPromptElement;

  return {
    isVisible,
    promptVisible: isVisible, // Alias for compatibility
    promptConfig,
    showPrompt,
    hidePrompt,
    checkGuest,
    isGuest,
    PromptComponent, // Use as <PromptComponent />
    GuestPromptComponent: GuestPromptElement, // Use as {GuestPromptComponent}
  };
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    padding: SPACING[4],
  },

  // Icon
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: SPACING[5],
    position: 'relative',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.glass.medium,
    borderWidth: 2,
    borderColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPerson: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.primary,
    marginBottom: -8,
  },
  iconBody: {
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.accent.primary,
  },
  iconPlus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background.primary,
  },
  plusH: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
  },
  plusV: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
  },

  // Text
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING[2],
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[6],
    paddingHorizontal: SPACING[2],
  },

  // Actions
  actions: {
    width: '100%',
    gap: SPACING[3],
  },
  primaryButton: {
    marginBottom: 0,
  },

  // Continue
  continueText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING[5],
  },
});

export default GuestPrompt;
