import React, { useState, useRef } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react-native';

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

export default function LoginScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordRef = useRef<React.ElementRef<typeof InputField>>(null);
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
        {/* Hero Section */}
        <Box
          className="bg-hero items-center"
          style={{ paddingTop: insets.top + 48, paddingBottom: 48, gap: 12 }}
        >
          <Box className="w-[72px] h-[72px] rounded-full bg-primary/20 border border-primary/50 items-center justify-center">
            <Icon as={Sparkles} className="text-primary" size="xl" />
          </Box>
          <VStack space="xs" className="items-center">
            <Heading size="xl" className="text-white tracking-tight">
              Academy of Spirit
            </Heading>
            <Text size="sm" className="text-white/45">
              Find your inner peace
            </Text>
          </VStack>
        </Box>

        {/* Form Card */}
        <Box
          className="flex-1 bg-background rounded-t-3xl"
          style={{ marginTop: -16, paddingBottom: insets.bottom + 32, paddingHorizontal: 24, paddingTop: 32 }}
        >
          {/* Heading */}
          <VStack space="xs" className="mb-7">
            <Heading size="xl" className="text-foreground tracking-tight">
              Welcome back
            </Heading>
            <Text size="sm" className="text-muted-foreground">
              Sign in to continue your journey
            </Text>
          </VStack>

          {/* Error */}
          {error ? (
            <Box className="bg-destructive/8 rounded-xl border border-destructive/19 px-3.5 py-2.5 mb-4">
              <Text size="sm" className="text-destructive">{error}</Text>
            </Box>
          ) : null}

          <VStack space="md">
            {/* Email */}
            <VStack space="xs">
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
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
              </Input>
            </VStack>

            {/* Password */}
            <VStack space="xs">
              <Text size="sm" bold className="text-foreground tracking-wide">Password</Text>
              <Input className="bg-card border-2 border-border rounded-2xl h-14">
                <InputSlot className="pl-4">
                  <InputIcon as={Lock} className="text-muted-foreground" />
                </InputSlot>
                <InputField
                  ref={passwordRef}
                  placeholder="Your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <InputSlot className="pr-4" onPress={() => setShowPassword((v) => !v)}>
                  <InputIcon as={showPassword ? EyeOff : Eye} className="text-muted-foreground" />
                </InputSlot>
              </Input>
            </VStack>
          </VStack>

          {/* Forgot Password */}
          <Pressable
            onPress={() => router.push('/(auth)/forgot-password')}
            className="self-end mt-3 mb-7"
          >
            <Text size="sm" className="text-primary font-medium">Forgot password?</Text>
          </Pressable>

          {/* Sign In Button */}
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-2xl h-14 mb-6"
            disabled={loading}
            onPress={handleSignIn}
          >
            {loading ? (
              <><ButtonSpinner /><ButtonText className="ml-2">Signing in...</ButtonText></>
            ) : (
              <ButtonText className="text-base font-bold">Sign In</ButtonText>
            )}
          </Button>

          {/* Register Link */}
          <HStack space="xs" className="justify-center">
            <Text size="sm" className="text-muted-foreground">Don&apos;t have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text size="sm" bold className="text-primary">Sign Up</Text>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
