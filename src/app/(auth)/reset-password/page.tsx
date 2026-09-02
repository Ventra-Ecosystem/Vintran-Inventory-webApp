'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { OtpInput } from '@/src/components/ui/OtpInput';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(queryEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);

  const PASSWORD_REQUIREMENTS: { label: string; test: (v: string) => boolean }[] = [
    { label: 'At least 8 characters',     test: (v) => v.length >= 8 },
    { label: 'One uppercase letter (A–Z)', test: (v) => /[A-Z]/.test(v) },
    { label: 'One lowercase letter (a–z)', test: (v) => /[a-z]/.test(v) },
    { label: 'One number (0–9)',           test: (v) => /[0-9]/.test(v) },
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordMismatch =
    newPassword.length > 0 && confirmPassword.length > 0 && newPassword !== confirmPassword;

  const canSubmit =
    email.trim() &&
    code.length === 6 &&
    newPassword.length >= 8 &&
    PASSWORD_REQUIREMENTS.every(({ test }) => test(newPassword)) &&
    newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;
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
    <AuthLayout
      title="Reset your password"
      subtitle={`Enter the 6-digit code sent to ${email || 'your email'} and choose a new password.`}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Show email input only if not pre-filled from URL */}
        {!queryEmail && (
          <Input
            label="Email address"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        {/* OTP boxes — matches mobile style */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-[#0A0D14]">Verification code</p>
          <OtpInput
            length={6}
            value={code}
            onChange={setCode}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1">
          <Input
            label="New password"
            type="password"
            placeholder="············"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onFocus={() => setNewPasswordFocused(true)}
            onBlur={() => setNewPasswordFocused(false)}
            required
          />
          {newPasswordFocused && newPassword.length > 0 && (() => {
            const next = PASSWORD_REQUIREMENTS.find(({ test }) => !test(newPassword));
            if (!next) return null;
            return (
              <div className="flex items-center gap-1.5 pl-1">
                <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] shrink-0 bg-red-50 text-red-500">✕</span>
                <span className="text-xs text-red-500">{next.label}</span>
              </div>
            );
          })()}
        </div>

        <Input
          label="Confirm new password"
          type="password"
          placeholder="Re-enter new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          error={passwordMismatch ? "Passwords don't match" : undefined}
        />

        <div className="pt-2 space-y-3">
          <Button type="submit" fullWidth size="lg" disabled={isSubmitting || !canSubmit}>
            {isSubmitting ? 'Resetting password…' : 'Reset password'}
          </Button>
          <p className="text-center text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-brand hover:underline">
              Back to Login
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
