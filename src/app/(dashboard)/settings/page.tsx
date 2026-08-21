'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/src/store/authStore';
import { useMe } from '@/src/hooks/useMe';
import { authApi, businessApi, usersApi } from '@/src/lib/api/auth';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  User,
  Building,
  Users,
  Bell,
  Shield,
  KeyRound,
  LogOut,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Smartphone,
  Lock,
  Plus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type SubView =
  | 'main'
  | 'business-profile'
  | 'staff'
  | 'notifications'
  | 'sessions'
  | 'two-factor'
  | 'change-password';

export default function SettingsPage() {
  const router = useRouter();
  const { me, loading: meLoading } = useMe();
  const { businessName, plan, logout, isOwner } = useAuthStore();
  const [subView, setSubView] = useState<SubView>('main');

  // Business Profile Form State
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [savingBusiness, setSavingBusiness] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Staff State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // 2FA State
  const [otpCode, setOtpCode] = useState('');
  const [step2FA, setStep2FA] = useState<'idle' | 'verify'>('idle');
  const [loading2FA, setLoading2FA] = useState(false);

  // Fetch Business Profile when viewing
  useEffect(() => {
    if (subView === 'business-profile') {
      businessApi
        .getProfile()
        .then((res: any) => {
          const data = res.data ?? res;
          setAddress(data.address ?? '');
          setCity(data.city ?? '');
          setState(data.state ?? '');
          setCountry(data.country ?? '');
        })
        .catch(() => {});
    } else if (subView === 'sessions') {
      setSessionsLoading(true);
      authApi
        .getSessions()
        .then((res: any) => setSessions(res.data ?? []))
        .catch(() => {})
        .finally(() => setSessionsLoading(false));
    } else if (subView === 'staff') {
      setStaffLoading(true);
      usersApi
        .list()
        .then((res: any) => setStaffList(res.data ?? []))
        .catch(() => {})
        .finally(() => setStaffLoading(false));
    }
  }, [subView]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_) {}
    logout();
    router.push('/login');
  };

  const handleSaveBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBusiness(true);
    try {
      await businessApi.update({ address, city, state, country });
      toast.success('Business profile updated successfully');
      setSubView('main');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update profile');
    } finally {
      setSavingBusiness(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPass(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSubView('main');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to change password');
    } finally {
      setChangingPass(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading2FA(true);
    try {
      await authApi.enable2FA();
      setStep2FA('verify');
      toast.success('OTP code sent to your email');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to enable 2FA');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleConfirm2FA = async () => {
    if (!otpCode) return;
    setLoading2FA(true);
    try {
      await authApi.confirm2FA({ code: otpCode });
      toast.success('Two-factor authentication enabled!');
      setStep2FA('idle');
      setSubView('main');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Invalid verification code');
    } finally {
      setLoading2FA(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await authApi.revokeSession(id);
      toast.success('Session revoked');
      setSessions((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      toast.error('Failed to revoke session');
    }
  };

  const SubHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <button
        type="button"
        onClick={() => setSubView('main')}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
      >
        <ArrowLeft size={18} />
      </button>
      <h1 className="text-xl font-bold text-[#0A0D14]">{title}</h1>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {subView === 'main' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-[#0A0D14]">Settings</h1>

          {/* Profile Card */}
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-[#EFF5FF] flex items-center justify-center text-[#0055FF] text-2xl font-bold mb-3">
              {me?.firstName ? me.firstName.charAt(0).toUpperCase() : <User size={28} />}
            </div>
            <h2 className="text-lg font-bold text-[#0A0D14]">
              {me ? `${me.firstName} ${me.lastName}` : meLoading ? 'Loading profile...' : 'User'}
            </h2>
            <p className="text-sm text-[#64748B] mb-3">{me?.email ?? '—'}</p>
            {businessName && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#64748B]">{businessName}</span>
                {plan && (
                  <span className="bg-[#DBEAFE] text-[#0055FF] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                    {plan}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Business Section */}
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 px-1">
              Business
            </p>
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setSubView('business-profile')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Building size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Business Profile</p>
                    <p className="text-xs text-[#64748B]">Address, city, state, country</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('staff')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Staff & Roles</p>
                    <p className="text-xs text-[#64748B]">Manage staff members and permissions</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>
            </div>
          </div>

          {/* Account Section */}
          <div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2 px-1">
              Account Security
            </p>
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9]">
              <button
                type="button"
                onClick={() => setSubView('notifications')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Bell size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Notification Preferences</p>
                    <p className="text-xs text-[#64748B]">Push and email notifications</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('sessions')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Active Sessions</p>
                    <p className="text-xs text-[#64748B]">Devices signed in to your account</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('two-factor')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <Shield size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Two-Factor Authentication</p>
                    <p className="text-xs text-[#64748B]">
                      {me?.entitlements?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>

              <button
                type="button"
                onClick={() => setSubView('change-password')}
                className="w-full flex items-center justify-between p-4 hover:bg-white transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B]">
                    <KeyRound size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0D14]">Change Password</p>
                    <p className="text-xs text-[#64748B]">Update your account password</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-[#94A3B8]" />
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full h-12 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FEE2E2] transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Business Profile */}
      {subView === 'business-profile' && (
        <div>
          <SubHeader title="Business Profile" />
          <form onSubmit={handleSaveBusinessProfile} className="space-y-4 bg-white p-6 rounded-2xl border border-[#F1F5F9]">
            <Input
              label="Street Address"
              value={address}
              placeholder="e.g. 12 Commerce Street"
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                value={city}
                placeholder="e.g. Ikeja"
                onChange={(e) => setCity(e.target.value)}
              />
              <Input
                label="State / Province"
                value={state}
                placeholder="e.g. Lagos"
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <Input
              label="Country"
              value={country}
              placeholder="e.g. Nigeria"
              onChange={(e) => setCountry(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" fullWidth disabled={savingBusiness} className="cursor-pointer">
                {savingBusiness ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Staff & Roles */}
      {subView === 'staff' && (
        <div>
          <SubHeader title="Staff & Roles" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#64748B]">Manage your team members and their access levels.</p>
            </div>

            {staffLoading ? (
              <div className="text-center py-10 text-sm text-[#64748B]">Loading staff list...</div>
            ) : staffList.length === 0 ? (
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-8 text-center">
                <Users size={32} className="mx-auto text-[#94A3B8] mb-2" />
                <p className="text-sm font-semibold text-[#0A0D14]">No staff members found</p>
                <p className="text-xs text-[#64748B] mt-1">Staff added to your business will appear here.</p>
              </div>
            ) : (
              <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9]">
                {staffList.map((user: any) => (
                  <div key={user.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0A0D14]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-[#64748B]">{user.email}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#EFF5FF] text-[#0055FF]">
                      {user.roleName ?? 'Staff'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {subView === 'notifications' && (
        <div>
          <SubHeader title="Notification Preferences" />
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 space-y-4">
            <p className="text-sm text-[#64748B]">
              Configure how you receive updates and inventory alerts.
            </p>
            {['Email notifications for low stock', 'Daily sales summary email', 'Push notifications for orders'].map((pref, idx) => (
              <label key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] cursor-pointer hover:bg-gray-100">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-brand focus:ring-brand w-4 h-4" />
                <span className="text-sm font-medium text-[#0A0D14]">{pref}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions */}
      {subView === 'sessions' && (
        <div>
          <SubHeader title="Active Sessions" />
          <div className="space-y-4">
            {sessionsLoading ? (
              <div className="text-center py-10 text-sm text-[#64748B]">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-8 text-center">
                <Smartphone size={32} className="mx-auto text-[#94A3B8] mb-2" />
                <p className="text-sm font-semibold text-[#0A0D14]">No active sessions found</p>
              </div>
            ) : (
              <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden divide-y divide-[#F1F5F9]">
                {sessions.map((s) => (
                  <div key={s.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#0A0D14]">{s.deviceName ?? 'Device'}</p>
                      <p className="text-xs text-[#64748B]">{s.ipAddress} · {new Date(s.lastActiveUtc).toLocaleDateString()}</p>
                    </div>
                    {s.isCurrent ? (
                      <span className="text-xs font-semibold text-[#16A34A] bg-[#DCFCE7] px-2.5 py-1 rounded-full">Current Device</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(s.id)}
                        className="text-xs font-semibold text-[#EF4444] hover:underline cursor-pointer"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2FA */}
      {subView === 'two-factor' && (
        <div>
          <SubHeader title="Two-Factor Authentication" />
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 space-y-4">
            <p className="text-sm text-[#64748B]">
              Protect your account with an extra layer of security using email verification codes when signing in.
            </p>
            {step2FA === 'idle' ? (
              <Button onClick={handleEnable2FA} disabled={loading2FA} className="cursor-pointer">
                {loading2FA ? 'Sending OTP...' : 'Enable 2FA'}
              </Button>
            ) : (
              <div className="space-y-4 max-w-sm">
                <Input
                  label="Enter OTP Code"
                  value={otpCode}
                  placeholder="6-digit code"
                  onChange={(e) => setOtpCode(e.target.value)}
                />
                <Button onClick={handleConfirm2FA} disabled={loading2FA} fullWidth className="cursor-pointer">
                  {loading2FA ? 'Verifying...' : 'Confirm & Enable'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Password */}
      {subView === 'change-password' && (
        <div>
          <SubHeader title="Change Password" />
          <form onSubmit={handleChangePassword} className="space-y-4 bg-white p-6 rounded-2xl border border-[#F1F5F9]">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              placeholder="Enter current password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              placeholder="Confirm new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <div className="pt-2">
              <Button type="submit" fullWidth disabled={changingPass} className="cursor-pointer">
                {changingPass ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
