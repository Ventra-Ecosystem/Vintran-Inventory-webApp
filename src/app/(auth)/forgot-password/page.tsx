'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const value = (formData.get('identifier') as string)?.trim();

    if (!value) {
      handleApiError('Please enter your email or phone number.');
      setIsSubmitting(false);
      return;
    }

    setIdentifier(value);

    try {
      await authApi.forgotPassword({ identifier: value });
      handleApiSuccess('If an account exists, a reset code has been sent.');
      setSent(true);
    } catch (err) {
      handleApiError(err, { fallback: 'Failed to request password reset. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={`If an account exists for "${identifier}", we sent a password reset link and code to the associated contact.`}
      >
        <div className="flex flex-col items-center gap-6 mt-6">
          <p className="text-center text-sm text-neutral-500">
            Didn&apos;t receive it?{' '}
            <button
              type="button"
              className="font-medium text-brand hover:underline"
              onClick={() => setSent(false)}
            >
              Try again
            </button>
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(identifier)}`}
            className="w-full"
          >
            <Button fullWidth size="lg">
              Enter Reset Code
            </Button>
          </Link>
          <Link href="/login" className="font-medium text-brand text-sm hover:underline">
            Go back to Login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your registered email or phone number. A reset code will be sent to you."
    >
      <form onSubmit={handleSubmit} className="flex flex-col h-full justify-between">
        <Input
          label="Email or phone number"
          name="identifier"
          type="text"
          placeholder="Enter your email or phone number"
          required
        />

        <div className="mt-8">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Get Reset Code'}
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
