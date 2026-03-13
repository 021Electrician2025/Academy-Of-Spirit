import React, { useState } from 'react';
import { Search, Star, Clock, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { VStack } from '@/components/ui/vstack';

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
  { title: 'Mindful Mornings', instructor: 'James Park', duration: '15 min/day', sessions: 14, rating: 4.8, level: 'Beginner', tag: 'Mindfulness', tagColor: '#1A2B4A' },
  { title: 'Box Breathing Pro', instructor: 'Emma Wilson', duration: '10 min/day', sessions: 7, rating: 4.7, level: 'All Levels', tag: 'Breathing', tagColor: '#1A3A2A' },
  { title: 'Deep Sleep Protocol', instructor: 'Dr. Raj Patel', duration: '20 min', sessions: 21, rating: 4.9, level: 'Beginner', tag: 'Sleep', tagColor: '#2D1A4A' },
  { title: 'Anxiety Relief', instructor: 'Lisa Torres', duration: '12 min/day', sessions: 10, rating: 4.6, level: 'Beginner', tag: 'Stress', tagColor: '#3A1A1A' },
];

export default function CoursesScreen() {
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <Box className="px-6 pb-4" style={{ paddingTop: insets.top + 16 }}>
        <Heading size="2xl" className="text-foreground tracking-tight mb-4">Courses</Heading>

        {/* Search */}
        <Input className="bg-card border border-border rounded-2xl h-12">
          <InputSlot className="pl-4">
            <InputIcon as={Search} className="text-muted-foreground" />
          </InputSlot>
          <InputField
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses..."
          />
        </Input>
      </Box>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingBottom: 20 }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <Button
              key={cat}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="rounded-full"
              onPress={() => setActiveCategory(cat)}
            >
              <ButtonText className={!isActive ? 'text-muted-foreground' : undefined}>
                {cat}
              </ButtonText>
            </Button>
          );
        })}
      </ScrollView>

      {/* Featured Course */}
      <Box className="mx-6 mb-7">
        <Box className="bg-hero rounded-3xl p-6" style={{ gap: 16 }}>
          <Box className="self-start bg-primary rounded-full px-3 py-1">
            <Text size="2xs" bold className="text-primary-foreground uppercase tracking-widest">
              Featured
            </Text>
          </Box>

          <VStack space="xs">
            <Heading size="xl" className="text-white tracking-tight">{FEATURED.title}</Heading>
            <Text size="sm" className="text-white/60">with {FEATURED.instructor}</Text>
          </VStack>

          <HStack space="lg">
            <HStack space="xs" className="items-center">
              <Icon as={Clock} className="text-white/50" size="xs" />
              <Text size="sm" className="text-white/60">{FEATURED.duration}</Text>
            </HStack>
            <HStack space="xs" className="items-center">
              <Icon as={Star} className="text-primary fill-primary" size="xs" />
              <Text size="sm" className="text-white/60">
                {FEATURED.rating} · {FEATURED.students} students
              </Text>
            </HStack>
          </HStack>

          <Button variant="default" size="lg" className="w-full rounded-2xl">
            <ButtonText className="font-bold">Start Course</ButtonText>
          </Button>
        </Box>
      </Box>

      {/* Course List */}
      <VStack space="md" className="px-6">
        <Text size="md" bold className="text-foreground mb-1">All Courses</Text>
        {COURSES.map((course, i) => (
          <Pressable
            key={i}
            className="flex-row bg-card rounded-[18px] overflow-hidden border border-border"
          >
            {/* Color accent strip */}
            <Box
              className="w-14 justify-center items-center"
              style={{ backgroundColor: course.tagColor }}
            >
              <Text size="2xs" bold className="text-white/80 text-center px-1">
                {course.tag}
              </Text>
            </Box>

            <VStack space="xs" className="flex-1 p-3.5">
              <Text size="sm" bold className="text-foreground">{course.title}</Text>
              <Text size="xs" className="text-muted-foreground">{course.instructor}</Text>
              <HStack space="md" className="items-center mt-1.5">
                <HStack space="xs" className="items-center">
                  <Icon as={Clock} className="text-muted-foreground" size="2xs" />
                  <Text size="xs" className="text-muted-foreground">{course.duration}</Text>
                </HStack>
                <HStack space="xs" className="items-center">
                  <Icon as={Star} className="text-primary fill-primary" size="2xs" />
                  <Text size="xs" className="text-muted-foreground">{course.rating}</Text>
                </HStack>
                <Box className="bg-border rounded-full px-2 py-0.5">
                  <Text size="2xs" className="text-muted-foreground">{course.level}</Text>
                </Box>
              </HStack>
            </VStack>

            <Box className="justify-center pr-3.5">
              <Icon as={ChevronRight} className="text-muted-foreground" size="md" />
            </Box>
          </Pressable>
        ))}
      </VStack>
    </ScrollView>
  );
}
