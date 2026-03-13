import React, { useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react-native';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText, ButtonSpinner } from '@/components/ui/button';
import { Input, InputField, InputSlot, InputIcon } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { useAuth } from '@/context/auth-context';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Box
          className="bg-hero px-6 pb-10"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-white/8 items-center justify-center mb-7"
          >
            <Icon as={ArrowLeft} className="text-white/80" size="lg" />
          </Pressable>
          <Heading size="2xl" className="text-white tracking-tight mb-1">
            Forgot Password?
          </Heading>
          <Text size="sm" className="text-white/45">
            No worries — we&apos;ll send you reset instructions
          </Text>
        </Box>

        {/* Form */}
        <Box
          className="flex-1 bg-background rounded-t-3xl"
          style={{ marginTop: -16, paddingBottom: insets.bottom + 32, paddingHorizontal: 24, paddingTop: 32 }}
        >
          {sent ? (
            /* Success state */
            <VStack space="lg" className="items-center pt-6">
              <Box className="w-[72px] h-[72px] rounded-full bg-primary/9 border border-primary/25 items-center justify-center">
                <Icon as={CheckCircle} className="text-primary" size="xl" />
              </Box>
              <Heading size="lg" className="text-foreground text-center tracking-tight">
                Check your inbox
              </Heading>
              <Text size="sm" className="text-muted-foreground text-center leading-relaxed px-2">
                We sent a password reset link to{'\n'}
                <Text size="sm" bold className="text-foreground">{email}</Text>
              </Text>

              <Button
                variant="default"
                size="lg"
                className="w-full rounded-2xl h-14"
                onPress={() => router.back()}
              >
                <ButtonText className="text-base font-bold">Back to Sign In</ButtonText>
              </Button>

              <Pressable
                onPress={() => { setSent(false); setEmail(''); }}
                className="py-2"
              >
                <Text size="sm" className="text-muted-foreground">
                  Didn&apos;t receive it?{' '}
                  <Text size="sm" bold className="text-primary">Resend</Text>
                </Text>
              </Pressable>
            </VStack>
          ) : (
            <>
              <Text size="sm" className="text-muted-foreground leading-relaxed mb-7">
                Enter the email address associated with your account and we&apos;ll
                send you a link to reset your password.
              </Text>

              {/* Error */}
              {error ? (
                <Box className="bg-destructive/8 rounded-xl border border-destructive/19 px-3.5 py-2.5 mb-4">
                  <Text size="sm" className="text-destructive">{error}</Text>
                </Box>
              ) : null}

              {/* Email Input */}
              <VStack space="xs" className="mb-7">
                <Text size="sm" bold className="text-foreground tracking-wide">Email</Text>
                <Input className="bg-card border-2 border-border rounded-2xl h-14">
                  <InputSlot className="pl-4">
                    <InputIcon as={Mail} className="text-muted-foreground" />
                  </InputSlot>
                  <InputField
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSendReset}
                  />
                </Input>
              </VStack>

              {/* Send Button */}
              <Button
                variant="default"
                size="lg"
                className="w-full rounded-2xl h-14 mb-6"
                disabled={loading}
                onPress={handleSendReset}
              >
                {loading ? (
                  <><ButtonSpinner /><ButtonText className="ml-2">Sending...</ButtonText></>
                ) : (
                  <ButtonText className="text-base font-bold">Send Reset Link</ButtonText>
                )}
              </Button>

              {/* Back to login */}
              <HStack space="xs" className="justify-center">
                <Text size="sm" className="text-muted-foreground">Remember it?</Text>
                <Pressable onPress={() => router.back()}>
                  <Text size="sm" bold className="text-primary">Sign In</Text>
                </Pressable>
              </HStack>
            </>
          )}
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
