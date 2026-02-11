// Anima - GuildChat Screen
// Episode-specific chat room with spoiler protection

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { PixelCard, PixelButton, PixelAvatar, ScanlineOverlayCSS } from '../../components/pixel-ui';
import {
  getEpisodeRoom,
  subscribeToMessages,
  sendMessage,
  hasSpoilerAccess,
  verifySpoilerAccess,
} from '../../services';
import { useUserStore } from '../../store';
import { GuildMessage, GuildEpisodeRoom } from '../../types';
import { HomeStackParamList } from '../../navigation/AppNavigator';
import { COLORS, FONTS, FONT_SIZES, SPACING, SPRITE_FRAME } from '../../theme';

type GuildChatRouteProp = RouteProp<HomeStackParamList, 'GuildChat'>;

// Fog of War overlay component
const FogOfWarOverlay: React.FC<{
  visible: boolean;
  onVerify: () => void;
  isVerifying: boolean;
}> = ({ visible, onVerify, isVerifying }) => {
  const [fogOpacity, setFogOpacity] = useState(0.9);

  useEffect(() => {
    if (visible) {
      // Simple pulse animation using setInterval
      const interval = setInterval(() => {
        setFogOpacity(prev => prev === 0.9 ? 0.7 : 0.9);
      }, SPRITE_FRAME * 16);

      return () => clearInterval(interval);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={[styles.fogOverlay, { opacity: fogOpacity }]}>
      <View style={styles.fogContent}>
        <Text style={styles.fogTitle}>SPOILER PROTECTION</Text>
        <Text style={styles.fogDescription}>
          This chat may contain spoilers for the episode.
        </Text>
        <Text style={styles.fogWarning}>
          Verify that you've watched this episode to continue.
        </Text>
        <PixelButton
          title={isVerifying ? 'VERIFYING...' : 'I\'VE WATCHED IT'}
          onPress={onVerify}
          variant="primary"
          disabled={isVerifying}
          style={styles.fogButton}
        />
      </View>
    </View>
  );
};

// Message bubble component
const MessageBubble: React.FC<{ message: GuildMessage; isOwn: boolean }> = ({
  message,
  isOwn,
}) => {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
      {!isOwn && (
        <PixelAvatar
          imageUrl={message.author.avatarUrl}
          size="small"
          powerLevel={message.author.powerLevel}
        />
      )}
      <View style={[styles.messageContent, isOwn && styles.messageContentOwn]}>
        {!isOwn && (
          <Text style={styles.messageAuthor}>{message.author.displayName}</Text>
        )}
        <View style={[styles.messageBox, isOwn && styles.messageBoxOwn]}>
          <Text style={styles.messageText}>{message.content}</Text>
        </View>
        <Text style={styles.messageTime}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
};

export const GuildChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<GuildChatRouteProp>();
  const insets = useSafeAreaInsets();
  const { user } = useUserStore();

  const { roomId, animeName, episode } = route.params;

  const [room, setRoom] = useState<GuildEpisodeRoom | null>(null);
  const [messages, setMessages] = useState<GuildMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showFog, setShowFog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Load room and check access
  useEffect(() => {
    const loadRoom = async () => {
      if (!user) return;

      try {
        const episodeRoom = await getEpisodeRoom(
          parseInt(roomId.split('_')[0]),
          animeName,
          episode,
          Math.floor(Date.now() / 1000) - 3600 // Assume aired 1 hour ago for demo
        );

        setRoom(episodeRoom);

        // Check if user has verified spoiler access
        if (!episodeRoom.isAired) {
          setShowFog(true);
        } else {
          const hasAccess = await hasSpoilerAccess(roomId, user.id);
          setShowFog(!hasAccess);
        }
      } catch (error) {
        console.error('Failed to load room:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoom();
  }, [roomId, user]);

  // Subscribe to messages
  useEffect(() => {
    if (showFog || !roomId) return;

    unsubscribeRef.current = subscribeToMessages(roomId, (newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [roomId, showFog]);

  const handleVerify = async () => {
    if (!user) return;

    setIsVerifying(true);
    try {
      await verifySpoilerAccess(roomId, user.id);
      setShowFog(false);
    } catch (error) {
      console.error('Failed to verify access:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSend = async () => {
    if (!user || !inputText.trim() || isSending) return;

    setIsSending(true);
    const content = inputText.trim();
    setInputText('');

    try {
      await sendMessage(
        roomId,
        user.id,
        {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          powerLevel: user.powerLevel,
          auraColor: '#00FF41', // Default aura
        },
        content,
        true
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setInputText(content); // Restore input on error
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = useCallback(
    ({ item }: { item: GuildMessage }) => (
      <MessageBubble message={item} isOwn={item.authorId === user?.id} />
    ),
    [user?.id]
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.levelUpLime} />
        <Text style={styles.loadingText}>ENTERING GUILD...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <ScanlineOverlayCSS opacity={0.02} enabled={true} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{'<'}</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {animeName}
          </Text>
          <Text style={styles.headerEpisode}>EPISODE {episode} GUILD</Text>
        </View>
        <View style={styles.participantCount}>
          <Text style={styles.participantText}>{room?.participants || 0}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom || SPACING[2] }]}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Send a message..."
          placeholderTextColor={COLORS.mediumGray}
          multiline
          maxLength={500}
        />
        <Pressable
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          <Text style={styles.sendButtonText}>{isSending ? '...' : '>'}</Text>
        </Pressable>
      </View>

      {/* Fog of War overlay */}
      <FogOfWarOverlay
        visible={showFog}
        onVerify={handleVerify}
        isVerifying={isVerifying}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.midnightGrape,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    marginTop: SPACING[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
    borderBottomWidth: 4,
    borderBottomColor: COLORS.deepPurple,
  },
  backButton: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xl,
    color: COLORS.manaBlue,
    paddingRight: SPACING[3],
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  headerEpisode: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.levelUpLime,
  },
  participantCount: {
    backgroundColor: COLORS.manaBlue,
    paddingHorizontal: SPACING[2],
    paddingVertical: SPACING[1],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  participantText: {
    fontFamily: FONTS.numeric,
    fontSize: FONT_SIZES.sm,
    color: COLORS.midnightGrape,
  },
  messagesList: {
    paddingHorizontal: SPACING[4],
    paddingVertical: SPACING[3],
  },
  messageBubble: {
    flexDirection: 'row',
    marginBottom: SPACING[3],
  },
  messageBubbleOwn: {
    flexDirection: 'row-reverse',
  },
  messageContent: {
    marginLeft: SPACING[2],
    maxWidth: '75%',
  },
  messageContentOwn: {
    marginLeft: 0,
    marginRight: SPACING[2],
    alignItems: 'flex-end',
  },
  messageAuthor: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.manaBlue,
    marginBottom: 2,
  },
  messageBox: {
    backgroundColor: COLORS.deepPurple,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    padding: SPACING[2],
  },
  messageBoxOwn: {
    backgroundColor: COLORS.manaBlue,
    borderColor: COLORS.white,
  },
  messageText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
  messageTime: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.xs,
    color: COLORS.mediumGray,
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING[4],
    paddingTop: SPACING[2],
    borderTopWidth: 4,
    borderTopColor: COLORS.deepPurple,
    backgroundColor: COLORS.shadowBlack,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.deepPurple,
    borderWidth: 2,
    borderColor: COLORS.borderMid,
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[2],
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.levelUpLime,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    marginLeft: SPACING[2],
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.darkGray,
    borderColor: COLORS.charcoal,
  },
  sendButtonText: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.midnightGrape,
  },
  // Fog overlay
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.midnightGrape,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  fogContent: {
    maxWidth: 300,
    alignItems: 'center',
    padding: SPACING[6],
  },
  fogTitle: {
    fontFamily: FONTS.header,
    fontSize: FONT_SIZES.lg,
    color: COLORS.criticalHitCrimson,
    marginBottom: SPACING[4],
    textAlign: 'center',
  },
  fogDescription: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING[2],
  },
  fogWarning: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: COLORS.mediumGray,
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  fogButton: {
    minWidth: 200,
  },
});

export default GuildChatScreen;
