'use client';

import { useState, useEffect, useMemo } from 'react';
import { staffApi, activityApi, salesApi } from '@/src/lib/api/commerce';
import { usersApi } from '@/src/lib/api/auth';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { CustomSelect } from '@/src/components/ui/CustomSelect';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Shield,
  DollarSign,
  Clock,
  ArrowLeft,
  ArrowRight,
  X,
  ChevronRight,
  Phone,
  Briefcase,
  CreditCard,
  Building2,
  Check,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  MapPin,
  Mail,
  User,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';

// ─── Constants & Styling Helpers matching Mobile App ─────────────────────────

const BLUE = '#0055FF';

type MainTab = 'Overview' | 'Payroll' | 'Shifts';
type ProfileSubTab = 'Overview' | 'Payroll' | 'Activity' | 'Settings';

function fmt(n?: number | null) {
  return `₦${(n ?? 0).toLocaleString('en-NG')}`;
}

function initials(firstName: string = '', lastName: string = '') {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'ST';
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string; border: string }> = {
  Active: { label: 'Active', bg: 'bg-[#DCFCE7]', color: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
  OnLeave: { label: 'On Leave', bg: 'bg-[#FEF3C7]', color: 'text-[#D97706]', border: 'border-[#FDE68A]' },
  Suspended: { label: 'Suspended', bg: 'bg-[#FEE2E2]', color: 'text-[#EF4444]', border: 'border-[#FECACA]' },
};

const PAYROLL_STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  Draft: { label: 'Draft', bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  Scheduled: { label: 'Scheduled', bg: 'bg-[#DBEAFE]', text: 'text-[#0055FF]' },
  Paid: { label: 'Disbursed', bg: 'bg-[#DCFCE7]', text: 'text-[#16A34A]' },
};

const GOVT_ID_OPTIONS = [
  { value: 'NIN', label: 'NIN - National Identification Number' },
  { value: 'Passport', label: 'International Passport' },
  { value: 'VoterID', label: "Voter's Card" },
  { value: 'DriverLicense', label: "Driver's License" },
];

const BANK_OPTIONS = [
  { value: 'Access Bank', label: 'Access Bank' },
  { value: 'GTBank', label: 'Guaranty Trust Bank (GTB)' },
  { value: 'First Bank', label: 'First Bank of Nigeria' },
  { value: 'Kuda Bank', label: 'Kuda Bank' },
  { value: 'OPay', label: 'OPay' },
  { value: 'Zenith Bank', label: 'Zenith Bank' },
  { value: 'UBA', label: 'United Bank for Africa (UBA)' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'Full-Time', label: 'Full-Time' },
  { value: 'Part-Time', label: 'Part-Time' },
  { value: 'Contract', label: 'Contract' },
];

const PAY_PERIOD_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Bi-Weekly', label: 'Bi-Weekly' },
  { value: 'Weekly', label: 'Weekly' },
];

