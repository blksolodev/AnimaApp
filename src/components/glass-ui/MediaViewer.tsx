// Anima - MediaViewer Component
// Full-screen media viewer for images and videos

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, TYPOGRAPHY, SPACING } from '../../theme/designSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  aspectRatio?: number;
  alt?: string;
}

export interface MediaViewerProps {
  visible: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
  showCounter?: boolean;
  onShare?: (item: MediaItem) => void;
  onDownload?: (item: MediaItem) => void;
}

// Close Icon
const CloseIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <View style={styles.closeLine1} />
    <View style={styles.closeLine2} />
  </View>
);

// Share Icon
const ShareIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <View style={styles.shareArrow} />
    <View style={styles.shareBox} />
  </View>
);

// Download Icon
const DownloadIcon: React.FC = () => (
  <View style={styles.iconContainer}>
    <View style={styles.downloadArrow} />
    <View style={styles.downloadLine} />
  </View>
);

// Individual Media Item
const MediaItemView: React.FC<{
  item: MediaItem;
  onLoadStart: () => void;
  onLoadEnd: () => void;
}> = ({ item, onLoadStart, onLoadEnd }) => {
  if (item.type === 'video') {
    // Video placeholder - would need expo-av for actual video
    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: item.thumbnailUrl || item.url }}
          style={styles.media}
          contentFit="contain"
          transition={200}
          onLoadStart={onLoadStart}
          onLoadEnd={onLoadEnd}
        />
        <View style={styles.videoOverlay}>
          <View style={styles.playButton}>
            <View style={styles.playIcon} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.mediaContainer}>
      <Image
        source={{ uri: item.url }}
        style={styles.media}
        contentFit="contain"
        transition={200}
        onLoadStart={onLoadStart}
        onLoadEnd={onLoadEnd}
      />
    </View>
  );
};

