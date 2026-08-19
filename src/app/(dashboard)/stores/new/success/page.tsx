import { LinkButton } from '@/src/components/ui/LinkButton';
import { BgRotatingIcon, SuccessIcon } from '@/src/assets/icon';

export default function StoreCreatedSuccessPage() {
  return (
    <main className="flex h-full flex-1 flex-col justify-between overflow-hidden">
      <div className="relative flex flex-1 flex-col items-center  text-center">
        {/* Background decoration */}
        <BgRotatingIcon className="absolute inset-0 z-0 w-[120vw] left-[-10vw] animate-spin-slow" />

        {/* Foreground content */}
        <div className="relative z-10 flex flex-col mt-[20vh]">
          <SuccessIcon />

          <h1 className="mt-4 text-2xl font-semibold text-text-default">
            Store Created
          </h1>

          <p className="mt-2 text-sm text-text-default">
            Store successfully created
          </p>
        </div>
      </div>

      <div className="w-full pb-6">
        <LinkButton
          href="/dashboard"
          variant="primary"
          size="lg"
          fullWidth
        >
          Proceed to dashboard
        </LinkButton>
      </div>
    </main>
  );
}