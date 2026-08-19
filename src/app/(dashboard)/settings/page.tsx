'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const { logout, businessName, plan } = useAuthStore();
  const [me, setMe] = useState<any>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    authApi.getMe()
      .then((res) => setMe(res.data))
      .catch(() => {/* token may have expired — ignore */});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // always clear local state regardless
    }
    logout();
    toast.success('Logged out');
    router.push('/login');
  };

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-text-default">Settings</h1>

      {/* Profile card */}
      <div className="bg-bg-surface rounded-2xl p-6 flex flex-col items-center gap-2">
        <div className="w-16 h-16 rounded-full bg-brand-lighter flex items-center justify-center text-brand text-2xl font-bold">
          {me?.firstName?.charAt(0) ?? '?'}
        </div>
        <p className="text-sm font-bold text-text-default">
          {me ? `${me.firstName} ${me.lastName}` : '—'}
        </p>
        <p className="text-xs text-text-muted">{me?.email ?? '—'}</p>
        {businessName && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-text-muted">{businessName}</span>
            {plan && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-brand">{plan}</span>
            )}
          </div>
        )}
      </div>

      {/* Settings rows */}
      <div className="bg-bg-surface rounded-2xl overflow-hidden divide-y divide-[#9B9EA34D]">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-text-default hover:bg-gray-50"
          onClick={() => router.push('/forgot-password')}
        >
          Change Password
          <span className="text-text-muted text-lg">›</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-text-default hover:bg-gray-50"
          onClick={() => router.push('/login')}
        >
          Account & Security
          <span className="text-text-muted text-lg">›</span>
        </button>
      </div>

      {/* Logout */}
      <button
        type="button"
        disabled={loggingOut}
        onClick={handleLogout}
        className="w-full h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold disabled:opacity-50"
      >
        {loggingOut ? 'Logging out…' : 'Log Out'}
      </button>
    </div>
  );
}
