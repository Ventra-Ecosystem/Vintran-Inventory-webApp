import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { LinkButton } from '@/src/components/ui/LinkButton';

export default function StoreCreatedSuccessPage() {
  return (
    <SuccessScreen
      title="Store Created"
      subtitle="Store successfully created and ready for operations."
      primaryAction={
        <LinkButton
          href="/dashboard"
          variant="primary"
          size="lg"
          fullWidth
        >
          Proceed to dashboard
        </LinkButton>
      }
    />
  );
}