// ───────────────────────────────────────────────────────────────────────────────
// ─── Main Staff Screen Component ───────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
  const [mainTab, setMainTab] = useState<MainTab>('Overview');

  // Staff Data State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Stats
  const [staffStats, setStaffStats] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);

  // Sub-screen Stack (Matches Mobile Navigation)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [addStaffStep, setAddStaffStep] = useState<number | null>(null); // 1..4
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);
  const [selectedPayslipRef, setSelectedPayslipRef] = useState<{ runId: string; staffId: string } | null>(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes, statsRes, attStatsRes]: any[] = await Promise.all([
        usersApi.list().catch(() => staffApi.list()),
        staffApi.listRoles().catch(() => ({ data: [] })),
        staffApi.getStats().catch(() => ({ data: null })),
        staffApi.getAttendanceStats().catch(() => ({ data: null })),
      ]);

      const rawStaffList = usersRes?.data ?? usersRes?.items ?? usersRes;
      setStaffList(Array.isArray(rawStaffList) ? rawStaffList : []);

      const rawRoles = rolesRes?.data ?? rolesRes?.items ?? rolesRes;
      setRoles(Array.isArray(rawRoles) ? rawRoles : []);

      setStaffStats(statsRes?.data ?? statsRes);
      setAttendanceStats(attStatsRes?.data ?? attStatsRes);
    } catch (err) {
      toast.error('Failed to load staff data');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  const safeStaffList = useMemo(() => (Array.isArray(staffList) ? staffList : []), [staffList]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return safeStaffList;
    const q = search.toLowerCase();
    return safeStaffList.filter(
      (m) =>
        `${m.firstName || ''} ${m.lastName || ''} ${m.jobTitle || ''} ${m.email || ''}`
          .toLowerCase()
          .includes(q)
    );
  }, [safeStaffList, search]);

  const totalStaffCount = staffStats?.totalStaff ?? safeStaffList.length;
  const activeTodayCount = attendanceStats?.activeTodayCount ?? safeStaffList.filter((s) => s.isActive !== false).length;
  const unavailableCount = staffStats?.unavailable ?? safeStaffList.filter((s) => s.status === 'OnLeave' || s.status === 'Suspended').length;

  // Sub-screen 1: Payslip Receipt View
  if (selectedPayslipRef) {
    return (
      <PayslipReceiptScreen
        runId={selectedPayslipRef.runId}
        staffId={selectedPayslipRef.staffId}
        onBack={() => setSelectedPayslipRef(null)}
      />
    );
  }

  // Sub-screen 2: Run Payroll Screen
  if (runPayrollOpen) {
    return (
      <RunPayrollScreen
        onBack={() => {
          setRunPayrollOpen(false);
          fetchStaffData();
        }}
      />
    );
  }

  // Sub-screen 3: Add Staff 4-Step Wizard Flow
  if (addStaffStep !== null) {
    return (
      <AddStaffFlowScreen
        initialStep={addStaffStep}
        roles={roles}
        onDone={() => {
          setAddStaffStep(null);
          fetchStaffData();
        }}
        onCancel={() => setAddStaffStep(null)}
      />
    );
  }

  // Sub-screen 4: Staff Profile Screen
  if (selectedStaffId) {
    return (
      <StaffProfileScreen
        staffId={selectedStaffId}
        roles={roles}
        onBack={() => setSelectedStaffId(null)}
        onViewPayslip={(runId, staffId) => setSelectedPayslipRef({ runId, staffId })}
        onStaffUpdated={fetchStaffData}
      />
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0D14]">Staff & Payroll</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage your team members, permissions, shifts, and payroll disbursal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAddStaffStep(1)}
          className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          <span> Add Staff</span>
        </button>
      </div>

      {/* Main Tabs (Overview | Payroll | Shifts) */}
      <div className="border-b border-[#E2E8F0]">
        <div className="flex gap-8">
          {(['Overview', 'Payroll', 'Shifts'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setMainTab(t)}
              className={cn(
                'py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                mainTab === t ? 'text-[#0A0D14]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {mainTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {mainTab === 'Overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#EFF5FF] text-[#0055FF] flex items-center justify-center mb-2">
                <Users size={16} />
              </div>
              <p className="text-xl font-bold text-[#0A0D14]">{totalStaffCount}</p>
              <p className="text-xs text-[#64748B] mt-0.5">Total Staff</p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-2">
                <UserCheck size={16} />
              </div>
              <p className="text-xl font-bold text-[#0A0D14]">{activeTodayCount}</p>
              <p className="text-xs text-[#64748B] mt-0.5">Active Today</p>
            </div>

            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center mb-2">
                <Shield size={16} />
              </div>
              <p className="text-xl font-bold text-[#0A0D14]">{unavailableCount}</p>
              <p className="text-xs text-[#64748B] mt-0.5">Unavailable</p>
            </div>
          </div>

          {/* Add Staff Button Banner */}
          <button
            type="button"
            onClick={() => setAddStaffStep(1)}
            className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span> Add Staff</span>
          </button>

          {/* Staff Directory Section */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-[#0A0D14]">Staff Directory</h2>

            {/* Search input */}
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search staff"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
              />
            </div>

            {/* Directory Table / Cards */}
            {loading ? (
              <div className="py-12 text-center text-sm text-[#64748B]">Loading staff...</div>
            ) : filteredStaff.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#94A3B8]">No staff found</div>
            ) : (
              <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm">
                <div className="divide-y divide-[#F1F5F9]">
                  {filteredStaff.map((member) => {
                    const statusKey = member.status || (member.isActive !== false ? 'Active' : 'Suspended');
                    const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.Active;

                    return (
                      <div
                        key={member.id}
                        onClick={() => setSelectedStaffId(member.id)}
                        className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#EFF5FF] text-[#0055FF] font-bold text-sm flex items-center justify-center border border-[#BFDBFE]">
                            {initials(member.firstName, member.lastName)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0A0D14]">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {member.jobTitle || 'Staff Member'} • {member.employmentType || 'Full-Time'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              'text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                              statusStyle.bg,
                              statusStyle.color,
                              statusStyle.border
                            )}
                          >
                            {statusStyle.label}
                          </span>
                          <ChevronRight size={18} className="text-[#94A3B8]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PAYROLL TAB ── */}
      {mainTab === 'Payroll' && (
        <PayrollTabContent
          onOpenRunPayroll={() => setRunPayrollOpen(true)}
          onViewPayslip={(runId, staffId) => setSelectedPayslipRef({ runId, staffId })}
        />
      )}

      {/* ── SHIFTS TAB ── */}
      {mainTab === 'Shifts' && <ShiftsTabContent safeStaffList={safeStaffList} />}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 1: Staff Profile Screen (Overview/Payroll/Activity/Settings)
// ───────────────────────────────────────────────────────────────────────────────

function StaffProfileScreen({
  staffId,
  roles,
  onBack,
  onViewPayslip,
  onStaffUpdated,
}: {
  staffId: string;
  roles: any[];
  onBack: () => void;
  onViewPayslip: (runId: string, staffId: string) => void;
  onStaffUpdated: () => void;
}) {
  const [subTab, setSubTab] = useState<ProfileSubTab>('Overview');

  const [profile, setProfile] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [payHistory, setPayHistory] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [payStaffSheetOpen, setPayStaffSheetOpen] = useState(false);
  const [payPartialMode, setPayPartialMode] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const [payrollConfigSheetOpen, setPayrollConfigSheetOpen] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [profRes, configRes, historyRes, salesRes, actRes]: any[] = await Promise.all([
        staffApi.getMember(staffId).catch(() => null),
        staffApi.getPayrollConfig(staffId).catch(() => ({ data: null })),
        staffApi.getPayHistory(staffId, { pageSize: 6 }).catch(() => ({ data: { items: [] } })),
        salesApi.list({ pageSize: 5 }).catch(() => ({ data: { items: [] } })),
        activityApi.list({ staffUserId: staffId, limit: 15 }).catch(() => ({ data: [] })),
      ]);

      setProfile(profRes?.data ?? profRes ?? null);
      setConfig(configRes?.data ?? configRes ?? null);

      const histItems = historyRes?.data?.items ?? historyRes?.items ?? historyRes?.data ?? [];
      setPayHistory(Array.isArray(histItems) ? histItems : []);

      const salesItems = salesRes?.data?.items ?? salesRes?.items ?? salesRes?.data ?? [];
      setRecentSales(Array.isArray(salesItems) ? salesItems : []);

      const actItems = actRes?.data?.items ?? actRes?.items ?? actRes?.data ?? [];
      setActivities(Array.isArray(actItems) ? actItems : []);
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [staffId]);

  const netPayNow = useMemo(() => {
    if (!config) return 0;
    return Math.max(0, (config.baseAmount || 0) + (config.totalAllowances || 0) - (config.totalDeductions || 0));
  }, [config]);

  const handlePay = async () => {
    if (!payNotes.trim()) {
      toast.error('Payment notes are required');
      return;
    }
    const amt = payPartialMode ? Number(partialAmount) : undefined;
    if (payPartialMode && (!amt || Number.isNaN(amt))) {
      toast.error('Enter a valid partial amount');
      return;
    }

    setPaying(true);
    try {
      await staffApi.adHocPay({
        staffId,
        notes: payNotes.trim(),
        amount: amt,
      });
      toast.success('Payment disbursed to staff Vintran wallet!');
      setPayStaffSheetOpen(false);
      setPayNotes('');
      setPartialAmount('');
      loadProfileData();
    } catch (err) {
      toast.error('Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const handleSetStatus = async (status: string) => {
    try {
      await staffApi.setStatus(staffId, status);
      toast.success(`Status set to ${status}`);
      setStatusPickerOpen(false);
      loadProfileData();
      onStaffUpdated();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Deactivate staff member? This will revoke app access immediately.')) return;
    try {
      await staffApi.deactivate(staffId);
      toast.success('Staff member deactivated');
      onBack();
      onStaffUpdated();
    } catch (err) {
      toast.error('Failed to deactivate staff');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#64748B]">Loading staff profile...</div>;
  }

  const staffName = profile ? `${profile.firstName} ${profile.lastName}` : 'Staff Member';
  const statusKey = profile?.status || (profile?.isActive !== false ? 'Active' : 'Suspended');
  const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.Active;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[#0A0D14]">Staff Profile</h1>
      </div>

      {/* Profile Card Header */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-[#EFF5FF] text-[#0055FF] font-bold text-2xl flex items-center justify-center border-2 border-[#BFDBFE]">
          {initials(profile?.firstName, profile?.lastName)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#0A0D14]">{staffName}</h2>
          <p className="text-xs text-[#64748B] mt-0.5">{profile?.jobTitle || 'Staff Member'}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusPickerOpen(true)}
            className={cn(
              'text-xs font-semibold px-2.5 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity',
              statusStyle.bg,
              statusStyle.color,
              statusStyle.border
            )}
          >
            {statusStyle.label}
          </button>
          <span className="text-xs font-semibold text-[#0055FF] bg-[#EFF5FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
            {profile?.employmentType || 'Full-Time'}
          </span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="border-b border-[#E2E8F0]">
        <div className="flex gap-6">
          {(['Overview', 'Payroll', 'Activity', 'Settings'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={cn(
                'py-2.5 text-xs font-semibold transition-colors cursor-pointer relative',
                subTab === t ? 'text-[#0A0D14]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {subTab === t && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      {/* ── Sub-tab 1: OVERVIEW ── */}
      {subTab === 'Overview' && (
        <div className="space-y-4 text-xs">
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-[#0A0D14] mb-3">Contact Information</h3>
            {[
              { label: 'Phone Number', value: profile?.phoneNumber || '—' },
              { label: 'Email', value: profile?.email || '—' },
              { label: 'Address', value: profile?.homeAddress || '—' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#EAECF0] last:border-0">
                <span className="text-[#64748B]">{r.label}</span>
                <span className="font-medium text-[#0A0D14]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-[#0A0D14] mb-3">Employment Details</h3>
            {[
              { label: 'Start Date', value: profile?.startDate ? new Date(profile.startDate).toLocaleDateString() : '—' },
              { label: profile?.governmentIdType || 'Government ID', value: profile?.governmentIdNumber || '—' },
              {
                label: 'Next of Kin',
                value: profile?.nextOfKinFirstName
                  ? `${profile.nextOfKinFirstName} ${profile.nextOfKinLastName || ''} (${profile.nextOfKinContact || '—'})`
                  : '—',
              },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#EAECF0] last:border-0">
                <span className="text-[#64748B]">{r.label}</span>
                <span className="font-medium text-[#0A0D14]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-[#0A0D14] mb-2">Vintran Wallet</h3>
            <div className="flex justify-between py-1">
              <span className="text-[#64748B]">Wallet Account</span>
              <span className="font-semibold text-[#0A0D14]">
                {profile?.vintranAccountId ? `Linked (${profile.vintranAccountId.slice(0, 8)}…)` : 'Not linked yet'}
              </span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-[#0A0D14] mb-3">Bank Details</h3>
            {[
              { label: 'Bank Name', value: profile?.bankName || '—' },
              { label: 'Account Number', value: profile?.bankAccountNumber || '—' },
              { label: 'Account Name', value: profile?.bankAccountName || '—' },
            ].map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-[#EAECF0] last:border-0">
                <span className="text-[#64748B]">{r.label}</span>
                <span className="font-medium text-[#0A0D14]">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <h3 className="font-semibold text-[#0A0D14]">Recent Sales</h3>
            {recentSales.length === 0 ? (
              <p className="text-[#94A3B8] text-center py-4">No sales recorded yet</p>
            ) : (
              recentSales.map((sale) => (
                <div key={sale.id} className="flex justify-between py-2 border-b border-[#F1F5F9]">
                  <div>
                    <p className="font-semibold text-[#0A0D14]">{sale.number || sale.id}</p>
                    <p className="text-[11px] text-[#16A34A]">{sale.channel || 'InStore'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#0A0D14]">{fmt(sale.grandTotal)}</p>
                    <p className="text-[11px] text-[#64748B]">{new Date(sale.createdOnUtc).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setSubTab('Activity')}
            className="w-full h-11 rounded-xl bg-[#EFF5FF] text-[#0055FF] font-semibold text-xs hover:bg-blue-100 transition-colors"
          >
            View Activities
          </button>
        </div>
      )}

      {/* ── Sub-tab 2: PAYROLL ── */}
      {subTab === 'Payroll' && (
        <div className="space-y-4 text-xs">
          <button
            type="button"
            onClick={() => setPayStaffSheetOpen(true)}
            disabled={!profile?.vintranAccountId}
            className={cn(
              'w-full h-12 rounded-xl bg-[#EFF5FF] text-[#0055FF] font-semibold text-xs hover:bg-blue-100 transition-colors',
              !profile?.vintranAccountId && 'opacity-50 cursor-not-allowed'
            )}
          >
            {profile?.vintranAccountId ? 'Pay Now' : 'Pay Now (No wallet linked)'}
          </button>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#0A0D14]">Pay Configuration</h3>
              <button
                type="button"
                onClick={() => setPayrollConfigSheetOpen(true)}
                className="text-[#0055FF] font-semibold hover:underline"
              >
                {config ? 'Edit' : 'Set Up'}
              </button>
            </div>
            {config ? (
              <div className="divide-y divide-[#EAECF0]">
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Pay Type</span>
                  <span className="font-medium text-[#0A0D14]">
                    {config.payType === 'Salary' ? 'Monthly Salary' : 'Hourly Rate'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Base Pay</span>
                  <span className="font-bold text-[#0A0D14]">{fmt(config.baseAmount)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Pay Period</span>
                  <span className="font-medium text-[#0A0D14]">{config.period || 'Monthly'}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#94A3B8]">No payroll configuration set up yet</p>
            )}
          </div>

          {/* Allowances Box */}
          {config && config.allowances?.length > 0 && (
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-[#0A0D14] mb-2">Allowances</h3>
              {config.allowances.map((a: any, i: number) => (
                <div key={i} className="flex justify-between py-1 border-b border-[#EAECF0] last:border-0">
                  <span className="text-[#64748B]">{a.name}</span>
                  <span className="font-semibold text-[#0A0D14]">{fmt(a.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold border-t border-[#E2E8F0] pt-2">
                <span>Total Allowances</span>
                <span className="text-[#0055FF]">{fmt(config.totalAllowances)}</span>
              </div>
            </div>
          )}

          {/* Deductions Box */}
          {config && config.deductions?.length > 0 && (
            <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-[#0A0D14] mb-2">Deductions</h3>
              {config.deductions.map((d: any, i: number) => (
                <div key={i} className="flex justify-between py-1 border-b border-[#EAECF0] last:border-0">
                  <span className="text-[#64748B]">{d.name}</span>
                  <span className="font-semibold text-rose-600">-{fmt(d.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold border-t border-[#E2E8F0] pt-2">
                <span>Total Deductions</span>
                <span className="text-rose-600">-{fmt(config.totalDeductions)}</span>
              </div>
            </div>
          )}

          {/* Net Pay Summary Card */}
          {config && (
            <div className="bg-[#EFF5FF] border border-[#BFDBFE] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0055FF]">Net Pay Summary</span>
                <span className="text-[10px] font-semibold text-[#0055FF] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
                  {config.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-[11px] text-[#64748B]">Base + Allowances</p>
                  <p className="font-bold text-[#0A0D14]">
                    {fmt((config.baseAmount || 0) + (config.totalAllowances || 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#64748B]">Total Deductions</p>
                  <p className="font-bold text-rose-600">-{fmt(config.totalDeductions)}</p>
                </div>
              </div>
              <div className="border-t border-dashed border-[#BFDBFE] pt-3 flex justify-between items-center">
                <span className="text-[#64748B]">Take Home (Net)</span>
                <span className="text-xl font-bold text-[#0055FF]">{fmt(netPayNow)}</span>
              </div>
            </div>
          )}

          {/* Payment History */}
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-[#0A0D14]">Payment History</h3>
            {payHistory.length === 0 ? (
              <p className="text-[#94A3B8] text-center py-4">No payments recorded yet</p>
            ) : (
              payHistory.map((p) => (
                <div
                  key={p.payrollItemId || p.id}
                  onClick={() => p.payrollRunId && onViewPayslip(p.payrollRunId, staffId)}
                  className="bg-[#F8FAFC] rounded-xl p-3.5 flex justify-between items-center cursor-pointer hover:bg-[#F1F5F9]"
                >
                  <div>
                    <p className="font-semibold text-[#0A0D14]">{p.payPeriodLabel || 'Disbursal'}</p>
                    <p className="text-[11px] text-[#64748B] mt-0.5">
                      {p.paidOnUtc ? new Date(p.paidOnUtc).toLocaleDateString() : p.runStatus}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="font-bold text-[#0A0D14]">{fmt(p.netPay)}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {p.disbursementStatus || 'Completed'}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-[#94A3B8]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── Sub-tab 3: ACTIVITY ── */}
      {subTab === 'Activity' && (
        <div className="space-y-3 text-xs">
          {activities.length === 0 ? (
            <p className="text-[#94A3B8] text-center py-8">No activity recorded yet</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="flex gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                <div className="w-2 h-2 rounded-full bg-[#0055FF] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] text-[#64748B]">
                    {act.occurredOnUtc ? new Date(act.occurredOnUtc).toLocaleString() : ''}
                  </p>
                  <p className="font-medium text-[#0A0D14] mt-0.5">{act.summary || act.description}</p>
                </div>
                {act.category && (
                  <span className="text-[10px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full h-fit">
                    {act.category}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Sub-tab 4: SETTINGS ── */}
      {subTab === 'Settings' && (
        <div className="space-y-4 text-xs">
          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-[#0A0D14] mb-3">Account Status</h3>
            <div className="divide-y divide-[#EAECF0]">
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">App Login Status</span>
                <span className="font-semibold text-emerald-600">{profile?.loginStatus || 'Active'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Last Login</span>
                <span className="font-medium text-[#0A0D14]">
                  {profile?.lastLoginOnUtc ? new Date(profile.lastLoginOnUtc).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Login Email</span>
                <span className="font-medium text-[#0A0D14]">{profile?.email || '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-[#0A0D14]">Role & Permissions</h3>
            <div className="flex justify-between py-2 border-b border-[#EAECF0]">
              <span className="text-[#64748B]">Role</span>
              <span className="font-semibold text-[#0A0D14]">{profile?.roleName || 'Custom'}</span>
            </div>
            {profile?.permissions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.permissions.map((p: string) => (
                  <span key={p} className="text-[10px] font-semibold text-[#0055FF] bg-[#EFF5FF] px-2 py-0.5 rounded-md">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl p-4 space-y-3">
            <h3 className="font-bold text-[#EF4444]">Danger Zone</h3>
            <p className="text-[#64748B] text-xs">
              This will revoke app access immediately. Historical financial and action records will be preserved.
            </p>
            <button
              type="button"
              onClick={handleDeactivate}
              className="w-full h-11 rounded-xl bg-[#FEE2E2] text-[#EF4444] font-semibold text-xs hover:bg-rose-200 transition-colors"
            >
              Deactivate Staff Member
            </button>
          </div>
        </div>
      )}

      {/* Status Picker Modal */}
      {statusPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Set Status</h2>
              <button type="button" onClick={() => setStatusPickerOpen(false)} className="text-[#94A3B8]">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              {['Active', 'OnLeave', 'Suspended'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSetStatus(st)}
                  className="w-full py-3 px-3 rounded-xl border border-[#F1F5F9] hover:bg-[#EFF5FF] text-left font-semibold text-[#0A0D14] flex items-center justify-between cursor-pointer"
                >
                  <span>{STATUS_STYLE[st]?.label || st}</span>
                  {profile?.status === st && <Check size={16} className="text-[#0055FF]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pay Staff Sheet */}
      {payStaffSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Pay Staff</h2>
              <button type="button" onClick={() => setPayStaffSheetOpen(false)} className="text-[#94A3B8]">
                <X size={18} />
              </button>
            </div>

            {config ? (
              <div className="bg-[#EFF5FF] border border-[#DBEAFE] rounded-xl p-3.5 space-y-2">
                <p className="font-bold text-[#0055FF]">Net Pay Summary</p>
                <div className="flex justify-between text-[#64748B]">
                  <span>Gross: {fmt((config.baseAmount || 0) + (config.totalAllowances || 0))}</span>
                  <span>Deductions: -{fmt(config.totalDeductions)}</span>
                </div>
                <div className="border-t border-dashed border-[#DBEAFE] pt-2 flex justify-between font-bold text-[#0055FF]">
                  <span>Take Home (Net)</span>
                  <span>{fmt(netPayNow)}</span>
                </div>
              </div>
            ) : (
              <p className="text-[#94A3B8]">No payroll configured — specify an exact amount to pay.</p>
            )}

            {payPartialMode && (
              <Input
                label="Partial Amount (₦) *"
                type="number"
                value={partialAmount}
                placeholder="₦ amount"
                onChange={(e) => setPartialAmount(e.target.value)}
              />
            )}

            <Input
              label="Notes *"
              value={payNotes}
              placeholder="Reason for payment..."
              onChange={(e) => setPayNotes(e.target.value)}
            />

            <div className="space-y-2 pt-2">
              <Button fullWidth onClick={handlePay} disabled={paying}>
                {paying ? 'Paying...' : payPartialMode ? `Pay ${fmt(Number(partialAmount) || 0)}` : `Pay ${fmt(netPayNow)}`}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                onClick={() => setPayPartialMode(!payPartialMode)}
              >
                {payPartialMode ? 'Cancel Partial' : 'Pay Partial'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Config Sheet */}
      {payrollConfigSheetOpen && (
        <PayrollConfigSheet
          staffId={staffId}
          existing={config}
          onClose={() => setPayrollConfigSheetOpen(false)}
          onSaved={() => {
            setPayrollConfigSheetOpen(false);
            loadProfileData();
          }}
        />
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 2: Payroll Tab Content & Run Payroll Screen ─────────────
// ───────────────────────────────────────────────────────────────────────────────

function PayrollTabContent({
  onOpenRunPayroll,
  onViewPayslip,
}: {
  onOpenRunPayroll: () => void;
  onViewPayslip: (runId: string, staffId: string) => void;
}) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi
      .listPayrollRuns({ pageSize: 10 })
      .then((res: any) => {
        const items = res?.data?.items ?? res?.items ?? res?.data ?? [];
        setHistory(Array.isArray(items) ? items : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const pendingRun = history.find((r) => r.status === 'Draft' || r.status === 'Scheduled');

  return (
    <div className="space-y-4">
      {/* Pending Run Card */}
      {pendingRun ? (
        <div
          onClick={onOpenRunPayroll}
          className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 cursor-pointer hover:border-[#0055FF] transition-colors space-y-3"
        >
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">
              {pendingRun.status === 'Draft' ? 'PAYROLL IN PROGRESS' : 'SCHEDULED PAYROLL'}
            </span>
            <span
              className={cn(
                'text-[11px] font-semibold px-2.5 py-0.5 rounded-full',
                PAYROLL_STATUS_STYLE[pendingRun.status]?.bg ?? 'bg-[#DBEAFE]',
                PAYROLL_STATUS_STYLE[pendingRun.status]?.text ?? 'text-[#0055FF]'
              )}
            >
              {PAYROLL_STATUS_STYLE[pendingRun.status]?.label ?? pendingRun.status}
            </span>
          </div>
          <p className="text-2xl font-bold text-[#0055FF]">{fmt(pendingRun.totalNet)}</p>
          <p className="text-xs text-[#64748B]">
            {pendingRun.payPeriodLabel} • {pendingRun.staffCount || 0} staff members
          </p>
        </div>
      ) : (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 text-center text-xs text-[#64748B]">
          No payroll run in progress
        </div>
      )}

      {/* Run Payroll Primary Button */}
      <button
        type="button"
        onClick={onOpenRunPayroll}
        className="w-full h-12 rounded-xl bg-[#0055FF] text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        <span>{pendingRun ? 'Continue Payroll Run' : '+ Run Payroll'}</span>
      </button>

      {/* Payroll History */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-[#0A0D14]">Payroll History</h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-[#64748B]">Loading payroll history...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">No payroll runs yet</div>
        ) : (
          history.map((h) => {
            const statusStyle = PAYROLL_STATUS_STYLE[h.status] ?? {
              label: h.status,
              bg: 'bg-[#F1F5F9]',
              text: 'text-[#64748B]',
            };

            return (
              <div
                key={h.runId || h.id}
                className="py-3 flex justify-between items-center border-b border-[#F1F5F9] text-xs"
              >
                <div>
                  <p className="font-semibold text-[#0A0D14]">{h.payPeriodLabel}</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">
                    {h.createdOnUtc ? new Date(h.createdOnUtc).toLocaleDateString() : ''} • {h.staffCount || 0} staff
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0A0D14]">{fmt(h.totalNet)}</p>
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1', statusStyle.bg, statusStyle.text)}>
                    {statusStyle.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function RunPayrollScreen({ onBack }: { onBack: () => void }) {
  const [payPeriodLabel, setPayPeriodLabel] = useState('');
  const [defaultHours, setDefaultHours] = useState('160');
  const [runData, setRunData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [disbursing, setDisbursing] = useState(false);
  const [disbursedSuccess, setDisbursedSuccess] = useState(false);

  // Adjust modal
  const [adjustStaffId, setAdjustStaffId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Schedule modal
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');

  const handleComputeRun = async () => {
    if (!payPeriodLabel.trim()) {
      toast.error('Pay period label is required');
      return;
    }
    setLoading(true);
    try {
      const res: any = await staffApi.runPayroll({
        payPeriodLabel: payPeriodLabel.trim(),
        defaultHoursForHourly: parseFloat(defaultHours) || 160,
      });
      setRunData(res.data || res);
    } catch (err) {
      toast.error('Failed to compute payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!runData?.runId) return;
    setDisbursing(true);
    try {
      await staffApi.disbursePayroll({ runId: runData.runId, mode: 'Automatic' });
      setDisbursedSuccess(true);
    } catch (err) {
      toast.error('Disbursal failed');
    } finally {
      setDisbursing(false);
    }
  };

  const handleSaveAdjust = async () => {
    if (!runData?.runId || !adjustStaffId || !adjustAmount.trim() || !adjustNotes.trim()) return;
    try {
      await staffApi.adjustPayrollItem({
        runId: runData.runId,
        staffId: adjustStaffId,
        amount: Number(adjustAmount),
        notes: adjustNotes.trim(),
      });
      toast.success('Adjustment saved');
      setAdjustStaffId(null);
      const updated: any = await staffApi.getPayrollRun(runData.runId);
      setRunData(updated.data || updated);
    } catch (err) {
      toast.error('Failed to adjust pay');
    }
  };

  const handleSchedule = async () => {
    if (!runData?.runId || !scheduleDate.trim()) return;
    try {
      await staffApi.schedulePayroll({
        runId: runData.runId,
        scheduledForUtc: new Date(scheduleDate).toISOString(),
        mode: 'Automatic',
      });
      toast.success('Payroll scheduled successfully');
      setScheduleOpen(false);
      onBack();
    } catch (err) {
      toast.error('Failed to schedule payroll');
    }
  };

  if (disbursedSuccess) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-20 h-20 rounded-full bg-[#22C55E] text-white font-bold text-4xl flex items-center justify-center mx-auto">
          ✓
        </div>
        <h2 className="text-xl font-bold text-[#0A0D14]">Payroll Disbursed!</h2>
        <p className="text-xs text-[#64748B]">
          {fmt(runData?.totalNet)} sent to {runData?.items?.length || 0} staff Vintran wallets
        </p>
        <Button fullWidth onClick={onBack}>
          Done
        </Button>
      </div>
    );
  }

  if (!runData) {
    return (
      <div className="space-y-6 max-w-md mx-auto pb-12 text-xs">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-1 text-[#0A0D14]">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[#0A0D14]">Run Payroll</h1>
        </div>

        <div className="space-y-4">
          <Input
            label="Pay period label *"
            placeholder="e.g. July 2026"
            value={payPeriodLabel}
            onChange={(e) => setPayPeriodLabel(e.target.value)}
          />
          <Input
            label="Default hours for hourly-paid staff"
            type="number"
            value={defaultHours}
            onChange={(e) => setDefaultHours(e.target.value)}
          />
          <Button fullWidth onClick={handleComputeRun} disabled={!payPeriodLabel.trim() || loading}>
            {loading ? 'Computing…' : 'Compute Payroll'}
          </Button>
        </div>
      </div>
    );
  }

  const isDraft = runData.status === 'Draft';

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 text-xs">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-1 text-[#0A0D14]">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-[#0A0D14]">Run Payroll</h1>
      </div>

      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-[#0A0D14]">{runData.payPeriodLabel}</h2>
        <span className="text-[10px] font-semibold text-[#0055FF] bg-[#DBEAFE] px-2 py-0.5 rounded-md">
          {runData.status}
        </span>
      </div>

      {/* Summary Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
        <div className="flex justify-between">
          <div>
            <p className="text-[11px] text-[#64748B]">Gross Payroll</p>
            <p className="text-lg font-bold text-[#0A0D14]">{fmt(runData.totalGross)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#64748B]">Total Deductions</p>
            <p className="text-lg font-bold text-rose-600">-{fmt(runData.totalDeductions)}</p>
          </div>
        </div>
        <div className="border-t border-[#E2E8F0] pt-3 flex justify-between items-center">
          <div>
            <p className="text-[11px] text-[#64748B]">Net Disbursement</p>
            <p className="text-xl font-bold text-[#0055FF]">{fmt(runData.totalNet)}</p>
          </div>
          <span className="text-xs font-semibold text-white bg-[#0055FF] px-3 py-1 rounded-full">
            {runData.items?.length || 0} staff
          </span>
        </div>
      </div>

      {/* Staff Breakdown List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-[#0A0D14]">Staff Breakdown</h3>
        <div className="divide-y divide-[#F1F5F9] border-t border-[#F1F5F9]">
          {(runData.items || []).map((item: any) => (
            <div key={item.staffId} className="py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EFF5FF] text-[#0055FF] font-bold flex items-center justify-center text-xs">
                  {initials(item.staffName || '')}
                </div>
                <div>
                  <p className="font-semibold text-[#0A0D14]">{item.staffName || item.staffId}</p>
                  <p className="text-[11px] text-[#94A3B8]">
                    Gross: {fmt(item.grossPay)} | Ded: {fmt(item.deductions)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#0A0D14]">{fmt(item.netPay)}</p>
                {isDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustStaffId(item.staffId);
                      setAdjustAmount(String(item.netPay));
                      setAdjustNotes('');
                    }}
                    className="text-[#0055FF] font-semibold hover:underline mt-0.5"
                  >
                    Adjust
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notice */}
      <div className="flex items-center gap-2 text-xs text-[#64748B] bg-gray-50 p-3 rounded-xl">
        <span>⚠️</span>
        <span>Payments will be instantly disbursed to the linked Vintran wallets.</span>
      </div>

      {/* Bottom Actions */}
      {runData.status !== 'Paid' && (
        <div className="space-y-2 pt-2">
          <Button fullWidth onClick={handleDisburse} disabled={disbursing}>
            {disbursing ? 'Disbursing…' : `Disburse Now — ${fmt(runData.totalNet)}`}
          </Button>
          {isDraft && (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="w-full py-2.5 text-center font-semibold text-[#0055FF] hover:underline"
            >
              Schedule for Later
            </button>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      {adjustStaffId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold text-[#0A0D14]">Adjust Pay</h3>
            <Input
              label="Amount (₦) *"
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <Input
              label="Notes *"
              value={adjustNotes}
              placeholder="Reason for adjustment..."
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <Button fullWidth variant="secondary" onClick={() => setAdjustStaffId(null)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSaveAdjust}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 space-y-3 shadow-xl text-xs">
            <h3 className="font-bold text-[#0A0D14]">Schedule for Later</h3>
            <Input
              label="Disbursement date & time *"
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <div className="flex gap-2 pt-2">
              <Button fullWidth variant="secondary" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSchedule}>
                Confirm Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 3: Shifts & Attendance Tab ──────────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

function ShiftsTabContent({ safeStaffList }: { safeStaffList: any[] }) {
  const myStaffId = safeStaffList[0]?.id;
  const [summary, setSummary] = useState<any>(null);
  const [weekLog, setWeekLog] = useState<any[]>([]);
  const [liveSeconds, setLiveSeconds] = useState(0);

  useEffect(() => {
    if (!myStaffId) return;
    staffApi.getAttendanceSummary(myStaffId).then((res: any) => setSummary(res?.data ?? res));
    staffApi.getAttendance(myStaffId).then((res: any) => setWeekLog(res?.data ?? res ?? []));
  }, [myStaffId]);

  useEffect(() => {
    if (!summary?.isClockedIn || !summary?.currentShiftStartedUtc) {
      setLiveSeconds(0);
      return;
    }
    const startMs = new Date(summary.currentShiftStartedUtc).getTime();
    const tick = () => setLiveSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [summary?.isClockedIn, summary?.currentShiftStartedUtc]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleToggleClock = async () => {
    if (!myStaffId) return;
    try {
      if (summary?.isClockedIn) {
        await staffApi.clockOut({ staffId: myStaffId });
        toast.success('Clocked out successfully!');
      } else {
        await staffApi.clockIn(myStaffId);
        toast.success('Clocked in successfully!');
      }
      const updated: any = await staffApi.getAttendanceSummary(myStaffId);
      setSummary(updated?.data ?? updated);
      const updatedLog: any = await staffApi.getAttendance(myStaffId);
      setWeekLog(updatedLog?.data ?? updatedLog ?? []);
    } catch (err) {
      toast.error('Clock action failed');
    }
  };

  const clockedIn = summary?.isClockedIn ?? false;

  return (
    <div className="space-y-4 max-w-lg mx-auto text-xs">
      {/* Clock In / Out Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 text-center space-y-3">
        {clockedIn && summary?.currentShiftStartedUtc && (
          <div>
            <p className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">CURRENT STATUS</p>
            <p className="font-bold text-[#16A34A] mt-0.5">
              Clocked In at {new Date(summary.currentShiftStartedUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        )}
        <p className="text-4xl font-extrabold text-[#0A0D14] tracking-tight">{formatTimer(liveSeconds)}</p>
        <p className="text-xs text-[#64748B]">Active elapsed time today</p>
        <button
          type="button"
          onClick={handleToggleClock}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-white cursor-pointer transition-colors shadow-sm',
            clockedIn ? 'bg-[#EF4444] hover:bg-rose-700' : 'bg-[#0055FF] hover:bg-blue-700'
          )}
        >
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </button>
      </div>

      {/* Monthly Hours Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-[#64748B] tracking-wider uppercase">MONTHLY HOURS</span>
          <span className="text-[10px] font-bold text-[#059669] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full">
            ON TRACK
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#0A0D14]">August 2026</span>
          <span className="font-bold text-[#059669]">{summary?.monthlyHoursWorked ?? 0}hrs</span>
        </div>
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#059669] rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, ((summary?.monthlyHoursWorked ?? 0) / (summary?.monthlyTargetHours || 160)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#64748B]">
            <span>0 hrs</span>
            <span>{summary?.monthlyTargetHours ?? 160} hrs</span>
          </div>
        </div>
      </div>

      {/* This Week's Log */}
      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#0A0D14]">This Week's Log</h3>
        </div>
        {weekLog.length === 0 ? (
          <p className="text-[#94A3B8] text-center py-6">No shifts logged this week</p>
        ) : (
          weekLog.map((item) => {
            const isOpen = !item.clockedOutUtc;
            const hrs = item.hours ?? 0;
            return (
              <div
                key={item.id}
                className={cn(
                  'bg-[#F8FAFC] rounded-xl p-3.5 flex justify-between items-center border-l-4',
                  isOpen ? 'border-l-[#0055FF]' : 'border-l-[#16A34A]'
                )}
              >
                <div>
                  <p className="font-bold text-[#0A0D14]">
                    {new Date(item.clockedInUtc).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    {new Date(item.clockedInUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isOpen ? ' (Active Shift)' : ` to ${new Date(item.clockedOutUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                </div>
                <p className="font-bold text-[#0A0D14]">
                  {isOpen ? 'In Progress' : `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 4: Add Staff Flow Screen (4-Step Wizard) ────────────────
// ───────────────────────────────────────────────────────────────────────────────

function AddStaffFlowScreen({
  initialStep = 1,
  roles,
  onDone,
  onCancel,
}: {
  initialStep: number;
  roles: any[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(initialStep);
  const [createdStaff, setCreatedStaff] = useState<{
    name: string;
    phone: string;
    email: string;
    address?: string;
    startDate: string;
  } | null>(null);

  // Step 1: Personal Info
  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [startDate, setStartDate] = useState('');

  // Step 2: Identity & Banking
  const [govtIdType, setGovtIdType] = useState('NIN');
  const [idNumber, setIdNumber] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Step 3: Permissions
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  // Step 4: Payroll Setup
  const [payType, setPayType] = useState<'Salary' | 'Hourly'>('Salary');
  const [basePay, setBasePay] = useState('');
  const [payPeriod, setPayPeriod] = useState('Monthly');
  const [firstRunOnUtc, setFirstRunOnUtc] = useState('');
  const [allowances, setAllowances] = useState<{ name: string; amount: string }[]>([]);
  const [deductions, setDeductions] = useState<{ name: string; amount: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const parseDateString = (s: string): string => {
    if (!s) return new Date().toISOString().slice(0, 10);
    const dmy = s.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      const [, d, mo, y] = dmy;
      return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    return s;
  };

  const handleCreate = async () => {
    if (!basePay.trim()) {
      toast.error('Base pay amount is required');
      return;
    }
    const [firstName, ...rest] = fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    const [nokFirst, ...nokRest] = nextOfKinName.trim().split(/\s+/);
    const selectedRole = roles?.find((r) => r.id === selectedRoleId);

    setSubmitting(true);
    try {
      const res: any = await staffApi.create({
        firstName,
        lastName,
        jobTitle: jobTitle.trim(),
        phoneNumber: phone.trim(),
        email: email.trim() || undefined,
        employmentType: employmentType.replace('-', ''),
        startDate: parseDateString(startDate),
        permissions: selectedRole?.permissions ?? [],
        dateOfBirth: dob ? parseDateString(dob) : undefined,
        homeAddress: address.trim() || undefined,
        governmentIdType: govtIdType || undefined,
        governmentIdNumber: idNumber.trim() || undefined,
        nextOfKinFirstName: nokFirst || undefined,
        nextOfKinLastName: nokRest.join(' ') || undefined,
        nextOfKinContact: nextOfKinPhone.trim() || undefined,
        bankName: bankName || undefined,
        bankAccountNumber: accountNumber.trim() || undefined,
        bankAccountName: accountName.trim() || undefined,
        roleId: selectedRoleId || undefined,
      });

      const staffId = res?.data?.id || res?.id;
      if (staffId) {
        await staffApi.setupPayroll({
          staffId,
          payType,
          baseAmount: Number(basePay) || 0,
          period: payPeriod,
          allowances: allowances.filter((a) => a.name.trim() && a.amount.trim()).map((a) => ({ name: a.name.trim(), amount: Number(a.amount) || 0 })),
          deductions: deductions.filter((d) => d.name.trim() && d.amount.trim()).map((d) => ({ name: d.name.trim(), amount: Number(d.amount) || 0 })),
          firstRunOnUtc: firstRunOnUtc ? parseDateString(firstRunOnUtc) : undefined,
        });
      }

      setCreatedStaff({
        name: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim() || undefined,
        startDate: startDate.trim() || new Date().toLocaleDateString(),
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  if (createdStaff) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto text-xs">
        <div className="w-20 h-20 rounded-full bg-[#22C55E] text-white font-bold text-4xl flex items-center justify-center mx-auto shadow-md">
          ✓
        </div>
        <h2 className="text-xl font-bold text-[#0A0D14]">Staff Created Successfully</h2>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-5 text-left space-y-2.5">
          <div className="flex justify-between py-1 border-b border-[#EAECF0]">
            <span className="text-[#64748B]">Name</span>
            <span className="font-semibold text-[#0A0D14]">{createdStaff.name}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-[#EAECF0]">
            <span className="text-[#64748B]">Phone Number</span>
            <span className="font-semibold text-[#0A0D14]">{createdStaff.phone}</span>
          </div>
          {createdStaff.email && (
            <div className="flex justify-between py-1 border-b border-[#EAECF0]">
              <span className="text-[#64748B]">Email</span>
              <span className="font-semibold text-[#0A0D14]">{createdStaff.email}</span>
            </div>
          )}
          {createdStaff.address && (
            <div className="flex justify-between py-1 border-b border-[#EAECF0]">
              <span className="text-[#64748B]">Address</span>
              <span className="font-semibold text-[#0A0D14]">{createdStaff.address}</span>
            </div>
          )}
          <div className="flex justify-between py-1">
            <span className="text-[#64748B]">Start Date</span>
            <span className="font-semibold text-[#0A0D14]">{createdStaff.startDate}</span>
          </div>
        </div>
        <Button fullWidth onClick={onDone}>
          Continue
        </Button>
      </div>
    );
  }

  const stepTitles = ['Personal Info', 'Identity & Banking', 'Permissions', 'Payroll Setup'];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-12 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => (step > 1 ? setStep(step - 1) : onCancel())} className="p-1 cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-[#0A0D14]">Add Staff Member</h1>
        </div>
        <button type="button" onClick={onCancel} className="text-[#64748B] hover:text-[#0A0D14] font-semibold cursor-pointer">
          Cancel
        </button>
      </div>

      {/* Step Header */}
      <div className="space-y-1">
        <h2 className="font-bold text-[#0A0D14] text-sm">{stepTitles[step - 1]}</h2>
        <p className="text-[11px] text-[#64748B]">Step {step} of 4</p>
        <div className="h-1 bg-[#E2E8F0] rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#0055FF] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="space-y-3.5">
          <Input label="Full Legal Name *" placeholder="Enter full legal name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <Input label="Job Title *" placeholder="e.g. Store Manager, Cashier" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          <Input label="Phone Number *" placeholder="+234 000 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          <Input label="Email" type="email" placeholder="Enter email address" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          <Input label="Address" placeholder="Enter full address" value={address} onChange={(e) => setAddress(e.target.value)} />
          <CustomSelect label="Employment Type *" options={EMPLOYMENT_TYPE_OPTIONS} value={employmentType} onChange={setEmploymentType} />
          <Input label="Effective Start Date *" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

          <Button
            fullWidth
            onClick={() => setStep(2)}
            disabled={!fullName.trim() || !jobTitle.trim() || !phone.trim() || !startDate.trim()}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 2: Identity & Banking */}
      {step === 2 && (
        <div className="space-y-3.5">
          <CustomSelect label="Government ID Type" options={GOVT_ID_OPTIONS} value={govtIdType} onChange={setGovtIdType} />
          <Input label="ID Number" placeholder="Enter ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          <Input label="Next of Kin Name" placeholder="Enter Name" value={nextOfKinName} onChange={(e) => setNextOfKinName(e.target.value)} />
          <Input label="Next of Kin Phone" placeholder="+234 000 000 0000" value={nextOfKinPhone} onChange={(e) => setNextOfKinPhone(e.target.value)} />
          <CustomSelect label="Bank Name" options={BANK_OPTIONS} value={bankName} onChange={setBankName} searchable placeholder="Select Nigerian bank..." />
          <Input label="Account Number" placeholder="10-digit NUBAN number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
          <Input label="Account Name" placeholder="Name on the bank account" value={accountName} onChange={(e) => setAccountName(e.target.value)} />

          <div className="bg-[#EFF5FF] p-3.5 rounded-xl border border-[#BFDBFE] text-[#0055FF] flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              A secure Vintran business wallet will be created automatically for this staff member to receive automated payroll payments.
            </p>
          </div>

          <Button fullWidth onClick={() => setStep(3)} className="flex items-center justify-center gap-2 mt-4">
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 3: Permissions */}
      {step === 3 && (
        <div className="space-y-3.5">
          <div className="bg-[#EFF5FF] p-3.5 rounded-xl text-[#0055FF] flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">Choose a role to grant its permissions:</p>
          </div>

          <div className="space-y-2">
            {roles.length === 0 ? (
              <p className="text-[#94A3B8] text-center py-6">No roles set up yet — this staff member will be created with default permissions.</p>
            ) : (
              roles.map((r) => {
                const isSel = selectedRoleId === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoleId(isSel ? null : r.id)}
                    className={cn(
                      'p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors',
                      isSel ? 'border-[#0055FF] bg-[#EFF5FF]' : 'border-[#E2E8F0] bg-[#F8FAFC] hover:bg-gray-100'
                    )}
                  >
                    <div>
                      <p className="font-semibold text-[#0A0D14]">{r.name}</p>
                      <p className="text-[11px] text-[#64748B] mt-0.5">{r.permissions?.length || 0} permission(s)</p>
                    </div>
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                        isSel ? 'border-[#0055FF] bg-[#0055FF]' : 'border-[#CBD5E1]'
                      )}
                    >
                      {isSel && <Check size={12} className="text-white" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <Button fullWidth onClick={() => setStep(4)} className="flex items-center justify-center gap-2 mt-4">
            <span>Next</span>
            <ArrowRight size={16} />
          </Button>
        </div>
      )}

      {/* Step 4: Payroll Setup */}
      {step === 4 && (
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#0A0D14]">Pay Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPayType('Salary')}
                className={cn('flex-1 py-2.5 rounded-xl border font-semibold text-xs transition-colors cursor-pointer', payType === 'Salary' ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-gray-50 text-[#64748B] border-[#E2E8F0]')}
              >
                Monthly Salary
              </button>
              <button
                type="button"
                onClick={() => setPayType('Hourly')}
                className={cn('flex-1 py-2.5 rounded-xl border font-semibold text-xs transition-colors cursor-pointer', payType === 'Hourly' ? 'bg-[#0055FF] text-white border-[#0055FF]' : 'bg-gray-50 text-[#64748B] border-[#E2E8F0]')}
              >
                Hourly Rate
              </button>
            </div>
          </div>

          <Input label="Base Pay Amount *" placeholder="₦" value={basePay} onChange={(e) => setBasePay(e.target.value)} type="number" required />
          <CustomSelect label="Pay Period *" options={PAY_PERIOD_OPTIONS} value={payPeriod} onChange={setPayPeriod} />
          <Input label="First Run Date (optional)" type="date" value={firstRunOnUtc} onChange={(e) => setFirstRunOnUtc(e.target.value)} />

          {/* Dynamic Allowances */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#0A0D14]">Allowances</span>
              <button type="button" onClick={() => setAllowances([...allowances, { name: '', amount: '' }])} className="text-[#0055FF] font-semibold text-xs cursor-pointer hover:underline">
                + Add
              </button>
            </div>
            {allowances.map((a, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={a.name}
                  onChange={(e) => {
                    const copy = [...allowances];
                    copy[idx].name = e.target.value;
                    setAllowances(copy);
                  }}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder="₦"
                  value={a.amount}
                  onChange={(e) => {
                    const copy = [...allowances];
                    copy[idx].amount = e.target.value;
                    setAllowances(copy);
                  }}
                  className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
                />
                <button type="button" onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))} className="text-rose-600 font-bold px-1 cursor-pointer">
                  ×
                </button>
              </div>
            ))}
          </div>

          {/* Dynamic Deductions */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center">
              <span className="font-bold text-[#0A0D14]">Deductions</span>
              <button type="button" onClick={() => setDeductions([...deductions, { name: '', amount: '' }])} className="text-[#0055FF] font-semibold text-xs cursor-pointer hover:underline">
                + Add
              </button>
            </div>
            {deductions.map((d, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={d.name}
                  onChange={(e) => {
                    const copy = [...deductions];
                    copy[idx].name = e.target.value;
                    setDeductions(copy);
                  }}
                  className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder="₦"
                  value={d.amount}
                  onChange={(e) => {
                    const copy = [...deductions];
                    copy[idx].amount = e.target.value;
                    setDeductions(copy);
                  }}
                  className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
                />
                <button type="button" onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))} className="text-rose-600 font-bold px-1 cursor-pointer">
                  ×
                </button>
              </div>
            ))}
          </div>

          <Button fullWidth onClick={handleCreate} disabled={!basePay.trim() || submitting} className="mt-4">
            {submitting ? 'Creating Staff Member…' : 'Create Staff'}
          </Button>
        </div>
      )}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 5: Payroll Config Sheet Component ────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

function PayrollConfigSheet({
  staffId,
  existing,
  onClose,
  onSaved,
}: {
  staffId: string;
  existing?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [payType, setPayType] = useState<'Salary' | 'Hourly'>(existing?.payType || 'Salary');
  const [baseAmount, setBaseAmount] = useState(existing ? String(existing.baseAmount) : '');
  const [period, setPeriod] = useState(existing?.period || 'Monthly');
  const [allowances, setAllowances] = useState<{ name: string; amount: string }[]>(
    existing?.allowances?.map((a: any) => ({ name: a.name, amount: String(a.amount) })) || []
  );
  const [deductions, setDeductions] = useState<{ name: string; amount: string }[]>(
    existing?.deductions?.map((d: any) => ({ name: d.name, amount: String(d.amount) })) || []
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!baseAmount.trim()) return;
    setIsSaving(true);
    try {
      const body = {
        staffId,
        payType,
        baseAmount: Number(baseAmount),
        period,
        allowances: allowances.filter((a) => a.name.trim() && a.amount.trim()).map((a) => ({ name: a.name.trim(), amount: Number(a.amount) || 0 })),
        deductions: deductions.filter((d) => d.name.trim() && d.amount.trim()).map((d) => ({ name: d.name.trim(), amount: Number(d.amount) || 0 })),
      };

      if (existing) {
        await staffApi.updatePayroll(body);
      } else {
        await staffApi.setupPayroll(body);
      }
      toast.success('Payroll configuration saved!');
      onSaved();
    } catch (err) {
      toast.error('Failed to save config');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0A0D14]">{existing ? 'Edit Payroll Configuration' : 'Set Up Payroll'}</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8]">
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPayType('Salary')}
            className={cn('flex-1 py-2 rounded-full font-semibold border', payType === 'Salary' ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B]')}
          >
            Monthly Salary
          </button>
          <button
            type="button"
            onClick={() => setPayType('Hourly')}
            className={cn('flex-1 py-2 rounded-full font-semibold border', payType === 'Hourly' ? 'bg-[#0055FF] text-white' : 'bg-[#F1F5F9] text-[#64748B]')}
          >
            Hourly Rate
          </button>
        </div>

        <Input label="Base Salary *" placeholder="₦" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} type="number" />
        <CustomSelect label="Pay Period" options={PAY_PERIOD_OPTIONS} value={period} onChange={setPeriod} />

        {/* Dynamic Allowances */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#0A0D14]">Allowances</span>
            <button type="button" onClick={() => setAllowances([...allowances, { name: '', amount: '' }])} className="text-[#0055FF] font-semibold">
              + Add Allowance
            </button>
          </div>
          {allowances.map((a, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                value={a.name}
                onChange={(e) => {
                  const copy = [...allowances];
                  copy[idx].name = e.target.value;
                  setAllowances(copy);
                }}
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
              />
              <input
                type="number"
                placeholder="₦"
                value={a.amount}
                onChange={(e) => {
                  const copy = [...allowances];
                  copy[idx].amount = e.target.value;
                  setAllowances(copy);
                }}
                className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
              />
              <button type="button" onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))} className="text-rose-600 font-bold px-1">
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Dynamic Deductions */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#0A0D14]">Deductions</span>
            <button type="button" onClick={() => setDeductions([...deductions, { name: '', amount: '' }])} className="text-[#0055FF] font-semibold">
              + Add Deduction
            </button>
          </div>
          {deductions.map((d, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                placeholder="Name"
                value={d.name}
                onChange={(e) => {
                  const copy = [...deductions];
                  copy[idx].name = e.target.value;
                  setDeductions(copy);
                }}
                className="flex-1 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
              />
              <input
                type="number"
                placeholder="₦"
                value={d.amount}
                onChange={(e) => {
                  const copy = [...deductions];
                  copy[idx].amount = e.target.value;
                  setDeductions(copy);
                }}
                className="w-24 px-3 py-2 border border-[#E2E8F0] rounded-xl text-xs"
              />
              <button type="button" onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))} className="text-rose-600 font-bold px-1">
                ×
              </button>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={handleSave} disabled={!baseAmount.trim() || isSaving}>
          {isSaving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 6: Monthly Payslip Receipt Screen ────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

function PayslipReceiptScreen({
  runId,
  staffId,
  onBack,
}: {
  runId: string;
  staffId: string;
  onBack: () => void;
}) {
  const [payslip, setPayslip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    staffApi
      .getPayslip(runId, staffId)
      .then((res: any) => setPayslip(res.data || res))
      .catch(() => setPayslip(null))
      .finally(() => setLoading(false));
  }, [runId, staffId]);

  if (loading || !payslip) {
    return <div className="py-20 text-center text-xs text-[#64748B]">Loading payslip receipt...</div>;
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-12 text-xs">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="p-1">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-bold text-[#0A0D14]">Payslip Receipt</h1>
        <div className="w-5" />
      </div>

      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-[#0A0D14]">Payslip</h2>
          <p className="text-xs text-[#64748B]">Period: {payslip.payPeriodLabel}</p>
          <span className="inline-block text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mt-1">
            Disbursed / Paid
          </span>
        </div>

        {/* Earnings Breakdown */}
        <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
          <p className="font-bold text-[#64748B] text-[11px]">EARNINGS BREAKDOWN</p>
          <div className="flex justify-between py-1">
            <span className="text-[#64748B]">Base Salary</span>
            <span className="font-semibold text-[#0A0D14]">{fmt(payslip.baseSalary)}</span>
          </div>
          {(payslip.allowances || []).map((a: any, i: number) => (
            <div key={i} className="flex justify-between py-1">
              <span className="text-[#64748B]">{a.name}</span>
              <span className="font-semibold text-[#0A0D14]">{fmt(a.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-bold text-[#0A0D14] border-t border-dashed pt-2">
            <span>Gross Pay</span>
            <span>{fmt(payslip.grossPay)}</span>
          </div>
        </div>

        {/* Deductions Breakdown */}
        <div className="space-y-2 border-t border-[#E2E8F0] pt-3">
          <p className="font-bold text-[#64748B] text-[11px]">DEDUCTIONS</p>
          {(payslip.deductions || []).map((d: any, i: number) => (
            <div key={i} className="flex justify-between py-1 text-rose-600">
              <span>{d.name}</span>
              <span className="font-semibold">-{fmt(d.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-bold text-rose-600 border-t border-dashed pt-2">
            <span>Total Deductions</span>
            <span>-{fmt(payslip.totalDeductions)}</span>
          </div>
        </div>

        {/* Net Take Home Card */}
        <div className="bg-[#DBEAFE] rounded-xl p-4 flex justify-between items-center text-[#0055FF]">
          <span className="font-bold">NET TAKE-HOME PAY</span>
          <span className="text-xl font-bold">{fmt(payslip.netPay)}</span>
        </div>

        <div className="space-y-2 pt-2 border-t border-[#E2E8F0]">
          <div className="flex justify-between py-1">
            <span className="text-[#64748B]">Payment Method</span>
            <span className="font-semibold text-[#0055FF]">Vintran Wallet (Auto-Disbursed)</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-[#64748B]">Disbursement Date</span>
            <span className="font-semibold text-[#0A0D14]">
              {payslip.paidOnUtc ? new Date(payslip.paidOnUtc).toLocaleDateString() : 'Not yet disbursed'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
