// Anima - GlassModal Component
// Modern glassmorphic modal dialogs

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ViewStyle,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, EFFECTS } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: 'default' | 'alert' | 'bottom-sheet' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  footer,
  contentStyle,
}) => {
  const insets = useSafeAreaInsets();
  const [animatedVisible, setAnimatedVisible] = useState(false);
  const isBlurSupported = Platform.OS === 'ios';

  useEffect(() => {
    if (visible) {
      setAnimatedVisible(true);
    } else {
      const timer = setTimeout(() => setAnimatedVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const getContainerStyle = () => {
    switch (variant) {
      case 'bottom-sheet':
        return {
          justifyContent: 'flex-end' as const,
        };
      case 'fullscreen':
        return {
          justifyContent: 'flex-start' as const,
          padding: 0,
        };
      case 'alert':
        return {
          justifyContent: 'center' as const,
        };
      default:
        return {
          justifyContent: 'center' as const,
        };
    }
  };

  const getModalStyle = () => {
    switch (variant) {
      case 'bottom-sheet':
        return {
          width: SCREEN_WIDTH,
          maxHeight: SCREEN_HEIGHT * 0.9,
          borderTopLeftRadius: LAYOUT.radius['2xl'],
          borderTopRightRadius: LAYOUT.radius['2xl'],
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: insets.bottom + SPACING[4],
        };
      case 'fullscreen':
        return {
          width: SCREEN_WIDTH,
          height: SCREEN_HEIGHT,
          borderRadius: 0,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        };
      case 'alert':
        return {
          width: SCREEN_WIDTH - SPACING[8],
          maxWidth: 340,
          borderRadius: LAYOUT.radius['2xl'],
        };
      default:
        return {
          width: SCREEN_WIDTH - SPACING[8],
          maxWidth: 480,
          maxHeight: SCREEN_HEIGHT * 0.85,
          borderRadius: LAYOUT.radius['2xl'],
        };
    }
  };

  const containerStyle = getContainerStyle();
  const modalStyle = getModalStyle();

  if (!animatedVisible && !visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.backdrop, containerStyle]}>
          {/* Backdrop */}
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closeOnBackdrop ? onClose : undefined}
          >
            {isBlurSupported ? (
              <BlurView
                intensity={40}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
            ) : (
              <View style={[StyleSheet.absoluteFillObject, styles.androidBackdrop]} />
            )}
          </Pressable>

          {/* Modal Content */}
          <View style={[styles.modal, modalStyle]}>
            {/* Glass Background */}
            {isBlurSupported ? (
              <BlurView
                intensity={60}
                tint="dark"
                style={[StyleSheet.absoluteFillObject, { borderRadius: modalStyle.borderRadius }]}
              />
            ) : null}
            <View
              style={[
                StyleSheet.absoluteFillObject,
                styles.modalBackground,
                { borderRadius: modalStyle.borderRadius },
              ]}
            />

            {/* Header */}
            {(title || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
                {showCloseButton && (
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <View style={styles.closeIcon}>
                      <View style={styles.closeLine1} />
                      <View style={styles.closeLine2} />
                    </View>
                  </Pressable>
                )}
              </View>
            )}

            {/* Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={[styles.content, contentStyle]}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {children}
            </ScrollView>

            {/* Footer */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Alert Modal (simplified version)
export interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
    destructive?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

export const AlertModal: React.FC<AlertModalProps> = ({
  visible,
  onClose,
  title,
  message,
  primaryAction,
  secondaryAction,
}) => {
  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      variant="alert"
      showCloseButton={false}
      closeOnBackdrop={false}
    >
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertMessage}>{message}</Text>

        <View style={styles.alertActions}>
          {secondaryAction && (
            <Pressable
              onPress={secondaryAction.onPress}
              style={[styles.alertButton, styles.alertButtonSecondary]}
            >
              <Text style={styles.alertButtonSecondaryText}>
                {secondaryAction.label}
              </Text>
            </Pressable>
          )}
          {primaryAction && (
            <Pressable
              onPress={primaryAction.onPress}
              style={[
                styles.alertButton,
                styles.alertButtonPrimary,
                primaryAction.destructive && styles.alertButtonDestructive,
              ]}
            >
              <Text style={styles.alertButtonPrimaryText}>
                {primaryAction.label}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </GlassModal>
  );
};

// Confirmation Modal
export interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}) => {
  return (
    <AlertModal
      visible={visible}
      onClose={onClose}
      title={title}
      message={message}
      primaryAction={{
        label: confirmLabel,
        onPress: () => {
          onConfirm();
          onClose();
        },
        destructive,
      }}
      secondaryAction={{
        label: cancelLabel,
        onPress: onClose,
      }}
    />
  );
};

// Action Sheet (Bottom Sheet with options)
export interface ActionSheetOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  onPress: () => void;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  options: ActionSheetOption[];
  cancelLabel?: string;
}

export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  title,
  options,
  cancelLabel = 'Cancel',
}) => {
  return (
    <GlassModal
      visible={visible}
      onClose={onClose}
      variant="bottom-sheet"
      title={title}
      showCloseButton={false}
    >
      <View style={styles.actionSheetContent}>
        {options.map((option, index) => (
          <Pressable
            key={option.id}
            onPress={() => {
              option.onPress();
              onClose();
            }}
            style={[
              styles.actionSheetOption,
              index < options.length - 1 && styles.actionSheetOptionBorder,
            ]}
          >
            {option.icon && (
              <View style={styles.actionSheetIcon}>{option.icon}</View>
            )}
            <Text
              style={[
                styles.actionSheetLabel,
                option.destructive && styles.actionSheetLabelDestructive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}

        {/* Cancel Button */}
        <Pressable onPress={onClose} style={styles.actionSheetCancel}>
          <Text style={styles.actionSheetCancelText}>{cancelLabel}</Text>
        </Pressable>
      </View>
    </GlassModal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    padding: SPACING[4],
  },
  androidBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modal: {
    overflow: 'hidden',
    ...EFFECTS.shadows.xl,
  },
  modalBackground: {
    backgroundColor: COLORS.glass.overlay,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[5],
    paddingBottom: SPACING[3],
  },
  headerTitleContainer: {
    flex: 1,
    paddingRight: SPACING[4],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING[1],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine1: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: COLORS.text.secondary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 16,
    height: 2,
    backgroundColor: COLORS.text.secondary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  // Content
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING[5],
    paddingBottom: SPACING[5],
  },

  // Footer
  footer: {
    paddingHorizontal: SPACING[5],
    paddingTop: SPACING[3],
    paddingBottom: SPACING[5],
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },

  // Alert Modal
  alertContent: {
    alignItems: 'center',
    padding: SPACING[5],
  },
  alertTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  alertMessage: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING[6],
  },
  alertActions: {
    flexDirection: 'row',
    gap: SPACING[3],
    width: '100%',
  },
  alertButton: {
    flex: 1,
    height: 48,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonSecondary: {
    backgroundColor: COLORS.glass.medium,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  alertButtonSecondaryText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  alertButtonPrimary: {
    backgroundColor: COLORS.accent.primary,
  },
  alertButtonDestructive: {
    backgroundColor: COLORS.accent.error,
  },
  alertButtonPrimaryText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },

  // Action Sheet
  actionSheetContent: {
    paddingTop: SPACING[2],
  },
  actionSheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[2],
  },
  actionSheetOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  actionSheetIcon: {
    width: 24,
    height: 24,
    marginRight: SPACING[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheetLabel: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  actionSheetLabelDestructive: {
    color: COLORS.accent.error,
  },
  actionSheetCancel: {
    marginTop: SPACING[4],
    paddingVertical: SPACING[4],
    alignItems: 'center',
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.lg,
  },
  actionSheetCancelText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
  },
});

export default GlassModal;
