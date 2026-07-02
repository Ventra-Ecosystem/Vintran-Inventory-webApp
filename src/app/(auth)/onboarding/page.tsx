// src/app/(auth)/onboarding/page.tsx
import { OnboardingCarousel } from '@/src/components/onboarding/OnboardingCarousel';
import { LinkButton } from '@/src/components/ui/LinkButton';

const onboardingSlides = [
  {
    src: '/onboarding/image1.png',
    alt: 'Track your inventory in real time',
    content: (
      <>
        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">Every</h1>
          <p className="text-brand font-semibold text-4xl">product.</p>
        </span>

        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">Every</h1>
          <h1 className="text-brand font-semibold text-4xl">branch.</h1>
        </span>

        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">Every</h1>
          <h1 className="text-brand font-semibold text-4xl">sale.</h1>
        </span>
        <p className="mt-2 text-base font-medium text-text-subtle text-left">
          The inventory platform built for businesses serious about growing —
          without losing track.
        </p>
      </>
    ),
    imageClassName: 'object-[center_-100px]',
  },
  {
    src: '/onboarding/image2.png',
    alt: 'Manage stock across locations',
    content: (
      <>
        <span className="inline-flex">
          <h1 className="text-text-default font-semibold text-4xl inline text-left">
            Your
            <p className="text-brand font-semibold text-4xl inline"> stock</p>,
            always where you need it
          </h1>
        </span>
        <p className="mt-2 text-base text-text-subtle font-medium text-left">
          Add products, scan barcodes, move goods between branches, and get
          alerted before you run low or stock expires.
        </p>
      </>
    ),
    imageClassName: 'object-[center_-60px]',
  },
  {
    src: '/onboarding/image3.png',
    imageClassName: 'object-[center_-100px]',
    alt: 'Get insights on your sales',
    content: (
      <>
        <span className="inline-flex">
          <h1 className="text-text-default font-semibold text-4xl inline text-left">
            Know what you&apos;ve{' '}
            <p className="text-brand font-semibold text-4xl inline">earned</p>.
            Know what you&apos;re{' '}
            <p className="text-brand font-semibold text-4xl inline">owed</p>.
          </h1>
        </span>

        <p className="mt-2 text-base text-text-subtle font-medium text-left">
          Track daily profit, log every expense, and follow up on customer debt
          — all from a live dashboard that gives a real picture of your
          business.
        </p>
      </>
    ),
  },
  {
    src: '/onboarding/image5.png',
    alt: 'Get insights on your sales',
    content: (
      <>
        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">One</h1>
          <p className="text-brand font-semibold text-4xl">platform.</p>
        </span>

        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">Every</h1>
          <h1 className="text-text-default font-semibold text-4xl">branch.</h1>
        </span>

        <span className="flex-row flex gap-2">
          <h1 className="text-text-default font-semibold text-4xl">Every</h1>
          <h1 className="text-brand font-semibold text-4xl">role.</h1>
        </span>
        <p className="mt-2 text-base font-medium text-text-subtle text-left">
          Assign staff to outlets, set role-based permissions, track
          commissions, and review activity logs — whether you run one shop or
          ten.
        </p>
      </>
    ),
    imageClassName: 'object-contain px-padding object-center',
  },
];

export default function OnboardingPage() {
  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between overflow-hidden px-padding py-padding">
      {/* Decorative blurred blobs, behind everything */}
      <div className="absolute inset-0 z-0">
        <div className="absolute left-[70%] top-[0%] h-[196px] w-[196px] rounded-full bg-[#99BBFF] blur-[70px]" />
        <div className="absolute right-[70%] top-[20%] h-[196px] w-[196px] rounded-full bg-[#99BBFF] blur-[70px]" />
      </div>

      <div className="relative z-10 flex w-full max-w-md flex-1 items-center justify-center">
        <OnboardingCarousel slides={onboardingSlides} />
      </div>

      <div className="relative z-10 w-full space-y-3">
        <LinkButton href="/register" variant="primary" size="lg" fullWidth>
          Get Started
        </LinkButton>
        <LinkButton href="/login" variant="secondary" size="lg" fullWidth>
          Login
        </LinkButton>
      </div>
    </main>
  );
}
