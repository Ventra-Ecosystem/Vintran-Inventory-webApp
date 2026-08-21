'use client';

import { useEffect, useState } from 'react';
import { authApi, type MeResponse } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';

/**
 * Fetches the current user's profile from /api/me and caches it.
 * Updates the auth store with the latest user details on mount.
 */
export function useMe() {
  const { isAuthenticated, setUserProfile } = useAuthStore();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    setLoading(true);
    authApi
      .getMe()
      .then((res) => {
        setMe(res.data);
        // Sync auth store with latest profile from server
        setUserProfile({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          isOwner: res.data.isOwner,
          businessId: res.data.businessId,
          businessName: res.data.businessName,
        });
      })
      .catch(() => {
        // Silently fail — profile display will fall back to store values
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  return { me, loading };
}
