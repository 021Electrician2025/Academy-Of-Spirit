import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box } from '@/components/ui/box';
import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Icon } from '@/components/ui/icon';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { KeyboardAvoidingView } from '@/components/ui/keyboard-avoiding-view';
import { Pressable } from '@/components/ui/pressable';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/context/auth-context';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const emailRef = useRef<React.ElementRef<typeof InputField>>(null);
  const passwordRef = useRef<React.ElementRef<typeof InputField>>(null);
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
            className="w-10 h-10 rounded-xl bg-white/8 items-center justify-center mb-4"
          >
            <Icon as={ArrowLeft} className="text-white/80" size="lg" />
          </Pressable>
          <Box className="items-center mb-4">
            <Image
              source={require('@/assets/AoS_Logo.png')}
              style={{ width: 130, height: 130, resizeMode: 'contain' }}
            />
          </Box>
          <Heading size="2xl" className="text-white tracking-tight mb-1 text-center">
            Create Account
          </Heading>
          <Text size="sm" className="text-white/60 text-center">
            Join and begin your inner journey
          </Text>
        </Box>

        {/* Form */}
        <Box
          className="flex-1 bg-background rounded-t-3xl"
          style={{ marginTop: -16, paddingBottom: insets.bottom + 32, paddingHorizontal: 24, paddingTop: 32 }}
        >
          {/* Error */}
          {error ? (
            <Box className="bg-destructive/8 rounded-xl border border-destructive/19 px-3.5 py-2.5 mb-4">
              <Text size="sm" className="text-destructive">{error}</Text>
            </Box>
          ) : null}

          <VStack space="md">
            {/* Full Name */}
            <VStack space="xs">
              <Text size="sm" bold className="text-foreground tracking-wide">Full Name</Text>
              <Input className="bg-card border-2 border-border rounded-2xl h-14">
                <InputSlot className="pl-4">
                  <InputIcon as={User} className="text-muted-foreground" />
                </InputSlot>
                <InputField
                  placeholder="Your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => (emailRef.current as any)?.focus()}
                />
              </Input>
            </VStack>

            {/* Email */}
            <VStack space="xs">
              <Text size="sm" bold className="text-foreground tracking-wide">Email</Text>
              <Input className="bg-card border-2 border-border rounded-2xl h-14">
                <InputSlot className="pl-4">
                  <InputIcon as={Mail} className="text-muted-foreground" />
                </InputSlot>
                <InputField
                  ref={emailRef}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => (passwordRef.current as any)?.focus()}
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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <InputSlot className="pr-4" onPress={() => setShowPassword((v) => !v)}>
                  <InputIcon as={showPassword ? EyeOff : Eye} className="text-muted-foreground" />
                </InputSlot>
              </Input>
            </VStack>
          </VStack>

          <Text size="xs" className="text-muted-foreground mt-2 mb-7 pl-1">
            Use at least 8 characters with a mix of letters and numbers
          </Text>

          {/* Create Account Button */}
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-2xl h-14 mb-6"
            disabled={loading}
            onPress={handleRegister}
          >
            {loading ? (
              <><ButtonSpinner /><ButtonText className="ml-2">Creating...</ButtonText></>
            ) : (
              <ButtonText className="text-base font-bold">Create Account</ButtonText>
            )}
          </Button>

          {/* Login Link */}
          <HStack space="xs" className="justify-center">
            <Text size="sm" className="text-muted-foreground">Already have an account?</Text>
            <Pressable onPress={() => router.back()}>
              <Text size="sm" bold className="text-primary">Sign In</Text>
            </Pressable>
          </HStack>
        </Box>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
