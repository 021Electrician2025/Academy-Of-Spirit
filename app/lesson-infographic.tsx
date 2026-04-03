import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, ExternalLink, ImageIcon, Maximize2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Linking, Modal, StatusBar } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import {
  fetchInfographics,
  getInfographicImageUrl,
  type Infographic,
} from '@/lib/infographics';

const SCREEN = Dimensions.get('window');
const MAX_SCALE = 5;
const MIN_SCALE = 1;

// ─── Full-screen zoomable image viewer ───────────────────────────────────────
function ImageViewer({ uri, onClose }: { uri: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Pinch to zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      const next = savedScale.value * e.scale;
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Snap back to 1 if below threshold
      if (scale.value < 1.05) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  // Pan to move (active only when zoomed)
  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value <= 1) return;
      // Clamp pan so image doesn't leave screen
      const maxX = (SCREEN.width * (scale.value - 1)) / 2;
      const maxY = (SCREEN.height * (scale.value - 1)) / 2;
      translateX.value = Math.max(-maxX, Math.min(maxX, savedTranslateX.value + e.translationX));
      translateY.value = Math.max(-maxY, Math.min(maxY, savedTranslateY.value + e.translationY));
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Double-tap to reset
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      scale.value = withSpring(1);
      savedScale.value = 1;
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const withDoubleTap = Gesture.Exclusive(doubleTapGesture, composed);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar hidden />

      {/* Close button */}
      <Box
        style={{ position: 'absolute', top: insets.top + 12, right: 16, zIndex: 10 }}
      >
        <Pressable
          onPress={onClose}
          className="w-9 h-9 rounded-full bg-black/60 border border-white/20 items-center justify-center"
        >
          <Icon as={X} size="sm" className="text-white" />
        </Pressable>
      </Box>

      {/* Hint */}
      <Box
        style={{ position: 'absolute', bottom: insets.bottom + 24, left: 0, right: 0, zIndex: 10 }}
        className="items-center"
      >
        <Box className="px-3 py-1 rounded-full bg-black/50">
          <Text size="xs" className="text-white/60">Pinch to zoom · Double-tap to reset</Text>
        </Box>
      </Box>

      <GestureDetector gesture={withDoubleTap}>
        <Animated.View
          style={[
            {
              flex: 1,
              width: SCREEN.width,
              height: SCREEN.height,
              alignItems: 'center',
              justifyContent: 'center',
            },
            animatedStyle,
          ]}
        >
          <Image
            source={{ uri }}
            style={{ width: SCREEN.width, height: SCREEN.height }}
            resizeMode="contain"
          />
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function LessonInfographicScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await fetchInfographics(id, controller.signal);
        setInfographics(data);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[LessonInfographicScreen]', err.message);
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  return (
    <Box className="flex-1 bg-background">
      {/* Header */}
      <Box
        className="bg-background border-b border-border w-full flex-row items-center px-4"
        style={{ paddingTop: insets.top, height: insets.top + 56 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
        >
          <Icon as={ChevronLeft} className="text-foreground" size="md" />
        </Pressable>
        <HStack space="sm" className="ml-3 flex-1 items-center">
          <Box className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center">
            <Icon as={ImageIcon} size="xs" className="text-primary" />
          </Box>
          <Text size="md" bold className="text-foreground">
            Infographics
          </Text>
        </HStack>
      </Box>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        <VStack space="md" className="px-6 pt-6">
          {/* Description badge */}
          <HStack
            space="sm"
            className="items-center bg-card border border-border rounded-xl px-4 py-3"
          >
            <Icon as={ImageIcon} size="sm" className="text-primary" />
            <Text size="sm" className="text-muted-foreground flex-1">
              Visual summaries and reference materials for this lesson
            </Text>
          </HStack>

          {/* Loading */}
          {loading && (
            <Box className="py-20 items-center">
              <ActivityIndicator color="#C79F27" />
            </Box>
          )}

          {/* Empty */}
          {!loading && infographics.length === 0 && (
            <Box className="py-20 items-center">
              <Icon as={ImageIcon} size="xl" className="text-muted-foreground mb-3" />
              <Text className="text-muted-foreground text-center">
                No infographics available for this lesson yet.
              </Text>
            </Box>
          )}

          {/* Infographic cards */}
          {!loading &&
            infographics.map((item) => {
              const imageUrl = getInfographicImageUrl(item);
              return (
                <VStack
                  key={item.id}
                  space="sm"
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  {/* Tappable image */}
                  {imageUrl ? (
                    <Pressable onPress={() => setViewerUri(imageUrl)}>
                      <Box style={{ position: 'relative' }}>
                        <Image
                          source={{ uri: imageUrl }}
                          style={{ width: '100%', aspectRatio: 16 / 9 }}
                          resizeMode="cover"
                        />
                        {/* Expand hint overlay */}
                        <Box
                          style={{ position: 'absolute', bottom: 8, right: 8 }}
                          className="w-7 h-7 rounded-full bg-black/50 items-center justify-center"
                        >
                          <Icon as={Maximize2} size="xs" className="text-white" />
                        </Box>
                      </Box>
                    </Pressable>
                  ) : (
                    <Box
                      className="w-full bg-card/50 items-center justify-center"
                      style={{ aspectRatio: 16 / 9 }}
                    >
                      <Icon as={ImageIcon} size="xl" className="text-muted-foreground" />
                    </Box>
                  )}

                  {/* Info */}
                  <VStack space="xs" className="px-4 pb-4">
                    {!!item.title && (
                      <Heading size="sm" className="text-foreground">
                        {item.title}
                      </Heading>
                    )}
                    {!!item.content_brief && (
                      <Text size="sm" className="text-muted-foreground leading-relaxed">
                        {item.content_brief}
                      </Text>
                    )}

                    {/* External link */}
                    {!!item.external_url && (
                      <Pressable
                        onPress={() => Linking.openURL(item.external_url)}
                        className="flex-row items-center mt-1"
                      >
                        <Icon as={ExternalLink} size="xs" className="text-primary mr-1" />
                        <Text size="sm" className="text-primary">
                          View full resource
                        </Text>
                      </Pressable>
                    )}
                  </VStack>
                </VStack>
              );
            })}
        </VStack>
      </ScrollView>

      {/* Full-screen image viewer modal */}
      <Modal
        visible={!!viewerUri}
        transparent={false}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewerUri(null)}
      >
        {viewerUri && (
          <ImageViewer uri={viewerUri} onClose={() => setViewerUri(null)} />
        )}
      </Modal>
    </Box>
  );
}
