import { router } from 'expo-router';
import {
  Bell,
  ChevronRight,
  Download,
  Globe,
  HelpCircle,
  LogOut,
  Moon,
  Shield,
  Smartphone,
  Star,
  Sun,
  Volume2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AlertDialog, AlertDialogBackdrop, AlertDialogBody,
  AlertDialogContent, AlertDialogFooter, AlertDialogHeader,
} from '@/components/ui/alert-dialog';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Switch } from '@/components/ui/switch';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-context';
import { useAppTheme, type ThemePreference } from '@/context/theme-context';

type SettingRowProps = {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
};

function SettingRow({ icon, iconBg, label, value, onPress, rightElement, destructive }: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5"
      style={{ gap: 14 }}
    >
      <Box
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </Box>
      <Text className={`flex-1 text-sm ${destructive ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
      {value && <Text size="sm" className="text-muted-foreground">{value}</Text>}
      {rightElement}
      {!rightElement && !value && (
        <Icon as={ChevronRight} className="text-muted-foreground" size="sm" />
      )}
    </Pressable>
  );
}

const cardClassName = 'bg-card rounded-[20px] border border-border overflow-hidden mx-6 mb-4';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const { preference, setTheme } = useAppTheme();
  const { user, signOut } = useAuth();

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* Header */}
      <Box className="px-6 pb-6" style={{ paddingTop: insets.top + 16 }}>
        <Heading size="2xl" className="text-foreground tracking-tight">Settings</Heading>
      </Box>

      {/* Profile Card */}
      <Box className="mx-6 mb-6 bg-hero rounded-3xl p-6 flex-row items-center" style={{ gap: 16 }}>
        <Box className="w-[60px] h-[60px] rounded-full bg-primary items-center justify-center">
          <Text size="2xl" bold className="text-primary-foreground">{avatarLetter}</Text>
        </Box>
        <VStack space="xs" className="flex-1">
          <Text size="lg" bold className="text-white">{displayName}</Text>
          <Text size="xs" className="text-white/50">{displayEmail}</Text>
        </VStack>
        <Box className="bg-primary/25 rounded-full px-3 py-1 border border-primary/50">
          <Text size="xs" bold className="text-primary">Pro</Text>
        </Box>
      </Box>

      {/* Stats */}
      <HStack space="sm" className="mx-6 mb-6">
        {[
          { value: '7', label: 'Day Streak' },
          { value: '43', label: 'Sessions' },
          { value: '12h', label: 'Total Time' },
        ].map((stat, i) => (
          <Box
            key={i}
            className="flex-1 bg-card rounded-2xl p-3.5 items-center border border-border"
          >
            <Text size="xl" bold className="text-primary">{stat.value}</Text>
            <Text size="2xs" className="text-muted-foreground mt-0.5">{stat.label}</Text>
          </Box>
        ))}
      </HStack>

      {/* Preferences */}
      <Text size="xs" bold className="text-muted-foreground tracking-widest uppercase px-7 mb-2">
        Preferences
      </Text>
      <Box className={cardClassName}>
        <SettingRow
          icon={<Icon as={Bell} className="text-white" size="sm" />}
          iconBg="#5B8DEF"
          label="Notifications"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
            />
          }
        />
        <Divider className="ml-[66px]" />
        <SettingRow
          icon={<Icon as={Volume2} className="text-white" size="sm" />}
          iconBg="#5BC85B"
          label="Ambient Sounds"
          rightElement={
            <Switch
              value={sounds}
              onValueChange={setSounds}
            />
          }
        />
        <Divider className="ml-[66px]" />

        {/* Theme Picker */}
        <Box className="px-4 py-3.5" style={{ gap: 12 }}>
          <HStack className="items-center" style={{ gap: 14 }}>
            <Box className="w-9 h-9 rounded-xl items-center justify-center" style={{ backgroundColor: '#8B5CF6' }}>
              <Icon as={Moon} className="text-white" size="sm" />
            </Box>
            <Text className="flex-1 text-sm text-foreground">Appearance</Text>
          </HStack>
          <HStack space="sm">
            {(
              [
                { value: 'system', label: 'System', Icon: Smartphone },
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark', label: 'Dark', Icon: Moon },
              ] as { value: ThemePreference; label: string; Icon: React.ComponentType<any> }[]
            ).map(({ value, label, Icon: ThemeIcon }) => {
              const isActive = preference === value;
              return (
                <Pressable
                  key={value}
                  onPress={() => setTheme(value)}
                  className={`flex-1 flex-col items-center py-3 rounded-2xl border-2 ${isActive ? 'border-primary bg-primary/15' : 'border-border bg-transparent'}`}
                  style={{ gap: 6 }}
                >
                  <Icon as={ThemeIcon} className={isActive ? 'text-primary' : 'text-muted-foreground'} size="sm" />
                  <Text size="xs" bold className={isActive ? 'text-primary' : 'text-muted-foreground'}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </HStack>
        </Box>
        <Divider className="ml-[66px]" />
        <SettingRow
          icon={<Icon as={Globe} className="text-white" size="sm" />}
          iconBg="#F59E0B"
          label="Language"
          value="English"
          onPress={() => { }}
        />
      </Box>

      {/* Content */}
      <Text size="xs" bold className="text-muted-foreground tracking-widest uppercase px-7 mb-2">
        Content
      </Text>
      <Box className={cardClassName}>
        <SettingRow
          icon={<Icon as={Download} className="text-white" size="sm" />}
          iconBg="#14B8A6"
          label="Downloaded Sessions"
          value="3 files"
          onPress={() => { }}
        />
        <Divider className="ml-[66px]" />
        <SettingRow
          icon={<Icon as={Star} className="text-white" size="sm" />}
          iconBg="rgb(var(--primary))"
          label="Rate the App"
          onPress={() => { }}
        />
      </Box>

      {/* Support */}
      <Text size="xs" bold className="text-muted-foreground tracking-widest uppercase px-7 mb-2">
        Support
      </Text>
      <Box className={cardClassName}>
        <SettingRow
          icon={<Icon as={HelpCircle} className="text-white" size="sm" />}
          iconBg="#3B82F6"
          label="Help & FAQ"
          onPress={() => { }}
        />
        <Divider className="ml-[66px]" />
        <SettingRow
          icon={<Icon as={Shield} className="text-white" size="sm" />}
          iconBg="#6B7280"
          label="Privacy Policy"
          onPress={() => { }}
        />
      </Box>

      {/* Sign Out */}
      <Box className={cardClassName}>
        <SettingRow
          icon={<Icon as={LogOut} className="text-destructive" size="sm" />}
          iconBg="rgba(239,68,68,0.13)"
          label="Sign Out"
          destructive
          onPress={() => setSignOutDialogOpen(true)}
          rightElement={<Box />}
        />
      </Box>

      <Text size="xs" className="text-muted-foreground text-center mt-2">
        Academy of Spirit v1.0.0
      </Text>

      <AlertDialog isOpen={signOutDialogOpen} onClose={() => setSignOutDialogOpen(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Text size="lg" bold className="text-foreground">Sign Out</Text>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text size="sm" className="text-muted-foreground">Are you sure you want to sign out?</Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button variant="ghost" onPress={() => setSignOutDialogOpen(false)}>
              <ButtonText className="text-muted-foreground">Cancel</ButtonText>
            </Button>
            <Button
              variant="destructive"
              onPress={() => {
                setSignOutDialogOpen(false);
                signOut();
                router.replace('/(auth)/login');
              }}
            >
              <ButtonText>Sign Out</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScrollView>
  );
}
