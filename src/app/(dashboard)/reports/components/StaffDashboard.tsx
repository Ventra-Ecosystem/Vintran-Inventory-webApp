'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar, Download, ChevronDown } from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  badgeColor = 'gray',
}: {
  label: string;
  value: string;
  subLabel?: string;
  badgeColor?: 'green' | 'orange' | 'gray';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'green'
              ? 'bg-[#DCFCE7] text-[#16A34A]'
              : badgeColor === 'orange'
              ? 'bg-[#FFEDD5] text-[#C2410C]'
              : 'bg-[#F1F5F9] text-[#64748B]'
          )}
        >
          {subLabel}
        </span>
      )}
    </div>
  );
}

export function StaffDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const disbursements = [
    { name: 'John Obinna', role: 'Store Manager', amt: '₦220,000', type: 'Auto' },
    { name: 'Fatima Bello', role: 'Sales Associate', amt: '₦150,000', type: 'Auto' },
    { name: 'Emeka Okafor', role: 'Logistics Clerk', amt: '₦180,000', type: 'Manual' },
  ];

  const activitySummary = [
    { name: 'John Obinna', role: 'Store Manager', sales: '₦1.2M', orders: '128' },
    { name: 'Fatima Bello', role: 'Sales Associate', sales: '₦980k', orders: '116' },
    { name: 'Emeka Okafor', role: 'Logistics Clerk', sales: '₦840k', orders: '102' },
    { name: 'Nneoma Okoro', role: 'Sales Associate', sales: '₦760k', orders: '94' },
    { name: 'Daniel Afolabi', role: 'Store Assistant', sales: '₦680k', orders: '86' },
  ];

  return (
    <div className="space-y-6 text-xs">
      {/* Period Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#F1F5F9] shadow-sm">
        <h2 className="text-sm font-bold text-[#0A0D14]">Report Period</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F8FAFC] px-3 py-2 rounded-xl border border-[#E2E8F0] text-[#334155] text-xs font-medium">
            <span>{period}</span>
            <Calendar size={14} className="text-[#64748B]" />
          </div>
          <button
            type="button"
            className="p-2 rounded-xl border border-[#E2E8F0] bg-white text-[#0055FF] hover:bg-[#EFF5FF] transition-colors cursor-pointer"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Payroll Cost" value="₦1.5M" />
        <StatCard label="Total Active Staff" value="15" />
        <StatCard label="Avg Hours/Week" value="42 hrs" subLabel="Optimal" badgeColor="green" />
        <StatCard label="Attendance Rate" value="94%" subLabel="Target 95%" badgeColor="orange" />
      </div>

      {/* Staff Disbursements */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0A0D14] px-1">Staff Disbursements</h3>
        <div className="space-y-2.5">
          {disbursements.map((s, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E2E8F0] shrink-0" />
                <div>
                  <p className="font-bold text-[#0A0D14] text-xs">{s.name}</p>
                  <p className="text-[11px] text-[#64748B]">{s.role}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-[#0A0D14] text-xs">{s.amt}</p>
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                    s.type === 'Auto' ? 'bg-[#EFF6FF] text-[#0055FF]' : 'bg-[#F1F5F9] text-[#64748B]'
                  )}
                >
                  {s.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Hours Trend (July) */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Weekly Hours trend (July)</h3>
          <div className="flex items-center gap-1 text-xs text-[#64748B]">
            <span>July 2026</span>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="h-44 flex items-end justify-between gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((wk) => (
            <div key={wk} className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-end gap-1.5 h-32 w-full justify-center">
                <div className="w-3.5 h-[80%] bg-[#80B3FF] rounded-md" />
                <div className="w-3.5 h-[95%] bg-[#0055FF] rounded-md" />
              </div>
              <span className="text-[10px] text-[#94A3B8]">Wk{wk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Summary Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Activity Summary</h3>
          <span className="font-bold text-[#0055FF] text-xs">Top 5</span>
        </div>
        <div className="divide-y divide-[#F1F5F9]">
          <div className="py-2 flex text-[#64748B] font-medium text-xs border-b border-[#F1F5F9]">
            <span className="flex-2">Staff</span>
            <span className="flex-1 text-right">Sales</span>
            <span className="flex-1 text-right">Orders</span>
          </div>
          {activitySummary.map((s, i) => (
            <div key={i} className="py-3 flex items-center text-xs">
              <div className="flex-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#E2E8F0] shrink-0" />
                <div>
                  <p className="font-bold text-[#0A0D14]">{s.name}</p>
                  <p className="text-[11px] text-[#64748B]">{s.role}</p>
                </div>
              </div>
              <span className="flex-1 text-right font-bold text-[#0A0D14]">{s.sales}</span>
              <span className="flex-1 text-right font-bold text-[#0A0D14]">{s.orders}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Per Employee */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-bold text-[#0A0D14]">Cost Per Employee</h3>
          <span className="font-bold text-[#0A0D14] text-xs">₦125,000 / month</span>
        </div>
        <div className="h-28 flex items-end justify-between px-4 gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full h-20 bg-[#0055FF] rounded-lg" />
            <span className="text-[10px] text-[#64748B]">Store Manager</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full h-14 bg-[#0055FF] rounded-lg" />
            <span className="text-[10px] text-[#64748B]">Sales Associate</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full h-10 bg-[#0055FF] rounded-lg" />
            <span className="text-[10px] text-[#64748B]">Logistics</span>
          </div>
        </div>
      </div>
    </div>
  );
}
