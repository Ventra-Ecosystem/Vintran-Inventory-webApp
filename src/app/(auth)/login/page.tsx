'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      // TODO: replace with real API call
      // const res = await api.post('/auth/login', payload)
      // const hasBusiness = res.data.user.hasBusiness

      const hasBusiness = false; // placeholder until backend is wired up

      router.push(hasBusiness ? '/dashboard' : '/no-business');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Log in"
      subtitle="Sign in to manage multi-branch inventory, track sales, and monitor debt."
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full justify-between"
      >
        <div className="space-y-2">
          <Input label="Email" name="email" type="email" required />
          <Input label="Password" name="password" type="password" required />

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <div>
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
          <p className="mt-4 text-center text-sm text-neutral-500">
            Are you a new user?{' '}
            <Link href="/register" className="font-medium text-brand">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
