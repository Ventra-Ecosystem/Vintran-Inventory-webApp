'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { OtpInput } from '@/src/components/ui/OtpInput';
import { Button } from '@/src/components/ui/Button';
import { authApi } from '@/src/lib/api/auth';
import { useAuthStore } from '@/src/store/authStore';
import { handleApiError, handleApiSuccess } from '@/src/lib/utils/error-handler';

export default function Verify2FaPage() {
  const router = useRouter();
  const { verifyToken, setTokens } = useAuthStore();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(300);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleVerify = async (otpCode: string) => {
    if (!verifyToken) {
      handleApiError('Verification token missing. Please log in again.');
      router.push('/login');
      return;
    }

    if (otpCode.length < 6) {
      handleApiError('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authApi.verify2FA({
        verifyToken,
        code: otpCode,
      });

      setTokens(res.data);
      handleApiSuccess('Two-factor authentication verified successfully!');

      const destination = res.data.hasBusiness ? '/dashboard' : '/create-business';
      router.push(destination);
    } catch (err) {
      handleApiError(err, { fallback: '2FA verification failed. Please check the code.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!verifyToken || countdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await authApi.resendVerifyOtp({ verifyToken });
      handleApiSuccess('A new 2FA verification code has been sent to your email.');
      setCountdown(300);
    } catch (err) {
      handleApiError(err, { fallback: 'Failed to resend 2FA code. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthLayout
      title="Two-Factor Authentication"
      subtitle="Enter the 6-digit verification code sent to your registered device or email."
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
                <span className="font-medium text-neutral-900">
                  {`${Math.floor(countdown / 60).toString().padStart(2, '0')}:${(countdown % 60).toString().padStart(2, '0')}`}
                </span>
              </>
            ) : (
              <>
                Didn&apos;t receive code?{' '}
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResend}
                  className="font-medium text-brand hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {isResending ? 'Sending…' : 'Resend OTP'}
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
            {isSubmitting ? 'Verifying…' : 'Verify & Continue'}
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
