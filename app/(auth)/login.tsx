import React, { useState, useRef } from 'react';
import {
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<TextInput>(null);
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.message ?? err?.message ?? '';
      if (msg.toLowerCase().includes('credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputContainerStyle = (focused: boolean) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: c.card,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: focused ? c.gold : c.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    gap: 10,
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Box
          style={{
            backgroundColor: '#0F1628',
            paddingTop: insets.top + 48,
            paddingBottom: 48,
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Box
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: c.gold + '20',
              borderWidth: 1.5,
              borderColor: c.gold + '50',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles color={c.gold} size={32} />
          </Box>
          <Box style={{ alignItems: 'center', gap: 6 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 26,
                fontWeight: '700',
                letterSpacing: -0.5,
              }}
            >
              Academy of Spirit
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
              Find your inner peace
            </Text>
          </Box>
        </Box>

        {/* Form Card */}
        <Box
          style={{
            flex: 1,
            backgroundColor: c.background,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            marginTop: -16,
            paddingHorizontal: 24,
            paddingTop: 32,
            paddingBottom: insets.bottom + 32,
          }}
        >
          {/* Heading */}
          <Box style={{ marginBottom: 28 }}>
            <Text
              style={{
                color: c.text,
                fontSize: 24,
                fontWeight: '700',
                letterSpacing: -0.4,
                marginBottom: 4,
              }}
            >
              Welcome back
            </Text>
            <Text style={{ color: c.muted, fontSize: 14 }}>
              Sign in to continue your journey
            </Text>
          </Box>

          {/* Error */}
          {error ? (
            <Box
              style={{
                backgroundColor: '#FF444415',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#FF444430',
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginBottom: 18,
              }}
            >
              <Text style={{ color: '#FF4444', fontSize: 13 }}>{error}</Text>
            </Box>
          ) : null}

          {/* Email */}
          <Box style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: c.text,
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
                letterSpacing: 0.2,
              }}
            >
              Email
            </Text>
            <Box style={inputContainerStyle(emailFocused)}>
              <Mail color={emailFocused ? c.gold : c.muted} size={17} />
              <Input style={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent' }}>
                <InputField
                  style={{ color: c.text, fontSize: 15, padding: 0 }}
                  placeholder="you@example.com"
                  placeholderTextColor={c.muted}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </Input>
            </Box>
          </Box>

          {/* Password */}
          <Box style={{ marginBottom: 10 }}>
            <Text
              style={{
                color: c.text,
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
                letterSpacing: 0.2,
              }}
            >
              Password
            </Text>
            <Box style={inputContainerStyle(passwordFocused)}>
              <Lock color={passwordFocused ? c.gold : c.muted} size={17} />
              <Input style={{ flex: 1, borderWidth: 0, backgroundColor: 'transparent' }}>
                <InputField
                  ref={passwordRef}
                  style={{ color: c.text, fontSize: 15, padding: 0 }}
                  placeholder="Your password"
                  placeholderTextColor={c.muted}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
              </Input>
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff color={c.muted} size={18} />
                ) : (
                  <Eye color={c.muted} size={18} />
                )}
              </Pressable>
            </Box>
          </Box>

          {/* Forgot Password */}
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            style={{ alignSelf: 'flex-end', marginBottom: 28 }}
          >
            <Text style={{ color: c.gold, fontSize: 13, fontWeight: '500' }}>
              Forgot password?
            </Text>
          </Pressable>

          {/* Sign In Button */}
          <Pressable
            onPress={handleSignIn}
            disabled={loading}
            style={{
              backgroundColor: c.gold,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <Spinner color={isDark ? '#121212' : '#FFFFFF'} />
            ) : (
              <Text
                style={{
                  color: isDark ? '#121212' : '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: 0.2,
                }}
              >
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Register Link */}
          <Box style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ color: c.muted, fontSize: 14 }}>
              Don&apos;t have an account?
            </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={{ color: c.gold, fontSize: 14, fontWeight: '600' }}>
                Sign Up
              </Text>
            </Pressable>
          </Box>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
