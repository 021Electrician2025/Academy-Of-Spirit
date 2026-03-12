import React, { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { Users, Clock, Calendar } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LIVE_SESSION = {
  title: 'Morning Stillness',
  host: 'Dr. Sarah Chen',
  viewers: '1.2k',
  duration: '32 min live',
  topic: 'Mindfulness',
};

const UPCOMING = [
  {
    time: '2:00 PM',
    title: 'Breathwork for Energy',
    host: 'James Park',
    duration: '45 min',
    day: 'Today',
    color: '#1A2B4A',
  },
  {
    time: '5:00 PM',
    title: 'Evening Wind Down',
    host: 'Emma Wilson',
    duration: '30 min',
    day: 'Today',
    color: '#2D1A4A',
  },
  {
    time: '9:00 AM',
    title: 'Power of Presence',
    host: 'Dr. Raj Patel',
    duration: '60 min',
    day: 'Tomorrow',
    color: '#1A3A2A',
  },
  {
    time: '7:00 PM',
    title: 'Chakra Alignment',
    host: 'Lisa Torres',
    duration: '50 min',
    day: 'Thu',
    color: '#3A2A1A',
  },
];

function PulseDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.2, { duration: 900 }), -1, true);
    scale.value = withRepeat(withTiming(1.8, { duration: 900 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: color,
          },
          animStyle,
        ]}
      />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
    </View>
  );
}

export default function LiveScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 20 }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
          Live
        </Text>
        <Text style={{ color: c.muted, fontSize: 14, marginTop: 4 }}>
          Join live meditation sessions
        </Text>
      </View>

      {/* Live Now Card */}
      <View style={{ marginHorizontal: 24, marginBottom: 28 }}>
        <View
          style={{
            backgroundColor: '#0F1628',
            borderRadius: 24,
            overflow: 'hidden',
            padding: 24,
          }}
        >
          {/* Live badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <PulseDot color="#FF4444" />
            <Text style={{ color: '#FF4444', fontSize: 12, fontWeight: '700', letterSpacing: 1.5 }}>
              LIVE NOW
            </Text>
          </View>

          <View style={{ gap: 6, marginBottom: 20 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
              {LIVE_SESSION.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14 }}>
              with {LIVE_SESSION.host}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Users color="rgba(255,255,255,0.5)" size={14} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {LIVE_SESSION.viewers} watching
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Clock color="rgba(255,255,255,0.5)" size={14} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {LIVE_SESSION.duration}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: '#FF4444',
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>
              Join Session
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming */}
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Calendar color={c.muted} size={16} />
          <Text style={{ color: c.text, fontSize: 17, fontWeight: '600' }}>Upcoming Sessions</Text>
        </View>

        {UPCOMING.map((session, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: c.card,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: c.border,
              boxShadow: isDark ? undefined : '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* Time column */}
            <View
              style={{
                width: 70,
                paddingVertical: 18,
                backgroundColor: session.color,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{session.day}</Text>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700' }}>{session.time}</Text>
            </View>

            <View style={{ flex: 1, padding: 14, gap: 4 }}>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{session.title}</Text>
              <Text style={{ color: c.muted, fontSize: 13 }}>{session.host}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Clock color={c.muted} size={12} />
                <Text style={{ color: c.muted, fontSize: 12 }}>{session.duration}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={{
                marginRight: 14,
                backgroundColor: c.gold + '22',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}
            >
              <Text style={{ color: c.gold, fontSize: 12, fontWeight: '600' }}>Remind</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
