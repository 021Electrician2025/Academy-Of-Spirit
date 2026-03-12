import React, { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Switch, Alert } from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Moon,
  Sun,
  Smartphone,
  Volume2,
  Globe,
  Shield,
  HelpCircle,
  ChevronRight,
  LogOut,
  Download,
  Star,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppTheme, type ThemePreference } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

type SettingRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
  c: (typeof Colors)['light'];
  isDark: boolean;
};

function SettingRow({ icon, iconBg, label, value, onPress, rightElement, destructive, c, isDark }: SettingRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          flex: 1,
          color: destructive ? '#FF4444' : c.text,
          fontSize: 15,
          fontWeight: '400',
        }}
      >
        {label}
      </Text>
      {value && <Text style={{ color: c.muted, fontSize: 14 }}>{value}</Text>}
      {rightElement}
      {!rightElement && !value && (
        <ChevronRight color={c.muted} size={16} />
      )}
    </TouchableOpacity>
  );
}

function Divider({ c }: { c: (typeof Colors)['light'] }) {
  return (
    <View style={{ height: 1, backgroundColor: c.border, marginLeft: 66 }} />
  );
}

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const { preference, setTheme } = useAppTheme();
  const { user, signOut } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const cardStyle = {
    backgroundColor: c.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
    overflow: 'hidden' as const,
    marginHorizontal: 24,
    marginBottom: 16,
    boxShadow: isDark ? undefined : '0 2px 8px rgba(0,0,0,0.04)',
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <View style={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 24 }}>
        <Text style={{ color: c.text, fontSize: 28, fontWeight: '700', letterSpacing: -0.5 }}>
          Settings
        </Text>
      </View>

      {/* Profile Card */}
      <View
        style={{
          marginHorizontal: 24,
          marginBottom: 24,
          backgroundColor: '#0F1628',
          borderRadius: 24,
          padding: 24,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: c.gold,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: isDark ? '#121212' : '#FFFFFF', fontSize: 24, fontWeight: '700' }}>
            {avatarLetter}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>{displayName}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 2 }}>
            {displayEmail}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: c.gold + '25',
            borderRadius: 100,
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderWidth: 1,
            borderColor: c.gold + '50',
          }}
        >
          <Text style={{ color: c.gold, fontSize: 12, fontWeight: '600' }}>Pro</Text>
        </View>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: 'row',
          marginHorizontal: 24,
          marginBottom: 24,
          gap: 10,
        }}
      >
        {[
          { value: '7', label: 'Day Streak' },
          { value: '43', label: 'Sessions' },
          { value: '12h', label: 'Total Time' },
        ].map((stat, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: c.card,
              borderRadius: 16,
              padding: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: c.border,
              boxShadow: isDark ? undefined : '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            <Text style={{ color: c.gold, fontSize: 22, fontWeight: '700' }}>{stat.value}</Text>
            <Text style={{ color: c.muted, fontSize: 11, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Preferences */}
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1, paddingHorizontal: 28, marginBottom: 8, textTransform: 'uppercase' }}>
        Preferences
      </Text>
      <View style={cardStyle}>
        <SettingRow
          icon={<Bell color="#FFFFFF" size={17} />}
          iconBg="#5B8DEF"
          label="Notifications"
          c={c}
          isDark={isDark}
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: c.border, true: c.gold }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <Divider c={c} />
        <SettingRow
          icon={<Volume2 color="#FFFFFF" size={17} />}
          iconBg="#5BC85B"
          label="Ambient Sounds"
          c={c}
          isDark={isDark}
          rightElement={
            <Switch
              value={sounds}
              onValueChange={setSounds}
              trackColor={{ false: c.border, true: c.gold }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <Divider c={c} />
        {/* Theme Picker */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: '#8B5CF6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Moon color="#FFFFFF" size={17} />
            </View>
            <Text style={{ flex: 1, color: c.text, fontSize: 15 }}>Appearance</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(
              [
                { value: 'system', label: 'System', Icon: Smartphone },
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark', label: 'Dark', Icon: Moon },
              ] as { value: ThemePreference; label: string; Icon: React.ComponentType<{ color: string; size: number }> }[]
            ).map(({ value, label, Icon }) => {
              const isActive = preference === value;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => setTheme(value)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingVertical: 12,
                    gap: 6,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor: isActive ? c.gold : c.border,
                    backgroundColor: isActive ? c.gold + '15' : 'transparent',
                  }}
                >
                  <Icon color={isActive ? c.gold : c.muted} size={18} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: isActive ? c.gold : c.muted,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
        <Divider c={c} />
        <SettingRow
          icon={<Globe color="#FFFFFF" size={17} />}
          iconBg="#F59E0B"
          label="Language"
          value="English"
          c={c}
          isDark={isDark}
          onPress={() => {}}
        />
      </View>

      {/* Content */}
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1, paddingHorizontal: 28, marginBottom: 8, textTransform: 'uppercase' }}>
        Content
      </Text>
      <View style={cardStyle}>
        <SettingRow
          icon={<Download color="#FFFFFF" size={17} />}
          iconBg="#14B8A6"
          label="Downloaded Sessions"
          value="3 files"
          c={c}
          isDark={isDark}
          onPress={() => {}}
        />
        <Divider c={c} />
        <SettingRow
          icon={<Star color="#FFFFFF" size={17} />}
          iconBg={c.gold}
          label="Rate the App"
          c={c}
          isDark={isDark}
          onPress={() => {}}
        />
      </View>

      {/* Support */}
      <Text style={{ color: c.muted, fontSize: 12, fontWeight: '600', letterSpacing: 1, paddingHorizontal: 28, marginBottom: 8, textTransform: 'uppercase' }}>
        Support
      </Text>
      <View style={cardStyle}>
        <SettingRow
          icon={<HelpCircle color="#FFFFFF" size={17} />}
          iconBg="#3B82F6"
          label="Help & FAQ"
          c={c}
          isDark={isDark}
          onPress={() => {}}
        />
        <Divider c={c} />
        <SettingRow
          icon={<Shield color="#FFFFFF" size={17} />}
          iconBg="#6B7280"
          label="Privacy Policy"
          c={c}
          isDark={isDark}
          onPress={() => {}}
        />
      </View>

      {/* Sign Out */}
      <View style={cardStyle}>
        <SettingRow
          icon={<LogOut color="#FF4444" size={17} />}
          iconBg="#FF444420"
          label="Sign Out"
          destructive
          c={c}
          isDark={isDark}
          onPress={handleSignOut}
          rightElement={<View />}
        />
      </View>

      <Text style={{ textAlign: 'center', color: c.muted, fontSize: 12, marginTop: 8 }}>
        Academy of Spirit v1.0.0
      </Text>
    </ScrollView>
  );
}
