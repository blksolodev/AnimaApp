// Anima - Profile Setup Screen
// Avatar selection and bio setup during onboarding

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Animated,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useUserStore } from '../../store';
import {
  pickImage,
  takePhoto,
  uploadAvatar,
  DEFAULT_AVATARS,
  UploadProgress,
} from '../../services/ImageUploadService';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

type OnboardingNavProp = StackNavigationProp<any>;

export const ProfileSetupScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavProp>();
  const insets = useSafeAreaInsets();
  const { updateData, nextStep, data } = useOnboardingStore();
  const { user, updateProfile } = useUserStore();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(data.avatarUrl);
  const [bio, setBio] = useState(data.bio);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleImagePick = async () => {
    try {
      const result = await pickImage({ aspect: [1, 1], quality: 0.8 });
      if (result && !result.cancelled) {
        await handleUpload(result.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhoto({ aspect: [1, 1], quality: 0.8 });
      if (result && !result.cancelled) {
        await handleUpload(result.uri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  };

  const handleUpload = async (uri: string) => {
    if (!user?.id) return;

    setIsUploading(true);
    setUploadProgress(0);
    setShowAvatarPicker(false);

    try {
      const url = await uploadAvatar(user.id, uri, (progress: UploadProgress) => {
        setUploadProgress(progress.progress);
      });

      setAvatarUrl(url);
      updateData({ avatarUrl: url });
      await updateProfile({ avatarUrl: url });
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectDefaultAvatar = async (url: string) => {
    setAvatarUrl(url);
    updateData({ avatarUrl: url });
    setShowAvatarPicker(false);

    if (user?.id) {
      try {
        await updateProfile({ avatarUrl: url });
      } catch (error) {
        console.error('Failed to update avatar:', error);
      }
    }
  };

  const handleContinue = async () => {
    updateData({ bio, avatarUrl });

    if (user?.id && bio !== data.bio) {
      try {
        await updateProfile({ bio });
      } catch (error) {
        console.error('Failed to update bio:', error);
      }
    }

    nextStep();
    navigation.navigate('GenrePreferences');
  };

  const handleSkip = () => {
    nextStep();
    navigation.navigate('GenrePreferences');
  };

  return (
    <View style={styles.container}>
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
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '50%' }]} />
            </View>
            <Text style={styles.progressText}>Step 2 of 4</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Make it yours</Text>
            <Text style={styles.subtitle}>
              Add a profile picture and tell us about yourself
            </Text>
          </View>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <Pressable
              style={styles.avatarContainer}
              onPress={() => setShowAvatarPicker(true)}
              disabled={isUploading}
            >
              {isUploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.accent.primary} />
                  <Text style={styles.uploadingText}>
                    {Math.round(uploadProgress)}%
                  </Text>
                </View>
              ) : avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color={COLORS.text.tertiary} />
                </View>
              )}

              {/* Edit Badge */}
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color={COLORS.text.primary} />
              </View>
            </Pressable>

            <Text style={styles.avatarHint}>Tap to change your photo</Text>
          </View>

          {/* Bio Section */}
          <View style={styles.bioSection}>
            <Text style={styles.bioLabel}>Bio</Text>
            <View style={styles.bioInputContainer}>
              <TextInput
                style={styles.bioInput}
                placeholder="Tell us about yourself and your favorite anime..."
                placeholderTextColor={COLORS.text.tertiary}
                value={bio}
                onChangeText={setBio}
                multiline
                maxLength={160}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.bioCount}>{bio.length}/160</Text>
          </View>

          {/* Display Name Preview */}
          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Preview</Text>
            <View style={styles.previewContent}>
              <View style={styles.previewAvatar}>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.previewAvatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.previewAvatarPlaceholder}>
                    <Ionicons name="person" size={20} color={COLORS.text.tertiary} />
                  </View>
                )}
              </View>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>
                  {user?.displayName || data.displayName || 'Your Name'}
                </Text>
                <Text style={styles.previewUsername}>
                  @{user?.username || data.username || 'username'}
                </Text>
                {bio && (
                  <Text style={styles.previewBio} numberOfLines={2}>
                    {bio}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + SPACING[4] }]}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </Pressable>

        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <LinearGradient
            colors={[COLORS.accent.primary, '#FF8A50']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.text.primary} />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Avatar Picker Modal */}
      <Modal
        visible={showAvatarPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvatarPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowAvatarPicker(false)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Choose Avatar</Text>

            {/* Upload Options */}
            <View style={styles.uploadOptions}>
              <Pressable style={styles.uploadOption} onPress={handleImagePick}>
                <View style={styles.uploadOptionIcon}>
                  <Ionicons name="images" size={24} color={COLORS.accent.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Photo Library</Text>
              </Pressable>

              <Pressable style={styles.uploadOption} onPress={handleTakePhoto}>
                <View style={styles.uploadOptionIcon}>
                  <Ionicons name="camera" size={24} color={COLORS.accent.primary} />
                </View>
                <Text style={styles.uploadOptionText}>Take Photo</Text>
              </Pressable>
            </View>

            {/* Divider */}
            <View style={styles.modalDivider}>
              <View style={styles.modalDividerLine} />
              <Text style={styles.modalDividerText}>or choose a default</Text>
              <View style={styles.modalDividerLine} />
            </View>

            {/* Default Avatars */}
            <View style={styles.defaultAvatars}>
              {DEFAULT_AVATARS.map((avatar) => (
                <Pressable
                  key={avatar.id}
                  style={[
                    styles.defaultAvatarItem,
                    avatarUrl === avatar.url && styles.defaultAvatarItemSelected,
                  ]}
                  onPress={() => handleSelectDefaultAvatar(avatar.url)}
                >
                  <Image
                    source={{ uri: avatar.url }}
                    style={styles.defaultAvatarImage}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </View>

            {/* Cancel Button */}
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowAvatarPicker(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING[6],
    paddingBottom: 150,
  },
  content: {
    flex: 1,
  },

  // Progress
  progressContainer: {
    marginBottom: SPACING[6],
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.glass.light,
    borderRadius: 2,
    marginBottom: SPACING[2],
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },

  // Header
  header: {
    marginBottom: SPACING[8],
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

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING[8],
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.glass.light,
    borderWidth: 3,
    borderColor: COLORS.accent.primary,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING[2],
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.background.primary,
  },
  avatarHint: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    marginTop: SPACING[3],
  },

  // Bio
  bioSection: {
    marginBottom: SPACING[6],
  },
  bioLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING[2],
  },
  bioInputContainer: {
    backgroundColor: COLORS.background.tertiary,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
    padding: SPACING[4],
    minHeight: 100,
  },
  bioInput: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  bioCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    textAlign: 'right',
    marginTop: SPACING[2],
  },

  // Preview
  previewCard: {
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.xl,
    padding: SPACING[4],
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  previewLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
    marginBottom: SPACING[3],
  },
  previewContent: {
    flexDirection: 'row',
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    marginRight: SPACING[3],
  },
  previewAvatarImage: {
    width: '100%',
    height: '100%',
  },
  previewAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  previewUsername: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
  },
  previewBio: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING[1],
  },

  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: SPACING[6],
    paddingTop: SPACING[4],
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
  skipButton: {
    paddingVertical: SPACING[3],
    alignItems: 'center',
    marginBottom: SPACING[3],
  },
  skipButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  continueButton: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING[4],
    gap: SPACING[2],
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background.secondary,
    borderTopLeftRadius: LAYOUT.radius['2xl'],
    borderTopRightRadius: LAYOUT.radius['2xl'],
    padding: SPACING[6],
    paddingBottom: SPACING[8],
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.glass.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING[6],
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },

  // Upload Options
  uploadOptions: {
    flexDirection: 'row',
    gap: SPACING[4],
    marginBottom: SPACING[6],
  },
  uploadOption: {
    flex: 1,
    backgroundColor: COLORS.glass.light,
    borderRadius: LAYOUT.radius.xl,
    padding: SPACING[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  uploadOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.accent.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING[2],
  },
  uploadOptionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },

  // Modal Divider
  modalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[4],
  },
  modalDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.glass.border,
  },
  modalDividerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.tertiary,
    paddingHorizontal: SPACING[3],
  },

  // Default Avatars
  defaultAvatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING[3],
    marginBottom: SPACING[6],
  },
  defaultAvatarItem: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.glass.border,
  },
  defaultAvatarItemSelected: {
    borderColor: COLORS.accent.primary,
    borderWidth: 3,
  },
  defaultAvatarImage: {
    width: '100%',
    height: '100%',
  },

  // Cancel
  cancelButton: {
    paddingVertical: SPACING[3],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
});

export default ProfileSetupScreen;
