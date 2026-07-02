import { ArrowdownIcon, IdeaIcon } from '@/src/assets/icon';
import { HomeSubTabs } from '@/src/components/dashboard/HomeSubTabs';
import { StatCard02 } from '@/src/components/ui/StatCard02';
import { ArrowDown, ArrowDown01 } from 'lucide-react';

export default function BusinessOverviewPage() {
  return (
    <main>
      <HomeSubTabs />

      <div className="bg-amber-lighter rounded-[8px] py-2 px-3 flex overflow-hidden">
        <div>
          <p className="text-black font-medium text-sm">Note</p>
          <p className="text-gray-700 font-normal text-sm">
            (XXXX) signifies you have no permission to view available
            information
          </p>
        </div>
        <div className="relative left-4">
          <IdeaIcon />
        </div>
      </div>

      <div className="my-4">
        <div className="flex justify-end">
          <div className="px-4 py-1.5 text-text-subtle rounded-[16px] bg-bg-surface text-xs flex w-fit">
            Today
            <ArrowdownIcon width={17} height={17} />
          </div>
        </div>

        <div className="">
          <p className="font-medium text-sm text-text-subtle mb-2">Sales</p>

          <div className="grid grid-cols-2 bg-bg-surface py-4 px-3 rounded-[16px] gap-2">
            <StatCard02 value="₦26,383" label="Total Sales" />
            <StatCard02 value="₦26,383" label="Total Sales" />
            <StatCard02 value="₦26,383" label="Total Sales" />
            <StatCard02 value="₦26,383" label="Total Sales" />
          </div>
        </div>

        <div className="mt-5">
          <p className="font-medium text-sm text-text-subtle mb-2">
            Income/Expense
          </p>

          <div className="grid grid-cols-2 bg-bg-surface py-4 px-3 rounded-[16px] gap-2">
            <StatCard02
              value="₦26,383"
              label="Total Sales"
              valueClassName="text-[#008360]"
            />
            <StatCard02
              value="₦26,383"
              label="Total Sales"
              valueClassName="text-[#B72B1E]"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="font-medium text-sm text-text-subtle mb-2">Debt Book</p>

          <div className="grid grid-cols-2 bg-bg-surface py-4 px-3 rounded-[16px] gap-2">
            <StatCard02
              value="₦26,383"
              label="Total Sales"
              valueClassName="text-[#B72B1E]"
            />
            <StatCard02
              value="₦26,383"
              label="Total Sales"
              valueClassName="text-[#008360]"
            />
          </div>
        </div>

        <div className="mt-5">
          <p className="font-medium text-sm text-text-subtle mb-2">Debt Book</p>

          <div className="grid grid-cols-2 bg-bg-surface py-4 px-3 rounded-[16px] gap-2">
            <StatCard02 value="₦26,383" label="Total Sales" />
            <StatCard02
              value="₦26,383,000"
              label="Total Sales"
              valueClassName="text-[#008360]"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
