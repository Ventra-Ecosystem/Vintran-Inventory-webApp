import { SupplierChat } from '../SupplierChat';
import type { Supplier } from '../types';

const selfAsSupplier: Supplier = {
  id: 'self',
  name: 'My supply messages',
  contact: '',
  phone: '',
  email: '',
  address: '',
  category: '',
};

export function SupplyMessagesTab() {
  return (
    <div className="py-8 text-center">
      <p className="text-sm text-text-subtle">No messages yet.</p>
    </div>
  );
}
