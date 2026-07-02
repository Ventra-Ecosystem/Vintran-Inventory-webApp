'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      code: formData.get('code'), // TODO: placeholder — confirm actual verification method with backend
      newPassword: formData.get('newPassword'),
    };

    try {
      // TODO: replace with real API call
      console.log('reset password payload', payload);
      router.push('/login');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set Up New Password">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between h-full"
      >
        <div className="space-y-4">
          <Input
            label="New password"
            name="newPassword"
            type="password"
            placeholder="• • • • • • • • • "
            required
            minLength={8}
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="• • • • • • • • • • "
            required
            minLength={8}
          />
        </div>

        <div>
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting…' : 'Reset password'}
          </Button>

          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-brand">
              Go back to Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
