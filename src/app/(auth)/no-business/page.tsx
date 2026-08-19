'use client';

import { ClipboardIcon, PlusIcon } from '@/src/assets/icon';
import { LinkButton } from '@/src/components/ui/LinkButton';
import { Button } from '@/src/components/ui/Button';
import { useAuthStore } from '@/src/store/authStore';

export default function NoBusinessPage() {
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center px-padding py-6 bg-white">
      <div className="max-w-sm w-full flex flex-col justify-between h-auto py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-xl font-semibold text-text-default mb-2">
            No Business Registered
          </h1>
          <div className="p-4 bg-neutral-50 rounded-2xl">
            <ClipboardIcon />
          </div>
          <p className="mt-2 text-base font-medium text-text-subtle text-center">
            You do not have any business set up on your account yet. Create a new business to start tracking inventory and sales.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <LinkButton href="/create-business" size="lg" fullWidth>
            Create new business{' '}
            <div className="ml-2">
              <PlusIcon />
            </div>
          </LinkButton>

          <Button variant="secondary" fullWidth onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </div>
    </main>
  );
}
