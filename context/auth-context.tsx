import React, { createContext, useContext, useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { pb } from '@/lib/pocketbase';

interface AuthContextValue {
  user: RecordModel | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  requestPasswordReset: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RecordModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // AsyncAuthStore loads from AsyncStorage asynchronously —
    // wait one tick then check if a saved session exists and validate it.
    const init = async () => {
      try {
        // Give AsyncAuthStore time to hydrate from AsyncStorage
        await new Promise<void>((r) => setTimeout(r, 80));

        if (pb.authStore.isValid) {
          // Refresh token to verify it's still accepted by the server
          await pb.collection('users').authRefresh();
          setUser(pb.authStore.record);
        }
      } catch {
        // Token expired or invalid — clear it so user lands on login
        pb.authStore.clear();
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Keep user state in sync whenever the auth store changes
    const unsubscribe = pb.authStore.onChange((_, record) => {
      setUser(record ?? null);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await pb.collection('users').authWithPassword(email, password);
    setUser(pb.authStore.record);
  };

  const signUp = async (name: string, email: string, password: string) => {
    await pb.collection('users').create({
      name,
      email,
      password,
      passwordConfirm: password,
    });
    await pb.collection('users').authWithPassword(email, password);
    setUser(pb.authStore.record);
  };

  const signOut = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    await pb.collection('users').requestPasswordReset(email);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, requestPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
