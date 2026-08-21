'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { BackArrowIcon, NoticeIcon } from '@/src/assets/icon';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export default function NewLocationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    if (!name?.trim()) { toast.error('Warehouse name is required'); setIsSubmitting(false); return; }

    try {
      await locationsApi.createWarehouse({
        name: name.trim(),
        address: (fd.get('address') as string) || undefined,
        country: (fd.get('country') as string) || undefined,
        state: (fd.get('state') as string) || undefined,
        city: (fd.get('city') as string) || undefined,
        capacityNotes: (fd.get('notes') as string) || undefined,
        makePrimary: false,
      });
      toast.success('Warehouse created');
      router.push('/warehouse-management/locations/new/success');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="">
      <div className="flex gap-2">
        <button onClick={() => router.back()} className="p-1">
          <BackArrowIcon width={20} />
        </button>
        <h1 className="text-xl font-semibold text-neutral-900">
          Add new warehouse
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label="Warehouse name *"
          name="name"
          required
          placeholder="Enter warehouse name"
        />
        <Input
          label="Address line 1 *"
          name="address"
          required
          placeholder="Enter address"
        />

        <Input
          label="Address line 2"
          name="address2"
          placeholder="Enter address"
        />

        <Input
          label="Country *"
          name="country"
          required
          placeholder="Select Country"
        />

        <Input
          label="State *"
          name="state"
          required
          placeholder="Select state"
        />

        <Input label="City *" name="city" required placeholder="Select City" />

        <Input label="Capacity Notes" name="notes" placeholder="Notes..." />

        <div className="py-4 px-3.5 bg-bg-surface rounded-[10px] text-strong-950 font-medium text-sm flex gap-3">
          <NoticeIcon width={40} />{' '}
          <p>
            You can change any of these details and add more information in
            business settings
          </p>
        </div>
        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save New Warehouse'}
        </Button>
      </form>
    </main>
  );
}
