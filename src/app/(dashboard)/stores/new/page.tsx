'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { HelpIcon } from '@/src/assets/icon';
import { locationsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export default function NewStorePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get('storeName') as string;
    if (!name?.trim()) { toast.error('Store name is required'); setIsSubmitting(false); return; }

    try {
      await locationsApi.createStore({
        name: name.trim(),
        address: (fd.get('address') as string) || undefined,
        country: (fd.get('country') as string) || undefined,
        state: (fd.get('state') as string) || undefined,
        city: (fd.get('city') as string) || undefined,
        actsAsWarehouse: false,
      });
      toast.success('Store created');
      router.push('/stores');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-default">Create new store</h1>
          <p className="text-text-subtle text-sm font-normal">Add a new store under your business</p>
        </div>
        <div className="bg-bg-surface w-10 h-10 flex items-center justify-center rounded-full">
          <HelpIcon />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input label="Store name" name="storeName" placeholder="Enter store name" required />
        <Input label="Address" name="address" placeholder="Store address" />
        <Input label="Country" name="country" placeholder="e.g. Nigeria" />
        <Input label="State" name="state" placeholder="e.g. Lagos" />
        <Input label="City" name="city" placeholder="e.g. Ikeja" />
        <Input label="Currency" name="currency" placeholder="Nigerian naira" disabled value="NGN" />
        <div className="pt-5">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating store…' : 'Create new store'}
          </Button>
        </div>
      </form>
    </main>
  );
}
