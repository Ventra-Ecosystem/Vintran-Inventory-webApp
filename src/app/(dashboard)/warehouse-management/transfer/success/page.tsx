
'use client'

import { useRouter } from 'next/navigation'
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen'
import { Button } from '@/src/components/ui/Button'
import { LinkButton } from '@/src/components/ui/LinkButton'
import { useReceiptStore } from '@/src/store/receiptStore'

export default function TransferSuccessPage() {
  const router = useRouter()
  const lastTransfer = useReceiptStore((s) => s.lastTransfer)

  const details = lastTransfer
    ? Object.entries(lastTransfer).map(([label, value]) => ({ label, value }))
    : []

  return (
    <SuccessScreen
      title="Transfer successful"
      subtitle="Stock has been moved between locations."
      details={details}
      primaryAction={
        <Button fullWidth size="lg" onClick={() => router.push('/warehouse-management')}>
          Make another transfer
        </Button>
      }
      secondaryAction={
        <LinkButton href="/dashboard" variant="secondary" size="lg" fullWidth>
          Proceed to dashboard
        </LinkButton>
      }
    />
  )
}