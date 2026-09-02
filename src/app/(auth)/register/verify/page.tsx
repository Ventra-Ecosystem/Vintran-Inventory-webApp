'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { OtpInput } from '@/src/components/ui/OtpInput';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

const COUNTDOWN_SECONDS = 5 * 60;

function formatCountdown(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function RegisterVerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const { setTokens } = useAuthStore();

  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(COUNTDOWN_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    startCountdown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Mirrors mobile exactly: POST { email, code } → receives AuthTokens → setTokens → route
  const handleVerify = async (otpCode: string) => {
    if (!email || otpCode.length < 6) return;
    setIsSubmitting(true);
    try {
      const res = await authApi.verifyEmail({ email, code: otpCode });
      setTokens(res.data);
      handleApiSuccess('Email verified!');
      router.push(res.data.hasBusiness ? '/dashboard' : '/create-business');
    } catch (err) {
      handleApiError(err, { fallback: 'Verification failed. Please check your code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authApi.resendOtp({ email, purpose: 'EmailVerification' });
      handleApiSuccess('A new code has been sent to your email.');
      setCode('');
      startCountdown();
    } catch (err) {
      handleApiError(err, { fallback: 'Could not resend code.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email || 'your email address'}.`}
    >
      <div className="flex flex-col h-full justify-between py-2">
        <div className="space-y-6 flex flex-col items-center">
          <OtpInput
            length={6}
            value={code}
            onChange={setCode}
            onComplete={(c) => handleVerify(c)}
            disabled={isSubmitting}
          />

          <div className="text-center text-sm text-neutral-500">
            {countdown > 0 ? (
              <>
                Resend code in{' '}
                <span className="font-medium text-neutral-900">{formatCountdown(countdown)}</span>
              </>
            ) : (
              <>
                Didn&apos;t receive a code?{' '}
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResend}
                  className="font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {isResending ? 'Sending…' : 'Resend'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Button
            type="button"
            fullWidth
            size="lg"
            disabled={isSubmitting || code.length < 6}
            onClick={() => handleVerify(code)}
          >
            {isSubmitting ? 'Verifying…' : 'Verify Email'}
          </Button>

          <p className="text-center text-sm text-neutral-500">
            <Link href="/login" className="font-medium text-brand hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

export default function RegisterVerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-white text-neutral-500">
        Loading...
      </div>
    }>
      <RegisterVerifyForm />
    </Suspense>
  );
}