export const MediaViewer: React.FC<MediaViewerProps> = ({
  visible,
  onClose,
  media,
  initialIndex = 0,
  showCounter = true,
  onShare,
  onDownload,
}) => {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const isBlurSupported = Platform.OS === 'ios';

  const handleScroll = (event: any) => {
    const slideWidth = SCREEN_WIDTH;
    const offset = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offset / slideWidth);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < media.length) {
      setCurrentIndex(newIndex);
      setIsLoading(true);
    }
  };

  const currentItem = media[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.container}>
        {/* Background */}
        {isBlurSupported ? (
          <BlurView
            intensity={100}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
        <View style={[StyleSheet.absoluteFillObject, styles.background]} />

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING[2] }]}>
          {/* Close Button */}
          <Pressable onPress={onClose} style={styles.headerButton}>
            <CloseIcon />
          </Pressable>

          {/* Counter */}
          {showCounter && media.length > 1 && (
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {currentIndex + 1} / {media.length}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.headerActions}>
            {onShare && (
              <Pressable
                onPress={() => onShare(currentItem)}
                style={styles.headerButton}
              >
                <ShareIcon />
              </Pressable>
            )}
            {onDownload && (
              <Pressable
                onPress={() => onDownload(currentItem)}
                style={styles.headerButton}
              >
                <DownloadIcon />
              </Pressable>
            )}
          </View>
        </View>

        {/* Media Gallery */}
        <FlatList
          ref={flatListRef}
          data={media}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MediaItemView
              item={item}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
            />
          )}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent.primary} />
          </View>
        )}

        {/* Pagination Dots */}
        {media.length > 1 && (
          <View style={[styles.pagination, { paddingBottom: insets.bottom + SPACING[4] }]}>
            {media.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}

        {/* Caption */}
        {currentItem?.alt && (
          <View style={[styles.captionContainer, { paddingBottom: insets.bottom + SPACING[8] }]}>
            <Text style={styles.caption} numberOfLines={3}>
              {currentItem.alt}
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

// Single Image Viewer (simplified version)
export interface ImageViewerProps {
  visible: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
  onShare?: () => void;
  onDownload?: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  onClose,
  imageUrl,
  alt,
  onShare,
  onDownload,
}) => {
  return (
    <MediaViewer
      visible={visible}
      onClose={onClose}
      media={[{ id: '1', type: 'image', url: imageUrl, alt }]}
      showCounter={false}
      onShare={onShare ? () => onShare() : undefined}
      onDownload={onDownload ? () => onDownload() : undefined}
    />
  );
};

// Thumbnail Grid
export interface ThumbnailGridProps {
  media: MediaItem[];
  maxDisplay?: number;
  onPress: (index: number) => void;
  style?: any;
}

export const ThumbnailGrid: React.FC<ThumbnailGridProps> = ({
  media,
  maxDisplay = 4,
  onPress,
  style,
}) => {
  const displayMedia = media.slice(0, maxDisplay);
  const remaining = media.length - maxDisplay;

  const getGridLayout = () => {
    switch (displayMedia.length) {
      case 1:
        return styles.grid1;
      case 2:
        return styles.grid2;
      case 3:
        return styles.grid3;
      default:
        return styles.grid4;
    }
  };

  const getThumbnailStyle = (index: number, total: number) => {
    if (total === 1) return styles.thumbnail1;
    if (total === 2) return styles.thumbnail2;
    if (total === 3) {
      return index === 0 ? styles.thumbnail3Large : styles.thumbnail3Small;
    }
    return styles.thumbnail4;
  };

  return (
    <View style={[getGridLayout(), style]}>
      {displayMedia.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onPress(index)}
          style={getThumbnailStyle(index, displayMedia.length)}
        >
          <Image
            source={{ uri: item.thumbnailUrl || item.url }}
            style={styles.thumbnailImage}
            contentFit="cover"
            transition={200}
          />
          {item.type === 'video' && (
            <View style={styles.videoIndicator}>
              <View style={styles.playIconSmall} />
            </View>
          )}
          {index === maxDisplay - 1 && remaining > 0 && (
            <View style={styles.remainingOverlay}>
              <Text style={styles.remainingText}>+{remaining}</Text>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },

  // Header
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING[4],
    paddingBottom: SPACING[3],
    zIndex: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  counter: {
    backgroundColor: COLORS.glass.medium,
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[2],
    borderRadius: LAYOUT.radius.full,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },

  // Icons
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLine1: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  closeLine2: {
    position: 'absolute',
    width: 18,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
  shareArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.text.primary,
    marginBottom: 2,
  },
  shareBox: {
    width: 14,
    height: 10,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: COLORS.text.primary,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  downloadArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.text.primary,
    marginBottom: 2,
  },
  downloadLine: {
    width: 14,
    height: 2,
    backgroundColor: COLORS.text.primary,
    borderRadius: 1,
  },

  // Media
  mediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.glass.heavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 4,
    borderLeftWidth: 24,
    borderTopWidth: 16,
    borderBottomWidth: 16,
    borderLeftColor: COLORS.text.primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // Loading
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pagination
  pagination: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING[2],
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.glass.heavy,
  },
  paginationDotActive: {
    backgroundColor: COLORS.text.primary,
    width: 24,
  },

  // Caption
  captionContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING[6],
    alignItems: 'center',
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Thumbnail Grid
  grid1: {
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  grid2: {
    flexDirection: 'row',
    gap: 2,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  grid3: {
    flexDirection: 'row',
    gap: 2,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  grid4: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  thumbnail1: {
    aspectRatio: 16 / 9,
    width: '100%',
  },
  thumbnail2: {
    flex: 1,
    aspectRatio: 1,
  },
  thumbnail3Large: {
    flex: 2,
    aspectRatio: 1,
  },
  thumbnail3Small: {
    flex: 1,
    aspectRatio: 0.5,
  },
  thumbnail4: {
    width: '49%',
    aspectRatio: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background.tertiary,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: SPACING[2],
    left: SPACING[2],
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.glass.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconSmall: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: COLORS.text.primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  remainingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
});

export default MediaViewer;
