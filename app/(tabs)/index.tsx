import { Check, ChevronRight, Flame, Play, Sun } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-context';

const QUICK_STARTS = [
  { duration: '5 min', label: 'Quick Reset' },
  { duration: '10 min', label: 'Focus' },
  { duration: '20 min', label: 'Deep Dive' },
];

const STREAK_DAYS = [
  { label: 'M', done: true },
  { label: 'T', done: true },
  { label: 'W', done: true },
  { label: 'T', done: true },
  { label: 'F', done: true },
  { label: 'S', done: false },
  { label: 'S', done: false },
];

const RECOMMENDED = [
  { title: '7-Day Calm', sessions: 7, level: 'Beginner', bg: '#1A2B4A' },
  { title: 'Breathe Better', sessions: 5, level: 'All Levels', bg: '#1A3A2A' },
  { title: 'Sleep Journey', sessions: 10, level: 'Beginner', bg: '#2D1A4A' },
  { title: 'Stress Less', sessions: 6, level: 'Intermediate', bg: '#3A2A1A' },
];

const today = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <Box className="px-6 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <HStack className="items-start justify-between">
          <VStack space="xs">
            <HStack space="xs" className="items-center">
              <Icon as={Sun} className="text-muted-foreground" size="xs" />
              <Text size="sm" className="text-muted-foreground">Good morning</Text>
            </HStack>
            <Heading size="2xl" className="text-foreground tracking-tight">
              {displayName}
            </Heading>
          </VStack>
          <Box className="w-12 h-12 rounded-full bg-primary items-center justify-center">
            <Text size="lg" bold className="text-primary-foreground">{avatarLetter}</Text>
          </Box>
        </HStack>

        {/* Date & Streak */}
        <HStack className="items-center justify-between mt-3">
          <Text size="xs" className="text-muted-foreground">{today}</Text>
          <HStack space="xs" className="items-center">
            <Icon as={Flame} className="text-primary fill-primary" size="xs" />
            <Text size="xs" bold className="text-primary">7 day streak</Text>
          </HStack>
        </HStack>
      </Box>

      {/* Today's Practice Hero Card */}
      <Box className="mx-6 mt-4 mb-6">
        <Box className="bg-hero rounded-3xl overflow-hidden p-6 h-56 justify-between">
          <VStack space="xs">
            <Text size="2xs" bold className="text-primary tracking-widest uppercase">
              Today&apos;s Practice
            </Text>
            <Heading size="2xl" className="text-white tracking-tight">
              Morning Clarity
            </Heading>
            <Text size="sm" className="text-white/55">
              15 min · Guided · Beginner
            </Text>
          </VStack>

          <HStack className="items-center justify-between">
            <Box className="bg-white/10 rounded-full px-3.5 py-1.5">
              <Text size="sm" className="text-white/70">Mindfulness Series</Text>
            </Box>
            <Pressable className="w-14 h-14 rounded-full bg-primary items-center justify-center">
              <Icon as={Play} className="text-primary-foreground fill-primary-foreground" size="lg" />
            </Pressable>
          </HStack>
        </Box>
      </Box>

      {/* Quick Start */}
      <VStack space="md" className="px-6 mb-6">
        <HStack className="items-center justify-between">
          <Text size="md" bold className="text-foreground">Quick Start</Text>
          <Text size="sm" className="text-primary font-medium">See all</Text>
        </HStack>
        <HStack space="sm">
          {QUICK_STARTS.map((item, i) => (
            <Pressable
              key={i}
              className="flex-1 bg-card rounded-[18px] p-4 items-center border border-border"
            >
              <Text size="lg" bold className="text-primary">{item.duration}</Text>
              <Text size="2xs" className="text-muted-foreground mt-1">{item.label}</Text>
            </Pressable>
          ))}
        </HStack>
      </VStack>

      {/* Weekly Progress */}
      <Box className="mx-6 mb-6 bg-card rounded-3xl p-5 border border-border">
        <HStack className="items-center justify-between mb-4">
          <Text size="sm" bold className="text-foreground">Weekly Progress</Text>
          <Text size="xs" className="text-muted-foreground">5 of 7 days</Text>
        </HStack>
        <HStack className="justify-between">
          {STREAK_DAYS.map((day, i) => (
            <VStack key={i} space="xs" className="items-center">
              <Box
                className={`w-9 h-9 rounded-full items-center justify-center ${day.done ? 'bg-primary' : 'bg-border'}`}
              >
                {day.done && (
                  <Icon as={Check} className="text-primary-foreground" size="xs" />
                )}
              </Box>
              <Text size="2xs" className="text-muted-foreground">{day.label}</Text>
            </VStack>
          ))}
        </HStack>
      </Box>

      {/* Recommended */}
      <VStack space="md" className="mb-2">
        <HStack className="items-center justify-between px-6">
          <Text size="md" bold className="text-foreground">Recommended</Text>
          <HStack space="xs" className="items-center">
            <Text size="sm" className="text-primary font-medium">See all</Text>
            <Icon as={ChevronRight} className="text-primary" size="xs" />
          </HStack>
        </HStack>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          {RECOMMENDED.map((course, i) => (
            <Pressable
              key={i}
              className="w-40 h-52 rounded-[22px] overflow-hidden p-[18px] justify-end"
              style={{ backgroundColor: course.bg }}
            >
              <Text size="xs" className="text-white/50 mb-1">{course.sessions} sessions</Text>
              <Text size="md" bold className="text-white leading-tight">{course.title}</Text>
              <Box className="mt-2.5 self-start bg-white/15 rounded-full px-2.5 py-1">
                <Text size="2xs" className="text-white/85">{course.level}</Text>
              </Box>
            </Pressable>
          ))}
        </ScrollView>
      </VStack>
    </ScrollView>
  );
}
