import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Search, Star, Clock, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const CATEGORIES = ['All', 'Mindfulness', 'Breathing', 'Sleep', 'Stress', 'Focus'];

const FEATURED = {
  title: 'Inner Peace Mastery',
  instructor: 'Dr. Sarah Chen',
  duration: '4 weeks',
  sessions: 28,
  rating: 4.9,
  students: '12.4k',
  level: 'All Levels',
  bg: '#0F1628',
};

const COURSES = [
  {
    title: 'Mindful Mornings',
    instructor: 'James Park',
    duration: '15 min/day',
    sessions: 14,
    rating: 4.8,
    level: 'Beginner',
    tag: 'Mindfulness',
    tagColor: '#1A2B4A',
  },
  {
    title: 'Box Breathing Pro',
    instructor: 'Emma Wilson',
    duration: '10 min/day',
    sessions: 7,
    rating: 4.7,
    level: 'All Levels',
    tag: 'Breathing',
    tagColor: '#1A3A2A',
  },
  {
    title: 'Deep Sleep Protocol',
    instructor: 'Dr. Raj Patel',
    duration: '20 min',
    sessions: 21,
    rating: 4.9,
    level: 'Beginner',
    tag: 'Sleep',
    tagColor: '#2D1A4A',
  },
  {
    title: 'Anxiety Relief',
    instructor: 'Lisa Torres',
    duration: '12 min/day',
    sessions: 10,
    rating: 4.6,
    level: 'Beginner',
    tag: 'Stress',
    tagColor: '#3A1A1A',
  },
];

export default function CoursesScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 16 }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5, marginBottom: 16 }}>
          Courses
        </Text>

        {/* Search */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: c.card,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: c.border,
            gap: 10,
          }}
        >
          <Search color={c.muted} size={17} strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses..."
            placeholderTextColor={c.muted}
            style={{ flex: 1, color: c.text, fontSize: 15 }}
          />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 20 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.7}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 100,
                backgroundColor: isActive ? c.gold : c.card,
                borderWidth: 1,
                borderColor: isActive ? c.gold : c.border,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: isActive ? (isDark ? '#121212' : '#FFFFFF') : c.muted,
                }}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Featured Course */}
      <View style={{ marginHorizontal: 24, marginBottom: 28 }}>
        <View
          style={{
            backgroundColor: FEATURED.bg,
            borderRadius: 24,
            padding: 24,
            gap: 16,
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: c.gold,
              borderRadius: 100,
              paddingHorizontal: 12,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: isDark ? '#121212' : '#211E1F', fontSize: 11, fontWeight: '700' }}>
              FEATURED
            </Text>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 }}>
              {FEATURED.title}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
              with {FEATURED.instructor}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Clock color="rgba(255,255,255,0.5)" size={13} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{FEATURED.duration}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Star color={c.gold} size={13} fill={c.gold} />
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                {FEATURED.rating} · {FEATURED.students} students
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            style={{
              backgroundColor: c.gold,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: isDark ? '#121212' : '#211E1F', fontSize: 15, fontWeight: '700' }}>
              Start Course
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Course List */}
      <View style={{ paddingHorizontal: 24, gap: 12 }}>
        <Text style={{ color: c.text, fontSize: 17, fontWeight: '600', marginBottom: 4 }}>
          All Courses
        </Text>
        {COURSES.map((course, i) => (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              backgroundColor: c.card,
              borderRadius: 18,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: c.border,
              boxShadow: isDark ? undefined : '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* Color accent strip */}
            <View style={{ width: 56, backgroundColor: course.tagColor, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', textAlign: 'center', paddingHorizontal: 4 }}>
                {course.tag}
              </Text>
            </View>

            <View style={{ flex: 1, padding: 14, gap: 4 }}>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{course.title}</Text>
              <Text style={{ color: c.muted, fontSize: 12 }}>{course.instructor}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock color={c.muted} size={12} />
                  <Text style={{ color: c.muted, fontSize: 12 }}>{course.duration}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Star color={c.gold} size={12} fill={c.gold} />
                  <Text style={{ color: c.muted, fontSize: 12 }}>{course.rating}</Text>
                </View>
                <View style={{ backgroundColor: c.border, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 }}>
                  <Text style={{ color: c.muted, fontSize: 11 }}>{course.level}</Text>
                </View>
              </View>
            </View>

            <View style={{ justifyContent: 'center', paddingRight: 14 }}>
              <ChevronRight color={c.muted} size={18} />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
