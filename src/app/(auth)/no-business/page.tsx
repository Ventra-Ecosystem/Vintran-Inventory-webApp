// src/app/(dashboard)/no-business/page.tsx
import { ClipboardIcon, PlusIcon } from '@/src/assets/icon';
import { LinkButton } from '@/src/components/ui/LinkButton';

export default function NoBusinessPage() {
  return (
    <main className="h-screen w-screen flex px-padding py-6">
      <div className="max-w-sm flex flex-col justify-between">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-xl font-semibold text-text-default mb-5">
            My Business
          </h1>
          <ClipboardIcon />
          <p className="mt-2 text-base font-medium text-text-subtle text-center">
            You do not have any business set up, tap the button below to create
            a new business
          </p>
        </div>
        <div className="mt-8">
          <LinkButton href="/create-business" size="lg" fullWidth>
            Create new business{' '}
            <div className="ml-2">
              <PlusIcon />
            </div>
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
