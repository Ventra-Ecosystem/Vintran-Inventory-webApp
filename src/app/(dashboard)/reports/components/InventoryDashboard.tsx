'use client';

import { useState } from 'react';
import { cn } from '@/src/lib/utils';
import { Calendar, Download, ArrowUp, ArrowDown } from 'lucide-react';

function StatCard({
  label,
  value,
  subLabel,
  badgeColor = 'gray',
}: {
  label: string;
  value: string;
  subLabel?: string;
  badgeColor?: 'orange' | 'red' | 'gray';
}) {
  return (
    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl p-4 space-y-2">
      <span className="text-xs font-medium text-[#64748B]">{label}</span>
      <p className="text-xl font-bold text-[#0A0D14]">{value}</p>
      {subLabel && (
        <span
          className={cn(
            'inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold',
            badgeColor === 'red'
              ? 'bg-[#FEE2E2] text-[#EF4444]'
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

export function InventoryDashboard() {
  const [period, setPeriod] = useState('Jul 1 - Jul 31, 2026');

  const criticalItems = [
    {
      name: 'Dangote Sugar 1kg',
      threshold: '50 units',
      loc1: 'Ikeja Central',
      qty1: 23,
      stat1: 'Warning',
      loc2: 'Odeku Store',
      qty2: 0,
      stat2: 'Out of stock',
    },
    {
      name: 'Golden Penny Flour',
      threshold: '100 units',
      loc1: 'Ikeja Central',
      qty1: 23,
      stat1: 'Warning',
    },
    {
      name: 'Peak Milk Powder 400g',
      threshold: '100 units',
      loc1: 'Ikeja Central',
      qty1: 0,
      stat1: 'Out of stock',
    },
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
        <StatCard label="Total SKUs" value="956" />
        <StatCard label="Stock Value" value="₦14.7M" />
        <StatCard label="Low Stock Alerts" value="29 items" subLabel="Critical" badgeColor="orange" />
        <StatCard label="Dead Stock" value="11 items" subLabel="Action Needed" badgeColor="red" />
      </div>

      {/* Monthly Stock Movements */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Monthly Stock Movements</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <ArrowUp size={16} className="text-[#16A34A]" />
              <span>Stock In</span>
            </div>
            <p className="text-base font-bold text-[#0A0D14]">+3,200 pcs</p>
          </div>
          <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <ArrowDown size={16} className="text-[#EF4444]" />
              <span>Stock Out</span>
            </div>
            <p className="text-base font-bold text-[#0A0D14]">-8,432 pcs</p>
          </div>
        </div>
        <div className="flex justify-between text-xs pt-1 px-1">
          <span className="text-[#64748B]">Adjustments: -45 pcs</span>
          <span className="text-[#D97706] font-medium">Write-offs: -12 pcs</span>
        </div>
      </div>

      {/* Stock Turnover Comparison */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Stock Turnover Comparison</h3>
        <div className="divide-y divide-[#F1F5F9] space-y-3">
          <div className="flex justify-between items-center pt-2">
            <div>
              <p className="font-semibold text-[#0A0D14]">Turnover Rate</p>
              <p className="text-[11px] text-[#94A3B8]">This month vs last month</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#0A0D14]">4.2x</p>
              <p className="text-xs font-semibold text-[#16A34A]">+10.5%</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3">
            <div>
              <p className="font-semibold text-[#0A0D14]">Stock Value</p>
              <p className="text-[11px] text-[#94A3B8]">This month vs last month</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#0A0D14]">₦8.5M</p>
              <p className="text-xs font-semibold text-[#16A34A]">-6.6%</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-3">
            <div>
              <p className="font-semibold text-[#0A0D14]">Shrinkage</p>
              <p className="text-[11px] text-[#94A3B8]">This month vs last month</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#0A0D14]">₦45,000</p>
              <p className="text-xs font-semibold text-[#16A34A]">-27.4%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Low Stock */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Critical Low Stock</h3>
        <div className="space-y-3">
          {criticalItems.map((item, idx) => (
            <div key={idx} className="border border-[#E2E8F0] rounded-xl p-4 space-y-3">
              <div>
                <p className="font-bold text-[#0A0D14] text-xs">{item.name}</p>
                <p className="text-[11px] text-[#94A3B8]">Threshold: {item.threshold}</p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#0A0D14]">{item.loc1}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#0A0D14]">{item.qty1}</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                      item.stat1 === 'Out of stock'
                        ? 'bg-[#FEE2E2] text-[#EF4444]'
                        : 'bg-[#FFEDD5] text-[#C2410C]'
                    )}
                  >
                    {item.stat1}
                  </span>
                </div>
              </div>

              {item.loc2 && (
                <div className="flex justify-between items-center border-t border-[#F1F5F9] pt-2">
                  <span className="text-[#0A0D14]">{item.loc2}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#0A0D14]">{item.qty2}</span>
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        item.stat2 === 'Out of stock'
                          ? 'bg-[#FEE2E2] text-[#EF4444]'
                          : 'bg-[#FFEDD5] text-[#C2410C]'
                      )}
                    >
                      {item.stat2}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Stock Movement Flow */}
      <div className="bg-white rounded-2xl p-5 border border-[#F1F5F9] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#0A0D14]">Stock Movement Flow</h3>
        <div className="bg-[#F8FAFC] rounded-xl p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-bold text-[#0A0D14]">Inflow</h4>
            <div className="flex justify-between text-[#64748B]">
              <span>Purchases</span>
              <span className="font-bold text-[#0A0D14]">3,200 units</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Returns</span>
              <span className="font-bold text-[#0A0D14]">143 units</span>
            </div>
          </div>

          <div className="text-center py-4 border-y border-[#E2E8F0] space-y-1">
            <p className="text-xs text-[#0A0D14] font-medium">Current Stock</p>
            <p className="text-xl font-bold text-[#0A0D14]">1,247 units</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-[#0A0D14]">Outflow</h4>
            <div className="flex justify-between text-[#64748B]">
              <span>Sales</span>
              <span className="font-bold text-[#0A0D14]">8,432 units</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Write-offs</span>
              <span className="font-bold text-[#0A0D14]">12 units</span>
            </div>
            <div className="flex justify-between text-[#64748B]">
              <span>Adjustments</span>
              <span className="font-bold text-[#0A0D14]">-45 units</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
