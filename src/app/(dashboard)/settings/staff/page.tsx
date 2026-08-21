'use client';

import { useState, useEffect, useMemo } from 'react';
import { staffApi, activityApi, salesApi } from '@/src/lib/api/commerce';
import { usersApi } from '@/src/lib/api/auth';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  Shield,
  DollarSign,
  Clock,
  ArrowLeft,
  X,
  ChevronRight,
  Phone,
  Briefcase,
  CreditCard,
  Building2,
  Check,
} from 'lucide-react';
import Link from 'next/link';

const TABS = ['Overview', 'Payroll', 'Shifts & Attendance'] as const;
type MainTab = (typeof TABS)[number];

type ProfileSubTab = 'Overview' | 'Payroll' | 'Activity' | 'Settings';

function fmt(n: number = 0) {
  return `₦${(n ?? 0).toLocaleString('en-NG')}`;
}

function initials(firstName: string = '', lastName: string = '') {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase() || 'ST';
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  Active: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: '#16A34A' },
  OnLeave: { label: 'On Leave', bg: 'bg-amber-50 text-amber-700 border-amber-200', color: '#D97706' },
  Suspended: { label: 'Suspended', bg: 'bg-rose-50 text-rose-700 border-rose-200', color: '#EF4444' },
};

const PAYROLL_STATUS_STYLE: Record<string, { label: string; bg: string; text: string }> = {
  Draft: { label: 'Draft', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
  Scheduled: { label: 'Scheduled', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  Paid: { label: 'Disbursed', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
};

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('Overview');

  // Staff Data State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Main navigation / screen stack
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [runPayrollOpen, setRunPayrollOpen] = useState(false);
  const [selectedPayslipRef, setSelectedPayslipRef] = useState<{ runId: string; staffId: string } | null>(null);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [usersRes, rolesRes]: any[] = await Promise.all([
        usersApi.list().catch(() => staffApi.list()),
        staffApi.listRoles().catch(() => ({ data: [] })),
      ]);

      const rawStaffList = usersRes?.data ?? usersRes?.items ?? usersRes;
      const listArray = Array.isArray(rawStaffList) ? rawStaffList : [];
      setStaffList(listArray);

      const rawRoles = rolesRes?.data ?? rolesRes?.items ?? rolesRes;
      setRoles(Array.isArray(rawRoles) ? rawRoles : []);
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

  const safeStaffList = useMemo(() => {
    return Array.isArray(staffList) ? staffList : [];
  }, [staffList]);

  const filteredStaff = useMemo(() => {
    if (!search.trim()) return safeStaffList;
    const q = search.toLowerCase();
    return safeStaffList.filter(
      (s) =>
        s.firstName?.toLowerCase().includes(q) ||
        s.lastName?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.jobTitle?.toLowerCase().includes(q) ||
        s.roleName?.toLowerCase().includes(q)
    );
  }, [safeStaffList, search]);

  const activeStaffCount = useMemo(
    () => safeStaffList.filter((s) => s.isActive !== false && s.status !== 'Suspended').length,
    [safeStaffList]
  );

  const handleToggleStatus = async (staff: any) => {
    try {
      if (staff.isActive !== false) {
        await usersApi.disable(staff.id).catch(() => staffApi.deactivate(staff.id));
        toast.success(`${staff.firstName} has been deactivated`);
      } else {
        await usersApi.enable(staff.id);
        toast.success(`${staff.firstName} has been activated`);
      }
      fetchStaffData();
    } catch (err) {
      toast.error('Failed to update staff status');
    }
  };

  // Sub-screen rendering: Payslip Receipt
  if (selectedPayslipRef) {
    return (
      <PayslipReceiptScreen
        runId={selectedPayslipRef.runId}
        staffId={selectedPayslipRef.staffId}
        onBack={() => setSelectedPayslipRef(null)}
      />
    );
  }

  // Sub-screen rendering: Run Payroll
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

  // Sub-screen rendering: Add Staff Wizard
  if (showAddWizard) {
    return (
      <AddStaffWizardScreen
        roles={roles}
        onDone={() => {
          setShowAddWizard(false);
          fetchStaffData();
        }}
        onCancel={() => setShowAddWizard(false)}
      />
    );
  }

  // Sub-screen rendering: Staff Profile
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0A0D14]">Staff Management</h1>
            <p className="text-sm text-[#64748B] mt-0.5">
              Manage your team members, permissions, shifts, and payroll disbursal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddWizard(true)}
          className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus size={16} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-[#F1F5F9]">
        <div className="flex gap-8">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={cn(
                'py-3 text-sm font-semibold transition-colors cursor-pointer relative',
                activeTab === t ? 'text-[#0055FF]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {activeTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── 1. Overview Tab ── */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#EFF5FF] text-[#0055FF] flex items-center justify-center mb-3">
                <Users size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Total Staff Members</p>
              <p className="text-2xl font-bold text-[#0A0D14] mt-1">{safeStaffList.length}</p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mb-3">
                <UserCheck size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Active Members</p>
              <p className="text-2xl font-bold text-[#0A0D14] mt-1">{activeStaffCount}</p>
            </div>

            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mb-3">
                <Shield size={18} />
              </div>
              <p className="text-xs text-[#64748B]">Configured Roles</p>
              <p className="text-2xl font-bold text-[#0A0D14] mt-1">{roles.length || 3}</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-3 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search by name, email, title or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0A0D14] placeholder-[#94A3B8] focus:outline-none focus:border-[#0055FF]"
            />
          </div>

          {/* Staff Table */}
          {loading ? (
            <div className="py-12 text-center text-sm text-[#64748B]">Loading staff members...</div>
          ) : filteredStaff.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#94A3B8]">No staff members found</div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Name & Title</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Employment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9]">
                  {filteredStaff.map((staff) => {
                    const statusKey = staff.status || (staff.isActive !== false ? 'Active' : 'Suspended');
                    const statusBadge = STATUS_STYLE[statusKey] || STATUS_STYLE.Active;

                    return (
                      <tr key={staff.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-[#0A0D14]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#EFF5FF] text-[#0055FF] font-bold flex items-center justify-center text-xs border border-[#BFDBFE]">
                              {initials(staff.firstName, staff.lastName)}
                            </div>
                            <div>
                              <p className="font-bold text-[#0A0D14]">
                                {staff.firstName} {staff.lastName}
                              </p>
                              <p className="text-[11px] text-[#64748B] font-normal">{staff.jobTitle || 'Staff Member'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          <p>{staff.email || '—'}</p>
                          <p className="text-[11px] text-[#94A3B8]">{staff.phoneNumber || '—'}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[11px] font-semibold text-[#0055FF] bg-[#EFF5FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                            {staff.roleName || staff.role || (staff.isOwner ? 'Owner' : 'Staff')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B]">
                          {staff.employmentType || 'Full-Time'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              'text-[11px] font-semibold px-2.5 py-0.5 rounded-full border',
                              statusBadge.bg
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-3">
                          <button
                            type="button"
                            onClick={() => setSelectedStaffId(staff.id)}
                            className="text-[#0055FF] font-semibold hover:underline cursor-pointer"
                          >
                            Profile & Details
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(staff)}
                            className="text-[#64748B] font-semibold hover:text-[#0A0D14] cursor-pointer"
                          >
                            {staff.isActive !== false ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 2. Payroll Tab ── */}
      {activeTab === 'Payroll' && (
        <PayrollTabContent
          onOpenRunPayroll={() => setRunPayrollOpen(true)}
          onViewPayslip={(runId, staffId) => setSelectedPayslipRef({ runId, staffId })}
        />
      )}

      {/* ── 3. Shifts & Attendance Tab ── */}
      {activeTab === 'Shifts & Attendance' && <ShiftsTabContent staffList={safeStaffList} />}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 1: Staff Profile Screen (Replicates Mobile StaffProfile) ──
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

  // Staff profile state
  const [profile, setProfile] = useState<any>(null);
  const [config, setConfig] = useState<any>(null);
  const [payHistory, setPayHistory] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals inside profile
  const [payStaffModalOpen, setPayStaffModalOpen] = useState(false);
  const [payPartialMode, setPayPartialMode] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);

  const [payrollConfigModalOpen, setPayrollConfigModalOpen] = useState(false);
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

      const profData = profRes?.data ?? profRes;
      setProfile(profData || null);

      const cfgData = configRes?.data ?? configRes;
      setConfig(cfgData || null);

      const histItems = historyRes?.data?.items ?? historyRes?.items ?? historyRes?.data ?? [];
      setPayHistory(Array.isArray(histItems) ? histItems : []);

      const salesItems = salesRes?.data?.items ?? salesRes?.items ?? salesRes?.data ?? [];
      setRecentSales(Array.isArray(salesItems) ? salesItems : []);

      const actItems = actRes?.data?.items ?? actRes?.items ?? actRes?.data ?? [];
      setActivities(Array.isArray(actItems) ? actItems : []);
    } catch (err) {
      toast.error('Failed to load staff details');
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

  const handlePayStaff = async () => {
    if (!payNotes.trim()) {
      toast.error('Please add payment notes');
      return;
    }
    const amt = payPartialMode ? Number(partialAmount) : undefined;
    if (payPartialMode && (!amt || Number.isNaN(amt))) {
      toast.error('Please enter a valid partial amount');
      return;
    }
    setPaying(true);
    try {
      await staffApi.adHocPay({
        staffId,
        notes: payNotes.trim(),
        amount: amt,
      });
      toast.success('Payment disbursed successfully to staff Vintran wallet!');
      setPayStaffModalOpen(false);
      setPayNotes('');
      setPartialAmount('');
      loadProfileData();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to disburse payment');
    } finally {
      setPaying(false);
    }
  };

  const handleSetStatus = async (status: string) => {
    try {
      await staffApi.setStatus(staffId, status);
      toast.success(`Status updated to ${status}`);
      setStatusPickerOpen(false);
      loadProfileData();
      onStaffUpdated();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate this staff member? This will revoke app access.')) return;
    try {
      await staffApi.deactivate(staffId);
      toast.success('Staff member deactivated');
      onBack();
      onStaffUpdated();
    } catch (err) {
      toast.error('Failed to deactivate staff member');
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-[#64748B]">
        Loading staff profile...
      </div>
    );
  }

  const staffName = profile ? `${profile.firstName} ${profile.lastName}` : 'Staff Member';
  const statusKey = profile?.status || (profile?.isActive !== false ? 'Active' : 'Suspended');
  const statusBadge = STATUS_STYLE[statusKey] || STATUS_STYLE.Active;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#0A0D14]">Staff Profile</h1>
          <p className="text-xs text-[#64748B]">View personal details, payroll history, and account settings.</p>
        </div>
      </div>

      {/* Staff Profile Header Card */}
      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#EFF5FF] text-[#0055FF] font-bold text-xl flex items-center justify-center border-2 border-[#BFDBFE]">
            {initials(profile?.firstName, profile?.lastName)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0A0D14]">{staffName}</h2>
            <p className="text-sm text-[#64748B] mt-0.5">{profile?.jobTitle || 'Staff Member'}</p>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStatusPickerOpen(true)}
                className={cn(
                  'text-xs font-semibold px-2.5 py-0.5 rounded-full border cursor-pointer hover:opacity-80 transition-opacity',
                  statusBadge.bg
                )}
              >
                {statusBadge.label} (Change)
              </button>
              <span className="text-xs font-semibold text-[#0055FF] bg-[#EFF5FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
                {profile?.employmentType || 'Full-Time'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPayStaffModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-sm font-medium hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <DollarSign size={16} />
            <span>Pay Staff</span>
          </button>
        </div>
      </div>

      {/* Profile Sub-tabs */}
      <div className="border-b border-[#F1F5F9]">
        <div className="flex gap-6">
          {(['Overview', 'Payroll', 'Activity', 'Settings'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={cn(
                'py-2.5 text-sm font-semibold transition-colors cursor-pointer relative',
                subTab === t ? 'text-[#0055FF]' : 'text-[#64748B] hover:text-[#0A0D14]'
              )}
            >
              {t}
              {subTab === t && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0055FF] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tab 1: OVERVIEW */}
      {subTab === 'Overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Info */}
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#0A0D14] flex items-center gap-2">
                <Phone size={16} className="text-[#0055FF]" /> Contact Information
              </h3>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Phone Number</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.phoneNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Email Address</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.email || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Home Address</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.homeAddress || '—'}</span>
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#0A0D14] flex items-center gap-2">
                <Briefcase size={16} className="text-[#0055FF]" /> Employment Details
              </h3>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Start Date</span>
                  <span className="font-semibold text-[#0A0D14]">
                    {profile?.startDate ? new Date(profile.startDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">{profile?.governmentIdType || 'Government ID'}</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.governmentIdNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Next of Kin</span>
                  <span className="font-semibold text-[#0A0D14]">
                    {profile?.nextOfKinFirstName
                      ? `${profile.nextOfKinFirstName} ${profile.nextOfKinLastName || ''} (${profile.nextOfKinContact || '—'})`
                      : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Vintran Wallet */}
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#0A0D14] flex items-center gap-2">
                <CreditCard size={16} className="text-[#0055FF]" /> Vintran Wallet
              </h3>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#64748B]">Linked Wallet Account</span>
                <span className="font-semibold text-[#0055FF]">
                  {profile?.vintranAccountId ? `Linked (${profile.vintranAccountId.slice(0, 8)}…)` : 'Not linked yet'}
                </span>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#0A0D14] flex items-center gap-2">
                <Building2 size={16} className="text-[#0055FF]" /> Bank Details
              </h3>
              <div className="divide-y divide-[#F1F5F9] text-xs">
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Bank Name</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.bankName || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Account Number</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.bankAccountNumber || '—'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#64748B]">Account Name</span>
                  <span className="font-semibold text-[#0A0D14]">{profile?.bankAccountName || '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A0D14]">Recent Sales</h3>
            {recentSales.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No sales recorded yet by this staff member</p>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-[#0A0D14]">{sale.number || sale.id}</p>
                      <p className="text-[#64748B] text-[11px] mt-0.5">{sale.channel || 'InStore'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#0A0D14]">{fmt(sale.grandTotal)}</p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {sale.createdOnUtc ? new Date(sale.createdOnUtc).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: PAYROLL */}
      {subTab === 'Payroll' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#0A0D14]">Payroll Configuration</h3>
            <button
              type="button"
              onClick={() => setPayrollConfigModalOpen(true)}
              className="text-xs font-semibold text-[#0055FF] bg-[#EFF5FF] hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              {config ? 'Edit Configuration' : 'Set Up Payroll'}
            </button>
          </div>

          {config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pay Config Card */}
              <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Base Salary</h4>
                <div className="divide-y divide-[#F1F5F9] text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-[#64748B]">Pay Type</span>
                    <span className="font-semibold text-[#0A0D14]">
                      {config.payType === 'Salary' ? 'Monthly Salary' : 'Hourly Rate'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#64748B]">Base Amount</span>
                    <span className="font-bold text-[#0A0D14]">{fmt(config.baseAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[#64748B]">Pay Period</span>
                    <span className="font-semibold text-[#0A0D14]">{config.period || 'Monthly'}</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Summary Card */}
              <div className="bg-[#EFF5FF] border border-[#BFDBFE] rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-[#0055FF] uppercase tracking-wider">Net Take-Home Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Base + Allowances</span>
                    <span className="font-semibold text-[#0A0D14]">
                      {fmt((config.baseAmount || 0) + (config.totalAllowances || 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Total Deductions</span>
                    <span className="font-semibold text-rose-600">-{fmt(config.totalDeductions)}</span>
                  </div>
                  <div className="pt-3 border-t border-[#BFDBFE] flex justify-between items-center">
                    <span className="font-bold text-[#0A0D14]">Net Disbursal</span>
                    <span className="text-xl font-bold text-[#0055FF]">{fmt(netPayNow)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 text-center shadow-sm">
              <p className="text-sm text-[#64748B]">No payroll configuration set up for this staff member.</p>
              <button
                type="button"
                onClick={() => setPayrollConfigModalOpen(true)}
                className="mt-3 text-xs font-semibold text-[#0055FF] bg-[#EFF5FF] px-4 py-2 rounded-xl cursor-pointer hover:bg-blue-100"
              >
                Set Up Payroll Now
              </button>
            </div>
          )}

          {/* Payment History */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0A0D14]">Payment History</h3>
            {payHistory.length === 0 ? (
              <p className="text-xs text-[#94A3B8]">No payment records found</p>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {payHistory.map((p) => (
                  <div
                    key={p.payrollItemId || p.id}
                    onClick={() => p.payrollRunId && onViewPayslip(p.payrollRunId, staffId)}
                    className="py-3 flex items-center justify-between text-xs hover:bg-[#F8FAFC] px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-[#0A0D14]">{p.payPeriodLabel || 'Disbursal'}</p>
                      <p className="text-[11px] text-[#64748B]">
                        {p.paidOnUtc ? new Date(p.paidOnUtc).toLocaleDateString() : p.runStatus}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-[#0A0D14]">{fmt(p.netPay)}</p>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {p.disbursementStatus || 'Completed'}
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-[#94A3B8]" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: ACTIVITY */}
      {subTab === 'Activity' && (
        <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#0A0D14]">Activity Log</h3>
          {activities.length === 0 ? (
            <p className="text-xs text-[#94A3B8]">No activity recorded yet for this staff member.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {activities.map((act) => (
                <div key={act.id} className="flex gap-3 pb-3 border-b border-[#F1F5F9]">
                  <div className="w-2 h-2 rounded-full bg-[#0055FF] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-[#0A0D14]">{act.summary || act.description || 'Activity logged'}</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      {act.occurredOnUtc ? new Date(act.occurredOnUtc).toLocaleString() : ''}
                    </p>
                  </div>
                  {act.category && (
                    <span className="text-[10px] font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full h-fit">
                      {act.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 4: SETTINGS */}
      {subTab === 'Settings' && (
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0A0D14]">Account Status</h3>
            <div className="divide-y divide-[#F1F5F9] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">App Login Status</span>
                <span className="font-semibold text-emerald-600">{profile?.loginStatus || 'Active'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Last Login</span>
                <span className="font-semibold text-[#0A0D14]">
                  {profile?.lastLoginOnUtc ? new Date(profile.lastLoginOnUtc).toLocaleString() : 'Never'}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Login Email</span>
                <span className="font-semibold text-[#0A0D14]">{profile?.email || '—'}</span>
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-[#0A0D14]">Role & Permissions</h3>
            <div className="divide-y divide-[#F1F5F9] text-xs">
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">Assigned Role</span>
                <span className="font-semibold text-[#0055FF]">{profile?.roleName || profile?.role || 'Staff'}</span>
              </div>
            </div>
            {profile?.permissions && profile.permissions.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-[#64748B] mb-2">Granted Permissions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.permissions.map((p: string) => (
                    <span key={p} className="text-[10px] font-semibold text-[#0055FF] bg-[#EFF5FF] px-2 py-0.5 rounded-md">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-rose-700">Danger Zone</h3>
            <p className="text-xs text-rose-600">
              Deactivating this staff member will immediately revoke their access to the Vintran app.
            </p>
            <button
              type="button"
              onClick={handleDeactivate}
              className="h-9 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              Deactivate Staff Member
            </button>
          </div>
        </div>
      )}

      {/* ── Status Picker Modal ── */}
      {statusPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Set Staff Status</h2>
              <button type="button" onClick={() => setStatusPickerOpen(false)} className="text-[#94A3B8] hover:text-[#0A0D14]">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {['Active', 'OnLeave', 'Suspended'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSetStatus(st)}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#F1F5F9] hover:bg-[#EFF5FF] text-left text-xs font-semibold text-[#0A0D14] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{STATUS_STYLE[st]?.label || st}</span>
                  {statusKey === st && <Check size={16} className="text-[#0055FF]" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Pay Staff Modal ── */}
      {payStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0D14]">Pay Staff Member</h2>
              <button type="button" onClick={() => setPayStaffModalOpen(false)} className="text-[#94A3B8] hover:text-[#0A0D14]">
                <X size={20} />
              </button>
            </div>

            <div className="p-3 bg-[#EFF5FF] rounded-xl border border-[#BFDBFE] flex items-center justify-between text-xs">
              <span className="text-[#64748B]">Staff Member:</span>
              <span className="font-bold text-[#0A0D14]">{staffName}</span>
            </div>

            {config ? (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Configured Net Pay:</span>
                  <span className="font-bold text-[#0055FF]">{fmt(netPayNow)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                No configured payroll — enter partial/custom amount to disburse.
              </p>
            )}

            {payPartialMode && (
              <Input
                label="Partial Amount (₦) *"
                type="number"
                value={partialAmount}
                placeholder="Enter amount..."
                onChange={(e) => setPartialAmount(e.target.value)}
                required
              />
            )}

            <Input
              label="Payment Notes / Description *"
              value={payNotes}
              placeholder="e.g. July Bonus / Advance payment"
              onChange={(e) => setPayNotes(e.target.value)}
              required
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setPayPartialMode(!payPartialMode)}
                className="text-xs"
              >
                {payPartialMode ? 'Use Full Pay' : 'Pay Partial'}
              </Button>
              <Button
                type="button"
                onClick={handlePayStaff}
                disabled={paying}
                className="flex-1 text-xs"
              >
                {paying ? 'Disbursing...' : payPartialMode ? `Disburse ${fmt(Number(partialAmount) || 0)}` : `Disburse ${fmt(netPayNow)}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payroll Config Modal ── */}
      {payrollConfigModalOpen && (
        <PayrollConfigModal
          staffId={staffId}
          existing={config}
          onClose={() => setPayrollConfigModalOpen(false)}
          onSaved={() => {
            setPayrollConfigModalOpen(false);
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
    <div className="space-y-6">
      {/* Pending / In-progress Payroll Card */}
      {pendingRun ? (
        <div
          onClick={onOpenRunPayroll}
          className="bg-white border border-[#0055FF] rounded-2xl p-6 shadow-sm cursor-pointer hover:border-blue-600 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0055FF] bg-[#EFF5FF] px-2.5 py-0.5 rounded-full border border-[#BFDBFE]">
              {pendingRun.status === 'Draft' ? 'Payroll in Progress' : 'Scheduled Run'}
            </span>
            <h3 className="text-xl font-bold text-[#0A0D14] mt-2">{fmt(pendingRun.totalNet)}</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              {pendingRun.payPeriodLabel} • {pendingRun.staffCount || 0} staff members
            </p>
          </div>
          <button
            type="button"
            className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Continue Payroll Run
          </button>
        </div>
      ) : (
        <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#0A0D14]">Monthly Payroll Disbursal</h3>
            <p className="text-xs text-[#64748B] mt-0.5">
              Automatically calculate salaries, bonuses, and deductions for all active staff.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenRunPayroll}
            className="h-10 px-4 rounded-xl bg-[#0055FF] text-white text-xs font-semibold hover:bg-blue-700 flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Plus size={16} />
            <span>Run Payroll</span>
          </button>
        </div>
      )}

      {/* Payroll History */}
      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#0A0D14]">Payroll History</h3>
        {loading ? (
          <p className="text-xs text-[#64748B]">Loading history...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-[#94A3B8]">No past payroll runs recorded.</p>
        ) : (
          <div className="divide-y divide-[#F1F5F9]">
            {history.map((h) => {
              const statusStyle = PAYROLL_STATUS_STYLE[h.status] || {
                label: h.status,
                bg: 'bg-gray-50 border-gray-200',
                text: 'text-gray-700',
              };

              return (
                <div key={h.runId || h.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#0A0D14]">{h.payPeriodLabel}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {h.createdOnUtc ? new Date(h.createdOnUtc).toLocaleDateString() : ''} • {h.staffCount || 0} staff
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="font-bold text-[#0A0D14]">{fmt(h.totalNet)}</p>
                      <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', statusStyle.bg, statusStyle.text)}>
                        {statusStyle.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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

  // Adjust Pay modal inside run
  const [adjustStaffId, setAdjustStaffId] = useState<string | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [savingAdjust, setSavingAdjust] = useState(false);

  const handleComputeRun = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success('Payroll computed successfully');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to compute payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!runData?.runId) return;
    setDisbursing(true);
    try {
      await staffApi.disbursePayroll({ runId: runData.runId, mode: 'Automatic' });
      toast.success('Payroll disbursed successfully!');
      onBack();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to disburse payroll');
    } finally {
      setDisbursing(false);
    }
  };

  const handleSaveAdjust = async () => {
    if (!runData?.runId || !adjustStaffId || !adjustAmount.trim() || !adjustNotes.trim()) {
      toast.error('Amount and notes are required');
      return;
    }
    setSavingAdjust(true);
    try {
      await staffApi.adjustPayrollItem({
        runId: runData.runId,
        staffId: adjustStaffId,
        amount: Number(adjustAmount),
        notes: adjustNotes.trim(),
      });
      toast.success('Payroll item adjusted');
      setAdjustStaffId(null);

      // Reload run data
      const updated: any = await staffApi.getPayrollRun(runData.runId);
      setRunData(updated.data || updated);
    } catch (err) {
      toast.error('Failed to adjust item');
    } finally {
      setSavingAdjust(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[#0A0D14]">Run Payroll</h1>
      </div>

      {!runData ? (
        <form onSubmit={handleComputeRun} className="bg-white border border-[#F1F5F9] rounded-2xl p-6 space-y-4 shadow-sm max-w-md">
          <h2 className="text-base font-bold text-[#0A0D14]">Compute New Payroll Run</h2>
          <Input
            label="Pay Period Label *"
            value={payPeriodLabel}
            placeholder="e.g. August 2026"
            onChange={(e) => setPayPeriodLabel(e.target.value)}
            required
          />
          <Input
            label="Default Monthly Target Hours (Hourly Staff)"
            type="number"
            value={defaultHours}
            onChange={(e) => setDefaultHours(e.target.value)}
          />
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'Computing...' : 'Compute Payroll'}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-[#64748B]">Total Gross Pay</p>
              <p className="text-xl font-bold text-[#0A0D14] mt-1">{fmt(runData.totalGross)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Total Deductions</p>
              <p className="text-xl font-bold text-rose-600 mt-1">-{fmt(runData.totalDeductions)}</p>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Total Net Disbursal</p>
              <p className="text-xl font-bold text-[#0055FF] mt-1">{fmt(runData.totalNet)}</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white border border-[#F1F5F9] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-[#F1F5F9] flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#0A0D14]">Staff Breakdown ({runData.items?.length || 0})</h3>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                <tr>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Gross</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Pay</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {(runData.items || []).map((item: any) => (
                  <tr key={item.staffId}>
                    <td className="py-3 px-4 font-semibold text-[#0A0D14]">{item.staffName || item.staffId}</td>
                    <td className="py-3 px-4 text-[#64748B]">{fmt(item.grossPay)}</td>
                    <td className="py-3 px-4 text-rose-600">-{fmt(item.deductions)}</td>
                    <td className="py-3 px-4 font-bold text-[#0A0D14]">{fmt(item.netPay)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustStaffId(item.staffId);
                          setAdjustAmount(String(item.netPay));
                          setAdjustNotes('');
                        }}
                        className="text-[#0055FF] font-semibold hover:underline cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="secondary" onClick={onBack}>
              Cancel
            </Button>
            <Button onClick={handleDisburse} disabled={disbursing} className="flex-1">
              {disbursing ? 'Disbursing Payments...' : `Disburse Now (${fmt(runData.totalNet)})`}
            </Button>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustStaffId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-[#0A0D14]">Adjust Staff Pay</h2>
            <Input
              label="Adjusted Net Pay (₦) *"
              type="number"
              value={adjustAmount}
              onChange={(e) => setAdjustAmount(e.target.value)}
            />
            <Input
              label="Reason / Notes *"
              value={adjustNotes}
              placeholder="e.g. Overtime bonus"
              onChange={(e) => setAdjustNotes(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="secondary" fullWidth onClick={() => setAdjustStaffId(null)}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleSaveAdjust} disabled={savingAdjust}>
                {savingAdjust ? 'Saving...' : 'Save Adjustment'}
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

function ShiftsTabContent({ staffList }: { staffList: any[] }) {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liveSeconds, setLiveSeconds] = useState(0);

  const myStaffId = staffList[0]?.id; // Default to first staff for demo

  useEffect(() => {
    if (!myStaffId) {
      setLoading(false);
      return;
    }
    staffApi
      .getAttendanceSummary(myStaffId)
      .then((res: any) => {
        const sum = res?.data ?? res;
        setSummary(sum || null);
      })
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, [myStaffId]);

  useEffect(() => {
    if (!summary?.isClockedIn || !summary?.currentShiftStartedUtc) {
      setLiveSeconds(0);
      return;
    }
    const startMs = new Date(summary.currentShiftStartedUtc).getTime();
    const tick = () => setLiveSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [summary?.isClockedIn, summary?.currentShiftStartedUtc]);

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(s)}`;
  };

  const handleClockToggle = async () => {
    if (!myStaffId) return;
    try {
      if (summary?.isClockedIn) {
        await staffApi.clockOut({ staffId: myStaffId });
        toast.success('Clocked out successfully');
      } else {
        await staffApi.clockIn(myStaffId);
        toast.success('Clocked in successfully');
      }
      const updated: any = await staffApi.getAttendanceSummary(myStaffId);
      setSummary(updated?.data ?? updated);
    } catch (err) {
      toast.error('Clock action failed');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Clock In/Out Live Card */}
      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 text-center space-y-4 shadow-sm max-w-md mx-auto">
        <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Current Shift Status</p>
        <div className="text-4xl font-extrabold text-[#0A0D14] tracking-tight">{formatTimer(liveSeconds)}</div>
        <p className="text-xs text-[#64748B]">Active elapsed time today</p>
        <button
          type="button"
          onClick={handleClockToggle}
          className={cn(
            'w-full py-3 rounded-xl font-bold text-sm text-white cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm',
            summary?.isClockedIn ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0055FF] hover:bg-blue-700'
          )}
        >
          <Clock size={16} />
          <span>{summary?.isClockedIn ? 'Clock Out' : 'Clock In'}</span>
        </button>
      </div>

      {/* Roster / Shifts List */}
      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Store Employee Shift Roster</h3>
        <div className="space-y-3">
          {staffList.slice(0, 5).map((staff) => (
            <div
              key={staff.id}
              className="p-3.5 rounded-xl border border-[#F1F5F9] bg-[#F8FAFC] flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[#0055FF]" />
                <div>
                  <p className="font-bold text-[#0A0D14]">
                    {staff.firstName} {staff.lastName}
                  </p>
                  <p className="text-[#64748B]">Shift: 08:00 AM – 05:00 PM</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Clocked In
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Sub-Tab / Screen 4: 4-Step Add Staff Wizard Screen ────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

function AddStaffWizardScreen({
  roles,
  onDone,
  onCancel,
}: {
  roles: any[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [startDate, setStartDate] = useState('');

  const [govtIdType, setGovtIdType] = useState('NIN');
  const [idNumber, setIdNumber] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const [selectedRoleId, setSelectedRoleId] = useState('');

  const [payType, setPayType] = useState<'Salary' | 'Hourly'>('Salary');
  const [basePay, setBasePay] = useState('');
  const [payPeriod, setPayPeriod] = useState('Monthly');

  const handleComplete = async () => {
    if (!firstName.trim() || !email.trim()) {
      toast.error('First name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const created: any = await staffApi.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        jobTitle: jobTitle.trim(),
        phoneNumber: phone.trim(),
        email: email.trim(),
        employmentType: employmentType.replace('-', ''),
        startDate: startDate || new Date().toISOString().slice(0, 10),
        governmentIdType: govtIdType,
        governmentIdNumber: idNumber.trim(),
        nextOfKinFirstName: nextOfKinName.trim(),
        nextOfKinContact: nextOfKinPhone.trim(),
        bankName,
        bankAccountNumber: accountNumber.trim(),
        bankAccountName: accountName.trim(),
        roleId: selectedRoleId || undefined,
      });

      const staffId = created?.data?.id || created?.id;
      if (staffId && basePay.trim()) {
        await staffApi.setupPayroll({
          staffId,
          payType,
          baseAmount: Number(basePay) || 0,
          period: payPeriod,
        });
      }

      toast.success('Staff member created successfully!');
      onDone();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={step > 1 ? () => setStep(step - 1) : onCancel}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#0A0D14]">Add Staff Member</h1>
            <p className="text-xs text-[#64748B]">Step {step} of 4</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="text-xs font-semibold text-[#64748B] hover:text-[#0A0D14]">
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-[#0055FF] transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 space-y-4 shadow-sm">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0A0D14]">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <Input label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Job Title" value={jobTitle} placeholder="e.g. Cashier / Store Manager" onChange={(e) => setJobTitle(e.target.value)} />
            <Button fullWidth onClick={() => setStep(2)}>
              Next: Identity & Banking
            </Button>
          </div>
        )}

        {/* Step 2: Identity & Banking */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0A0D14]">Identity & Banking</h2>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Govt ID Type" value={govtIdType} onChange={(e) => setGovtIdType(e.target.value)} />
              <Input label="ID Number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
            </div>
            <Input label="Next of Kin Name" value={nextOfKinName} onChange={(e) => setNextOfKinName(e.target.value)} />
            <Input label="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input label="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <Input label="Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
            <Button fullWidth onClick={() => setStep(3)}>
              Next: Roles & Permissions
            </Button>
          </div>
        )}

        {/* Step 3: Permissions */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0A0D14]">Assign Role</h2>
            <p className="text-xs text-[#64748B]">Select a role to configure permissions for this staff member.</p>
            <div className="space-y-2">
              {roles.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    'p-3.5 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between',
                    selectedRoleId === r.id ? 'border-[#0055FF] bg-[#EFF5FF]' : 'border-[#F1F5F9] bg-[#F8FAFC]'
                  )}
                >
                  <span className="font-semibold text-[#0A0D14]">{r.name}</span>
                  {selectedRoleId === r.id && <Check size={16} className="text-[#0055FF]" />}
                </div>
              ))}
            </div>
            <Button fullWidth onClick={() => setStep(4)}>
              Next: Payroll Setup
            </Button>
          </div>
        )}

        {/* Step 4: Payroll Setup */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#0A0D14]">Payroll Setup</h2>
            <div className="flex gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPayType('Salary')}
                className={cn('flex-1 py-2 rounded-xl border', payType === 'Salary' ? 'bg-[#0055FF] text-white' : 'bg-gray-50')}
              >
                Monthly Salary
              </button>
              <button
                type="button"
                onClick={() => setPayType('Hourly')}
                className={cn('flex-1 py-2 rounded-xl border', payType === 'Hourly' ? 'bg-[#0055FF] text-white' : 'bg-gray-50')}
              >
                Hourly Rate
              </button>
            </div>
            <Input label="Base Amount (₦) *" type="number" value={basePay} onChange={(e) => setBasePay(e.target.value)} required />
            <Button fullWidth onClick={handleComplete} disabled={submitting}>
              {submitting ? 'Creating Staff Member...' : 'Complete & Create Staff'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────────────────
// ─── Shared Components & Modals ────────────────────────────────────────────────
// ───────────────────────────────────────────────────────────────────────────────

function PayrollConfigModal({
  staffId,
  existing,
  onClose,
  onSaved,
}: {
  staffId: string;
  existing: any;
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
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseAmount.trim()) {
      toast.error('Base pay amount is required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        staffId,
        payType,
        baseAmount: Number(baseAmount),
        period,
        allowances: allowances.map((a) => ({ name: a.name, amount: Number(a.amount) || 0 })),
        deductions: deductions.map((d) => ({ name: d.name, amount: Number(d.amount) || 0 })),
      };

      if (existing) {
        await staffApi.updatePayroll(body);
      } else {
        await staffApi.setupPayroll(body);
      }

      toast.success('Payroll configuration saved!');
      onSaved();
    } catch (err) {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0A0D14]">Payroll Configuration</h2>
          <button type="button" onClick={onClose} className="text-[#94A3B8] hover:text-[#0A0D14]">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPayType('Salary')}
              className={cn('flex-1 py-2 rounded-xl border font-semibold', payType === 'Salary' ? 'bg-[#0055FF] text-white' : 'bg-gray-50')}
            >
              Monthly Salary
            </button>
            <button
              type="button"
              onClick={() => setPayType('Hourly')}
              className={cn('flex-1 py-2 rounded-xl border font-semibold', payType === 'Hourly' ? 'bg-[#0055FF] text-white' : 'bg-gray-50')}
            >
              Hourly Rate
            </button>
          </div>

          <Input label="Base Pay Amount (₦) *" type="number" value={baseAmount} onChange={(e) => setBaseAmount(e.target.value)} required />

          {/* Allowances */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0A0D14]">Allowances</label>
              <button
                type="button"
                onClick={() => setAllowances([...allowances, { name: '', amount: '' }])}
                className="text-[11px] font-bold text-[#0055FF]"
              >
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
                  className="flex-1 px-3 py-2 border rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Amount ₦"
                  value={a.amount}
                  onChange={(e) => {
                    const copy = [...allowances];
                    copy[idx].amount = e.target.value;
                    setAllowances(copy);
                  }}
                  className="w-28 px-3 py-2 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setAllowances(allowances.filter((_, i) => i !== idx))}
                  className="text-rose-500 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Deductions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-[#0A0D14]">Deductions</label>
              <button
                type="button"
                onClick={() => setDeductions([...deductions, { name: '', amount: '' }])}
                className="text-[11px] font-bold text-[#0055FF]"
              >
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
                  className="flex-1 px-3 py-2 border rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Amount ₦"
                  value={d.amount}
                  onChange={(e) => {
                    const copy = [...deductions];
                    copy[idx].amount = e.target.value;
                    setDeductions(copy);
                  }}
                  className="w-28 px-3 py-2 border rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setDeductions(deductions.filter((_, i) => i !== idx))}
                  className="text-rose-500 font-bold px-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" fullWidth disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

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

  if (loading) {
    return <div className="py-20 text-center text-sm text-[#64748B]">Loading payslip receipt...</div>;
  }

  if (!payslip) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm text-[#64748B]">Payslip record unavailable.</p>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto pb-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 text-[#0A0D14] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-[#0A0D14]">Payslip Receipt</h1>
      </div>

      <div className="bg-white border border-[#F1F5F9] rounded-2xl p-6 space-y-6 shadow-sm text-xs">
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-[#0A0D14]">Official Payslip</h2>
          <p className="text-[#64748B]">{payslip.payPeriodLabel}</p>
          <span className="inline-block mt-2 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            {payslip.runStatus || 'Disbursed'}
          </span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 border-t border-[#F1F5F9] pt-4">
          <p className="font-bold text-[#0A0D14]">Earnings Breakdown</p>
          <div className="flex justify-between py-1 text-[#64748B]">
            <span>Base Salary</span>
            <span className="font-semibold text-[#0A0D14]">{fmt(payslip.baseSalary)}</span>
          </div>
          {(payslip.allowances || []).map((a: any, i: number) => (
            <div key={i} className="flex justify-between py-1 text-[#64748B]">
              <span>{a.name}</span>
              <span className="font-semibold text-[#0A0D14]">{fmt(a.amount)}</span>
            </div>
          ))}
          <div className="flex justify-between py-1 font-bold text-[#0A0D14] border-t border-dashed pt-2">
            <span>Gross Pay</span>
            <span>{fmt(payslip.grossPay)}</span>
          </div>
        </div>

        <div className="space-y-2 border-t border-[#F1F5F9] pt-4">
          <p className="font-bold text-[#0A0D14]">Deductions</p>
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

        {/* Take Home Card */}
        <div className="bg-[#EFF5FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center justify-between">
          <span className="font-bold text-[#0055FF]">Net Take-Home Pay</span>
          <span className="text-xl font-bold text-[#0055FF]">{fmt(payslip.netPay)}</span>
        </div>

        <Button fullWidth variant="secondary" onClick={onBack}>
          Close Receipt
        </Button>
      </div>
    </div>
  );
}
