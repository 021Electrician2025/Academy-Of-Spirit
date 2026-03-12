import React, { useState } from 'react';
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
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth-context';

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const c = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSendReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch {
      setError('Could not send reset email. Please check the address and try again.');
    } finally {
      setLoading(false);
    }
  };

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
            paddingBottom: 40,
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
            Forgot Password?
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
            No worries — we&apos;ll send you reset instructions
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
          {sent ? (
            /* Success state */
            <View style={{ alignItems: 'center', paddingTop: 24, gap: 16 }}>
              <View
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: c.gold + '18',
                  borderWidth: 1.5,
                  borderColor: c.gold + '40',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle color={c.gold} size={34} />
              </View>
              <Text
                style={{
                  color: c.text,
                  fontSize: 20,
                  fontWeight: '700',
                  letterSpacing: -0.3,
                  textAlign: 'center',
                }}
              >
                Check your inbox
              </Text>
              <Text
                style={{
                  color: c.muted,
                  fontSize: 14,
                  textAlign: 'center',
                  lineHeight: 22,
                  paddingHorizontal: 8,
                }}
              >
                We sent a password reset link to{'\n'}
                <Text style={{ color: c.text, fontWeight: '600' }}>{email}</Text>
              </Text>

              <TouchableOpacity
                onPress={() => router.back()}
                activeOpacity={0.85}
                style={{
                  backgroundColor: c.gold,
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  width: '100%',
                  marginTop: 12,
                }}
              >
                <Text
                  style={{
                    color: isDark ? '#121212' : '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '700',
                    letterSpacing: 0.2,
                  }}
                >
                  Back to Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSent(false); setEmail(''); }}
                style={{ paddingVertical: 8 }}
              >
                <Text style={{ color: c.muted, fontSize: 13 }}>
                  Didn&apos;t receive it?{' '}
                  <Text style={{ color: c.gold, fontWeight: '600' }}>Resend</Text>
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Instruction */}
              <Text
                style={{
                  color: c.muted,
                  fontSize: 14,
                  lineHeight: 22,
                  marginBottom: 28,
                }}
              >
                Enter the email address associated with your account and we&apos;ll
                send you a link to reset your password.
              </Text>

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

              {/* Email Input */}
              <View style={{ marginBottom: 28 }}>
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
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: c.card,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: emailFocused ? c.gold : c.border,
                    paddingHorizontal: 14,
                    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
                    gap: 10,
                  }}
                >
                  <Mail color={emailFocused ? c.gold : c.muted} size={17} />
                  <TextInput
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
                    returnKeyType="done"
                    onSubmitEditing={handleSendReset}
                  />
                </View>
              </View>

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendReset}
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
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>

              {/* Back to login */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                <Text style={{ color: c.muted, fontSize: 14 }}>Remember it?</Text>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={{ color: c.gold, fontSize: 14, fontWeight: '600' }}>
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
