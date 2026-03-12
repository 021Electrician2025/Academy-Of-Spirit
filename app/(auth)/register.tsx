import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      const data = err?.response?.data ?? {};
      if (data.email) {
        setError('This email is already in use.');
      } else if (data.password) {
        setError('Password is too weak. Use at least 8 characters.');
      } else {
        setError('Could not create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused: boolean) => ({
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
        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 32,
            backgroundColor: '#0F1628',
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <ArrowLeft color="rgba(255,255,255,0.8)" size={20} />
          </TouchableOpacity>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: '700',
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            Create Account
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            Join and begin your inner journey
          </Text>
        </View>

        {/* Form */}
        <View
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
          {/* Error */}
          {error ? (
            <View
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
            </View>
          ) : null}

          {/* Full Name */}
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                color: c.text,
                fontSize: 13,
                fontWeight: '600',
                marginBottom: 8,
                letterSpacing: 0.2,
              }}
            >
              Full Name
            </Text>
            <View style={inputStyle(nameFocused)}>
              <User color={nameFocused ? c.gold : c.muted} size={17} />
              <TextInput
                style={{ flex: 1, color: c.text, fontSize: 15, padding: 0 }}
                placeholder="Your name"
                placeholderTextColor={c.muted}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          </View>

          {/* Email */}
          <View style={{ marginBottom: 14 }}>
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
            <View style={inputStyle(emailFocused)}>
              <Mail color={emailFocused ? c.gold : c.muted} size={17} />
              <TextInput
                ref={emailRef}
                style={{ flex: 1, color: c.text, fontSize: 15, padding: 0 }}
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
            </View>
          </View>

          {/* Password */}
          <View style={{ marginBottom: 8 }}>
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
            <View style={inputStyle(passwordFocused)}>
              <Lock color={passwordFocused ? c.gold : c.muted} size={17} />
              <TextInput
                ref={passwordRef}
                style={{ flex: 1, color: c.text, fontSize: 15, padding: 0 }}
                placeholder="Min. 8 characters"
                placeholderTextColor={c.muted}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {showPassword ? (
                  <EyeOff color={c.muted} size={18} />
                ) : (
                  <Eye color={c.muted} size={18} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Password hint */}
          <Text
            style={{
              color: c.muted,
              fontSize: 12,
              marginBottom: 28,
              paddingLeft: 4,
            }}
          >
            Use at least 8 characters with a mix of letters and numbers
          </Text>

          {/* Create Account Button */}
          <TouchableOpacity
            onPress={handleRegister}
            activeOpacity={0.85}
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
              <ActivityIndicator color={isDark ? '#121212' : '#FFFFFF'} />
            ) : (
              <Text
                style={{
                  color: isDark ? '#121212' : '#FFFFFF',
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: 0.2,
                }}
              >
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
            <Text style={{ color: c.muted, fontSize: 14 }}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ color: c.gold, fontSize: 14, fontWeight: '600' }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
