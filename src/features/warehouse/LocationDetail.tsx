import {
  ArrowdownIcon,
  NoticeIcon,
  PakageIcon,
  StockIcon,
} from '@/src/assets/icon';
import { SegmentedTabs } from '@/src/components/ui/SegmentedTabs';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { ArrowLeft, SearchIcon } from 'lucide-react';
import { useState } from 'react';

interface LocationDetailProps {
  location: { id: string; name: string; address: string };
  onBack: () => void;
}

export function LocationDetail({ location, onBack }: LocationDetailProps) {
  const [stock, setStock] = useState('all');
  return (
    <div className="space-y-4">
      <div className="p-3 w-full rounded-[8px] border border-[#E2E4E9] flex justify-between text-text-subtle">
        <p className="text-sm font-semibold text-text-subtle">
          {location.name}
        </p>
        <ArrowdownIcon width={20} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard01
          value="247"
          label="Products"
          icon={<PakageIcon width={24} />}
        />

        <StatCard01
          value="2"
          label="Low stock"
          icon={<NoticeIcon width={24} />}
          iconBgClassName="bg-[#FFFDEA]"
        />

        <StatCard01
          value="₦4.2M"
          label="Out of stock"
          icon={<StockIcon width={24} />}
          iconBgClassName="bg-[#E6E8EB]"
        />
      </div>

      <div className="px-2 h-[50px] bg-bg-surface text-[#525866] rounded-[8px] text-sm font-normal flex items-center gap-4 my-6]">
        <SearchIcon size={20} />
        <input
          type="text"
          placeholder="Search products..."
          className="flex-1 flex h-full outline-0"
        />
      </div>

      <div>
        <SegmentedTabs
          options={[
            { value: 'all', label: 'All' },
            { value: 'lowStock', label: 'Low Stock' },
            { value: 'outOfStock', label: 'Out of Stock' },
          ]}
          value={stock}
          onChange={setStock}
        />
      </div>

      <div className="py-3 px-4 bg-bg-surface rounded-[8px] text-brand">
        <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
              <PakageIcon width={24} />
            </div>
            <div className="gap-1 flex flex-col">
              <p className="text-text-default font-semibold text-xs">
                Samsung Galaxy A54 64GB
              </p>
              <p className="text-text-muted font-medium text-[10px]">
                SKU-0041 · Smartphones
              </p>
            </div>
          </div>
          <div className="flex justify-between flex-col gap-3 items-end">
            <p className="text-text-default text-xs font-semibold">20</p>
            <div className="bg-[#CBF5E5] rounded-full h-[16.6px] font-semibold text-[#176448] text-[9.6px] flex items-center justify-center px-1.5">
              <p>Healthy</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
              <PakageIcon width={24} />
            </div>
            <div className="gap-1 flex flex-col">
              <p className="text-text-default font-semibold text-xs">
                Samsung Galaxy A54 64GB
              </p>
              <p className="text-text-muted font-medium text-[10px]">
                SKU-0041 · Smartphones
              </p>
            </div>
          </div>
          <div className="flex justify-between flex-col gap-3 items-end">
            <p className="text-text-default text-xs font-semibold">20</p>
            <div className="bg-[#CBF5E5] rounded-full h-[16.6px] font-semibold text-[#176448] text-[9.6px] flex items-center justify-center px-1.5">
              <p>Healthy</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
              <PakageIcon width={24} />
            </div>
            <div className="gap-1 flex flex-col">
              <p className="text-text-default font-semibold text-xs">
                Samsung Galaxy A54 64GB
              </p>
              <p className="text-text-muted font-medium text-[10px]">
                SKU-0041 · Smartphones
              </p>
            </div>
          </div>
          <div className="flex justify-between flex-col gap-3 items-end">
            <p className="text-text-default text-xs font-semibold">20</p>
            <div className="bg-[#CBF5E5] rounded-full h-[16.6px] font-semibold text-[#176448] text-[9.6px] flex items-center justify-center px-1.5">
              <p>Healthy</p>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center border-b border-[#9B9EA34D] py-2">
          <div className="flex gap-2 items-center">
            <div className="w-10 h-10 flex rounded-full justify-center items-center bg-brand-lighter">
              <PakageIcon width={24} />
            </div>
            <div className="gap-1 flex flex-col">
              <p className="text-text-default font-semibold text-xs">
                Samsung Galaxy A54 64GB
              </p>
              <p className="text-text-muted font-medium text-[10px]">
                SKU-0041 · Smartphones
              </p>
            </div>
          </div>
          <div className="flex justify-between flex-col gap-3 items-end">
            <p className="text-text-default text-xs font-semibold">20</p>
            <div className="bg-[#CBF5E5] rounded-full h-[16.6px] font-semibold text-[#176448] text-[9.6px] flex items-center justify-center px-1.5">
              <p>Healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
