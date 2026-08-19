'use client';

/**
 * Rehydrates the auth store from localStorage on first client render.
 * Next.js App Router runs Zustand's create() on the server where
 * localStorage is unavailable — loadInitialState() returns {} server-side.
 * This component runs only on the client after hydration and syncs the store.
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    // Synchronize auth store & auth-token cookie from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('vint-auth');
        if (raw) {
          const parsed = JSON.parse(raw);
          const state = parsed?.state ?? parsed;
          if (state?.accessToken) {
            document.cookie = `auth-token=${state.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          }
        }
      } catch {
        // Ignore JSON parse error
      }
    }
  }, []);

  return <>{children}</>;
}
