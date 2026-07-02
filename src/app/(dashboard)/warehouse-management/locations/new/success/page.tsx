import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { LinkButton } from '@/src/components/ui/LinkButton';

export default function NewLocationSuccessPage() {
  return (
    <SuccessScreen
      title="Warehouse created"
      subtitle="Your new location has been added."
      primaryAction={
        <LinkButton
          href="/home/dashboard"
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
