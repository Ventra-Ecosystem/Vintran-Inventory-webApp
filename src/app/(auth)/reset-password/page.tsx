'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get('email') ?? '';
  const queryCode = searchParams.get('code') ?? '';

  const [email, setEmail] = useState(queryEmail);
  const [code, setCode] = useState(queryCode);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      handleApiError('Email address is required.');
      return;
    }

    if (!code.trim()) {
      handleApiError('Verification code is required.');
      return;
    }

    if (newPassword.length < 6) {
      handleApiError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      handleApiError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
        confirmPassword,
      });

      handleApiSuccess('Password reset successfully! Please log in with your new password.');
      router.push('/login');
    } catch (err) {
      handleApiError(err, { fallback: 'Failed to reset password. Please verify the code and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Set Up New Password" subtitle="Enter your reset code and choose a new password.">
      <form onSubmit={handleSubmit} className="flex flex-col justify-between h-full">
        <div className="space-y-4">
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Verification reset code"
            name="code"
            type="text"
            placeholder="Enter code from email/SMS"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <Input
            label="New password"
            name="newPassword"
            type="password"
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />

          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        <div className="mt-8">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting password…' : 'Reset password'}
          </Button>
          <p className="mt-6 text-center text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-brand hover:underline">
              Go back to Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-white text-neutral-500">
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
