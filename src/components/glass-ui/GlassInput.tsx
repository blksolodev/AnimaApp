// Anima - GlassInput Component
// Modern glassmorphic input fields

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
  TextInputProps,
  Animated,
} from 'react-native';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING, ANIMATION } from '../../theme/designSystem';

export interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  variant?: 'default' | 'glass' | 'filled';
  size?: 'small' | 'medium' | 'large';
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  disabled = false,
  containerStyle,
  inputStyle,
  secureTextEntry,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: ANIMATION.duration.fast,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: ANIMATION.duration.fast,
      useNativeDriver: false,
    }).start();
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: SPACING[3],
          fontSize: TYPOGRAPHY.sizes.sm,
        };
      case 'large':
        return {
          height: 56,
          paddingHorizontal: SPACING[5],
          fontSize: TYPOGRAPHY.sizes.md,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: SPACING[4],
          fontSize: TYPOGRAPHY.sizes.base,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: COLORS.glass.light,
          borderColor: isFocused ? COLORS.accent.primary : COLORS.glass.border,
        };
      case 'filled':
        return {
          backgroundColor: COLORS.background.tertiary,
          borderColor: isFocused ? COLORS.accent.primary : 'transparent',
        };
      default:
        return {
          backgroundColor: COLORS.background.secondary,
          borderColor: isFocused ? COLORS.accent.primary : COLORS.glass.border,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? COLORS.accent.error : variantStyles.borderColor,
      error ? COLORS.accent.error : COLORS.accent.primary,
    ],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}

      {/* Input Container */}
      <Animated.View
        style={[
          styles.inputContainer,
          {
            height: sizeStyles.height,
            backgroundColor: variantStyles.backgroundColor,
            borderColor: borderColor,
          },
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>{leftIcon}</View>
        )}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            {
              paddingHorizontal: sizeStyles.paddingHorizontal,
              fontSize: sizeStyles.fontSize,
            },
            leftIcon && styles.inputWithLeftIcon,
            rightIcon && styles.inputWithRightIcon,
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.tertiary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          secureTextEntry={secureTextEntry && !showPassword}
          {...textInputProps}
        />

        {/* Right Icon / Password Toggle */}
        {(rightIcon || secureTextEntry) && (
          <Pressable
            onPress={() => {
              if (secureTextEntry) {
                setShowPassword(!showPassword);
              } else {
                onRightIconPress?.();
              }
            }}
            style={styles.rightIcon}
          >
            {rightIcon || (
              <View style={styles.eyeIcon}>
                <View style={[styles.eyeBall, showPassword && styles.eyeBallHidden]} />
              </View>
            )}
          </Pressable>
        )}
      </Animated.View>

      {/* Error / Helper Text */}
      {(error || helper) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helper}
        </Text>
      )}
    </View>
  );
};

// Search Input Variant
export const GlassSearchInput: React.FC<Omit<GlassInputProps, 'variant'> & {
  onSearch?: () => void;
  onClear?: () => void;
}> = ({
  value,
  onChangeText,
  onSearch,
  onClear,
  placeholder = 'Search...',
  ...props
}) => {
  return (
    <GlassInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      variant="glass"
      leftIcon={
        <View style={styles.searchIcon}>
          <View style={styles.searchIconCircle} />
          <View style={styles.searchIconHandle} />
        </View>
      }
      rightIcon={
        value.length > 0 ? (
          <Pressable onPress={() => {
            onChangeText('');
            onClear?.();
          }}>
            <View style={styles.clearIcon} />
          </Pressable>
        ) : undefined
      }
      returnKeyType="search"
      onSubmitEditing={onSearch}
      {...props}
    />
  );
};

// Text Area Variant
export const GlassTextArea: React.FC<GlassInputProps & {
  rows?: number;
}> = ({
  rows = 4,
  ...props
}) => {
  const height = 48 + (rows - 1) * 24;

  return (
    <View style={styles.textAreaContainer}>
      <GlassInput
        {...props}
        multiline
        numberOfLines={rows}
        textAlignVertical="top"
        inputStyle={[{ height, paddingTop: SPACING[3] }, props.inputStyle]}
        containerStyle={props.containerStyle}
      />
      {props.maxLength && (
        <Text style={styles.charCount}>
          {props.value.length}/{props.maxLength}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING[2],
  },
  labelError: {
    color: COLORS.accent.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: LAYOUT.radius.lg,
    overflow: 'hidden',
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: COLORS.text.primary,
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING[2],
  },
  inputWithRightIcon: {
    paddingRight: SPACING[2],
  },
  leftIcon: {
    paddingLeft: SPACING[4],
  },
  rightIcon: {
    paddingRight: SPACING[4],
    padding: SPACING[2],
  },
  helperText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING[1],
  },
  errorText: {
    color: COLORS.accent.error,
  },

  // Search Icon
  searchIcon: {
    width: 20,
    height: 20,
  },
  searchIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
  },
  searchIconHandle: {
    width: 6,
    height: 2,
    backgroundColor: COLORS.text.tertiary,
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ rotate: '-45deg' }],
  },

  // Clear Icon
  clearIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.text.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Eye Icon (password toggle)
  eyeIcon: {
    width: 22,
    height: 16,
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeBall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.text.tertiary,
  },
  eyeBallHidden: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.text.tertiary,
  },

  // Text Area
  textAreaContainer: {
    position: 'relative',
  },
  charCount: {
    position: 'absolute',
    bottom: SPACING[2],
    right: SPACING[4],
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
  },
});

export default GlassInput;
