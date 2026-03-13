import { Check, ChevronRight, Flame, Play, Sun } from 'lucide-react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <Box style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 8 }}>
        <Box style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box style={{ gap: 2 }}>
            <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sun color={c.muted} size={14} strokeWidth={2} />
              <Text style={{ color: c.muted, fontSize: 14 }}>Good morning</Text>
            </Box>
            <Text style={{ color: c.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
              {displayName}
            </Text>
          </Box>
          <Box
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: c.gold,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: isDark ? '#121212' : '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
              {avatarLetter}
            </Text>
          </Box>
        </Box>

        {/* Date & Streak */}
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <Text style={{ color: c.muted, fontSize: 13 }}>{today}</Text>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Flame color={c.gold} size={15} fill={c.gold} />
            <Text style={{ color: c.gold, fontSize: 13, fontWeight: '600' }}>7 day streak</Text>
          </Box>
        </Box>
      </Box>

      {/* Today's Practice Hero Card */}
      <Box style={{ marginHorizontal: 24, marginTop: 16, marginBottom: 24 }}>
        <Box
          style={{
            height: 220,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#0F1628',
            padding: 24,
            justifyContent: 'space-between',
          }}
        >
          <Box style={{ gap: 6 }}>
            <Text
              style={{
                color: c.gold,
                fontSize: 11,
                fontWeight: '700',
                letterSpacing: 2.5,
                textTransform: 'uppercase',
              }}
            >
              Today&apos;s Practice
            </Text>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '700', letterSpacing: -0.5 }}>
              Morning Clarity
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
              15 min · Guided · Beginner
            </Text>
          </Box>

          <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 100,
                paddingHorizontal: 14,
                paddingVertical: 7,
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Mindfulness Series</Text>
            </Box>
            <Pressable
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: c.gold,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Play color={isDark ? '#121212' : '#211E1F'} size={18} fill={isDark ? '#121212' : '#211E1F'} />
            </Pressable>
          </Box>
        </Box>
      </Box>

      {/* Quick Start */}
      <Box style={{ paddingHorizontal: 24, marginBottom: 24, gap: 14 }}>
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '600' }}>Quick Start</Text>
          <Text style={{ color: c.gold, fontSize: 13, fontWeight: '500' }}>See all</Text>
        </Box>
        <Box style={{ flexDirection: 'row', gap: 10 }}>
          {QUICK_STARTS.map((item, i) => (
            <Pressable
              key={i}
              style={{
                flex: 1,
                backgroundColor: c.card,
                borderRadius: 18,
                padding: 16,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: c.border,
                boxShadow: isDark ? undefined : '0 2px 8px rgba(0,0,0,0.05)',
              }}
            >
              <Text style={{ color: c.gold, fontSize: 17, fontWeight: '700' }}>{item.duration}</Text>
              <Text style={{ color: c.muted, fontSize: 11, marginTop: 4 }}>{item.label}</Text>
            </Pressable>
          ))}
        </Box>
      </Box>

      {/* Weekly Progress */}
      <Box
        style={{
          marginHorizontal: 24,
          marginBottom: 24,
          backgroundColor: c.card,
          borderRadius: 24,
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
          boxShadow: isDark ? undefined : '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>Weekly Progress</Text>
          <Text style={{ color: c.muted, fontSize: 12 }}>5 of 7 days</Text>
        </Box>
        <Box style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {STREAK_DAYS.map((day, i) => (
            <Box key={i} style={{ alignItems: 'center', gap: 6 }}>
              <Box
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: day.done ? c.gold : c.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {day.done && (
                  <Check color={isDark ? '#121212' : '#FFFFFF'} size={14} strokeWidth={3} />
                )}
              </Box>
              <Text style={{ color: c.muted, fontSize: 11 }}>{day.label}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Recommended */}
      <Box style={{ gap: 14, marginBottom: 8 }}>
        <Box style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24 }}>
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '600' }}>Recommended</Text>
          <Box style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Text style={{ color: c.gold, fontSize: 13, fontWeight: '500' }}>See all</Text>
            <ChevronRight color={c.gold} size={14} />
          </Box>
        </Box>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
        >
          {RECOMMENDED.map((course, i) => (
            <Pressable
              key={i}
              style={{
                width: 158,
                height: 200,
                borderRadius: 22,
                backgroundColor: course.bg,
                overflow: 'hidden',
                padding: 18,
                justifyContent: 'flex-end',
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 4 }}>
                {course.sessions} sessions
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700', lineHeight: 22 }}>
                {course.title}
              </Text>
              <Box
                style={{
                  marginTop: 10,
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 100,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>{course.level}</Text>
              </Box>
            </Pressable>
          ))}
        </ScrollView>
      </Box>
    </ScrollView>
  );
}
