'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      // TODO: replace with real API cal — send OTP/reset code to email
      console.log('send reset code to', email);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your registered email, a password reset link will be sent to your mail and phone number"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col h-full justify-between"
      >
        <Input
          label="Email or phone number"
          name="email"
          type="email"
          placeholder="Enter email or phone number"
          required
        />

        <div>
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Get Link'}
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
