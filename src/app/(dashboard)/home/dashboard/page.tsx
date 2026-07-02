import {
  ArrowleftdownIcon,
  MoneyIcon,
  PakageIcon,
  StoreIcon,
} from '@/src/assets/icon';
import { HomeSubTabs } from '@/src/components/dashboard/HomeSubTabs';
import { StatCard01 } from '@/src/components/ui/StatCard01';
import { TransactionItem } from '@/src/components/ui/TransactionItem';

export default function HomeDashboardPage() {
  return (
    <main>
      <HomeSubTabs />
      <div className="grid grid-cols-2 gap-3">
        <StatCard01
          icon={<MoneyIcon width={24} />}
          value="₦26,383"
          label="Today's Sales"
        />

        <StatCard01
          icon={<PakageIcon width={24} />}
          value="₦26,383"
          label="Today's Sales"
        />

        <StatCard01
          icon={<StoreIcon width={24} />}
          value="₦26,383"
          label="Today's Sales"
        />

        <StatCard01
          icon={<MoneyIcon width={24} />}
          value="₦26,383"
          label="Today's Sales"
        />
      </div>

      <div className="mt-6">
        <p className="font-medium text-sm text-text-subtle mb-4">Actions</p>

        <div className="grid grid-cols-2 gap-3">
          <StatCard01
            icon={<MoneyIcon width={24} />}
            value="Warehouse Set up"
            label="Set your warehouse"
            textSize="text-sm"
            textSize2="text-xs"
          />

          <StatCard01
            icon={<PakageIcon width={24} />}
            value="Add product"
            label="Add your first product"
            textSize="text-sm"
            textSize2="text-xs"
          />

          <StatCard01
            icon={<StoreIcon width={24} />}
            value="Record Sales"
            label="Record a sale"
            textSize="text-sm"
            textSize2="text-xs"
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="font-medium text-sm text-text-subtle mb-4">
          Recent activity
        </p>

        <div className="bg-bg-surface px-4 rounded-[8px]">
          <TransactionItem
            icon={<ArrowleftdownIcon />}
            title="Sale #0042"
            subtitle="Apr 14, 2026 10:24 AM"
            amount="₦392,000"
          />

          <TransactionItem
            icon={<ArrowleftdownIcon />}
            title="Sale #0042"
            subtitle="Apr 14, 2026 10:24 AM"
            amount="₦392,000"
          />

          <TransactionItem
            icon={<ArrowleftdownIcon />}
            title="Sale #0042"
            subtitle="Apr 14, 2026 10:24 AM"
            amount="₦392,000"
          />

          <TransactionItem
            icon={<ArrowleftdownIcon />}
            title="Sale #0042"
            subtitle="Apr 14, 2026 10:24 AM"
            amount="₦392,000"
          />

          <TransactionItem
            icon={<ArrowleftdownIcon />}
            title="Sale #0042"
            subtitle="Apr 14, 2026 10:24 AM"
            amount="₦392,000"
          />
        </div>
      </div>
    </main>
  );
}
