'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type SubscriptionPlan = 'Basic' | 'Standard' | 'Professional' | 'Enterprise';

interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  isOwner: boolean;
  hasBusiness: boolean;
  businessId: string | null;
  businessName: string | null;
  plan: SubscriptionPlan | null;
  permissions: string[];
  twoFactorPending: boolean;
  verifyToken: string | null;

  setTokens: (tokens: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    hasBusiness: boolean;
    businessId?: string;
    businessName?: string;
    plan?: string;
  }) => void;
  setBusiness: (business: { businessId?: string; businessName?: string; plan?: string }) => void;
  setUserProfile: (profile: { firstName?: string; lastName?: string; isOwner?: boolean; email?: string; businessId?: string; businessName?: string }) => void;
  setTwoFactorPending: (verifyToken: string) => void;
  setPermissions: (perms: string[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      userId: null,
      firstName: null,
      lastName: null,
      email: null,
      isOwner: false,
      hasBusiness: false,
      businessId: null,
      businessName: null,
      plan: null,
      permissions: [],
      twoFactorPending: false,
      verifyToken: null,

      setTokens: (tokens) => {
        // Write a cookie so middleware can verify auth server-side
        document.cookie = `auth-token=${tokens.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        set({
          isAuthenticated: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          userId: tokens.userId,
          hasBusiness: tokens.hasBusiness,
          businessId: tokens.businessId ?? null,
          businessName: tokens.businessName ?? null,
          plan: (tokens.plan as SubscriptionPlan) ?? null,
          twoFactorPending: false,
          verifyToken: null,
        });
      },

      setBusiness: (business) =>
        set({
          hasBusiness: true,
          businessId: business.businessId ?? null,
          businessName: business.businessName ?? null,
          plan: (business.plan as SubscriptionPlan) ?? null,
        }),

      setUserProfile: (profile) =>
        set((state) => ({
          firstName: profile.firstName ?? state.firstName,
          lastName: profile.lastName ?? state.lastName,
          isOwner: profile.isOwner ?? state.isOwner,
          email: profile.email ?? state.email,
          businessId: profile.businessId ?? state.businessId,
          businessName: profile.businessName ?? state.businessName,
        })),

      setTwoFactorPending: (verifyToken) =>
        set({ twoFactorPending: true, verifyToken }),

      setPermissions: (permissions) => set({ permissions }),

      logout: () => {
        // Clear the auth cookie so middleware redirects immediately
        document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          userId: null,
          firstName: null,
          lastName: null,
          email: null,
          isOwner: false,
          hasBusiness: false,
          businessId: null,
          businessName: null,
          plan: null,
          permissions: [],
          twoFactorPending: false,
          verifyToken: null,
        });
      },
    }),
    {
      name: 'vint-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the token fields — not UI/transient state
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
        isOwner: state.isOwner,
        hasBusiness: state.hasBusiness,
        businessId: state.businessId,
        businessName: state.businessName,
        plan: state.plan,
        permissions: state.permissions,
      }),
    },
  ),
);
