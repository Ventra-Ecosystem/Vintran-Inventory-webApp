'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { HelpIcon } from '@/src/assets/icon';

export default function NewStorePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      storeName: formData.get('storeName'),
      address: formData.get('address'),
      phoneNumber: formData.get('phoneNumber'),
    };

    try {
      // TODO: replace with real API call
      console.log('create store payload', payload);
      router.push('/stores/new/success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-default">
            Create new store
          </h1>
          <p className="text-text-subtle text-sm font-normal">
            Add a new store under your business
          </p>
        </div>

        <div className="bg-bg-surface w-10 h-10 flex items-center justify-center rounded-full">
          <HelpIcon />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Input
          label="Store name"
          name="storeName"
          placeholder="Enter store name"
          required
        />
        <Input
          label="Address"
          name="address"
          placeholder="Store address"
          required
        />

        <Input
          label="Category"
          name="category"
          placeholder="Select category"
          required
        />
        <Input
          label="Currency"
          name="currency"
          placeholder="Nigerian naira"
          disabled
          value={'NGN'}
        />

        <Input
          label="Country"
          name="country"
          placeholder="Select Country"
          required
        />

        <Input label="State" name="state" placeholder="Select state" required />
        <Input label="City" name="city" placeholder="Select city" required />

        <div className="pt-5">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating store…' : 'Create new store'}
          </Button>
        </div>
      </form>
    </main>
  );
}
