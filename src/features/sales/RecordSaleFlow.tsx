'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Minus, Trash2, ChevronRight } from 'lucide-react';
import { productsApi, locationsApi } from '@/src/lib/api/catalog';
import { customersApi, salesApi } from '@/src/lib/api/commerce';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { cn } from '@/src/lib/utils';

interface CartLine {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
}

type PaymentKind = 'Paid' | 'PartiallyPaid' | 'Debt';
type Channel = 'InStore' | 'Marketplace';

function fmt(n: number) {
  return `₦${n.toLocaleString()}`;
}

// ── Product Search & Cart ───────────────────────────────────────────────────

function ProductSearch({ onAdd }: { onAdd: (p: any, qty: number, price: number) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (!query) { setResults([]); return; }
    const t = setTimeout(() => {
      productsApi.list({ search: query })
        .then((res: any) => setResults(toArr(res.data)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  if (selected) {
    return (
      <div className="bg-bg-surface rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text-default">{selected.name}</p>
            <p className="text-xs text-text-muted">{selected.sku}</p>
          </div>
          <button type="button" onClick={() => { setSelected(null); setQuery(''); setQty(1); setPrice(''); }} className="text-xs text-text-muted">Change</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-text-default mb-1 block">Quantity</label>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Minus size={14} /></button>
              <span className="text-sm font-bold w-8 text-center">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><Plus size={14} /></button>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-text-default mb-1 block">Unit Price (₦)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full h-9 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>
        <Button
          fullWidth
          size="lg"
          type="button"
          disabled={!price || Number(price) <= 0}
          onClick={() => {
            onAdd(selected, qty, Number(price));
            setSelected(null);
            setQuery('');
            setQty(1);
            setPrice('');
          }}
        >
          Add to cart
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products by name or SKU…"
          className="w-full h-11 pl-9 pr-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-brand focus:outline-none"
        />
      </div>
      {results.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {results.slice(0, 6).map((p: any, idx: number) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setSelected(p); setResults([]); }}
              className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between ${idx < results.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div>
                <p className="text-sm font-semibold text-text-default">{p.name}</p>
                <p className="text-xs text-text-muted">{p.sku ?? 'No SKU'} · {p.category ?? '—'}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main RecordSaleFlow ─────────────────────────────────────────────────────

export function RecordSaleFlow() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [channel, setChannel] = useState<Channel>('InStore');
  const [locationId, setLocationId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [paymentKind, setPaymentKind] = useState<PaymentKind>('Paid');
  const [amountPaid, setAmountPaid] = useState('');
  const [debtDueDate, setDebtDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [saleNumber, setSaleNumber] = useState('');

  useEffect(() => {
    locationsApi.list().then((res: any) => setLocations(toArr(res.data))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!customerSearch) { setCustomers([]); return; }
    const t = setTimeout(() => {
      customersApi.list({ search: customerSearch })
        .then((res: any) => setCustomers(toArr(res.data)))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const addToCart = (product: any, qty: number, unitPrice: number) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) => l.productId === product.id ? { ...l, quantity: l.quantity + qty, unitPrice } : l);
      }
      return [...prev, { productId: product.id, productName: product.name, sku: product.sku ?? '', quantity: qty, unitPrice }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  };

  const total = cart.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error('Add at least one product'); return; }
    if (channel === 'InStore' && !locationId) { toast.error('Select a store location'); return; }
    if (paymentKind !== 'Paid' && !customerId) { toast.error('Link a customer for debt/partial payment'); return; }

    const paid = Number(amountPaid) || total;

    setSubmitting(true);
    try {
      const res: any = await salesApi.record({
        channel,
        locationId: locationId || undefined,
        customerId: customerId || undefined,
        lines: cart.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          unitCost: 0,
        })),
        deliveryCost: 0,
        paymentKind,
        amountPaid: paid,
        debtDueDate: debtDueDate || undefined,
      });
      setSaleNumber(res.data?.number ?? res.data?.id ?? '—');
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to record sale');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    setCart([]);
    setCustomerId('');
    setCustomerSearch('');
    setAmountPaid('');
    setDebtDueDate('');
    setPaymentKind('Paid');
  };

  return (
    <>
      <div className="space-y-5 pb-16">
        <p className="text-sm font-semibold text-text-default">Record a Sale</p>

        {/* Channel */}
        <div>
          <p className="text-xs font-semibold text-text-default mb-2">Channel</p>
          <div className="flex gap-2">
            {(['InStore', 'Marketplace'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={cn(
                  'flex-1 h-10 rounded-xl text-sm font-medium transition-colors',
                  channel === c ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {c === 'InStore' ? 'In-Store' : 'Marketplace'}
              </button>
            ))}
          </div>
        </div>

        {/* Store */}
        {channel === 'InStore' && (
          <div>
            <p className="text-xs font-semibold text-text-default mb-2">Store Location *</p>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-white"
            >
              <option value="">Select store</option>
              {locations.filter((l: any) => l.kind === 'Store' || l.kind === 'Both').map((l: any) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Products */}
        <div>
          <p className="text-xs font-semibold text-text-default mb-2">Add Products</p>
          <ProductSearch onAdd={addToCart} />
        </div>

        {/* Cart */}
        {cart.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-text-default mb-2">Cart ({cart.length})</p>
            <div className="bg-bg-surface rounded-xl overflow-hidden">
              {cart.map((line, idx) => (
                <div key={line.productId} className={`px-4 py-3 flex items-center gap-3 ${idx < cart.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-default truncate">{line.productName}</p>
                    <p className="text-xs text-text-muted">{line.quantity} × {fmt(line.unitPrice)}</p>
                  </div>
                  <p className="text-sm font-bold text-text-default shrink-0">{fmt(line.quantity * line.unitPrice)}</p>
                  <button type="button" onClick={() => removeFromCart(line.productId)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <div className="px-4 py-3 border-t border-[#9B9EA34D] flex justify-between">
                <p className="text-sm font-bold text-text-default">Total</p>
                <p className="text-sm font-bold text-brand">{fmt(total)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Customer (optional for Paid, required for Debt) */}
        <div>
          <p className="text-xs font-semibold text-text-default mb-2">Customer {paymentKind !== 'Paid' ? '*' : '(optional)'}</p>
          {customerId ? (
            <div className="flex items-center justify-between bg-brand-lighter rounded-xl px-4 py-2.5">
              <p className="text-sm font-semibold text-brand">{customerSearch}</p>
              <button type="button" onClick={() => { setCustomerId(''); setCustomerSearch(''); }} className="text-xs text-brand">Remove</button>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder="Search customers…"
                  className="w-full h-11 pl-9 pr-4 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:border-brand focus:outline-none"
                />
              </div>
              {customers.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {customers.slice(0, 5).map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setCustomerId(c.id); setCustomerSearch(`${c.firstName} ${c.lastName}`); setCustomers([]); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium">{c.firstName} {c.lastName}</span>
                      <span className="text-gray-400 ml-2 text-xs">{c.phoneNumber}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment */}
        <div>
          <p className="text-xs font-semibold text-text-default mb-2">Payment</p>
          <div className="flex gap-2">
            {(['Paid', 'PartiallyPaid', 'Debt'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setPaymentKind(k)}
                className={cn(
                  'flex-1 h-9 rounded-xl text-xs font-medium transition-colors',
                  paymentKind === k ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {k === 'PartiallyPaid' ? 'Partial' : k}
              </button>
            ))}
          </div>
        </div>

        {paymentKind === 'PartiallyPaid' && (
          <div>
            <label className="text-xs font-semibold text-text-default mb-1 block">Amount Paid (₦)</label>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        )}

        {(paymentKind === 'Debt' || paymentKind === 'PartiallyPaid') && (
          <div>
            <label className="text-xs font-semibold text-text-default mb-1 block">Debt Due Date (optional)</label>
            <input
              type="date"
              value={debtDueDate}
              onChange={(e) => setDebtDueDate(e.target.value)}
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        )}

        <Button fullWidth size="lg" disabled={cart.length === 0 || submitting} onClick={handleSubmit}>
          {submitting ? 'Recording…' : `Record Sale${total > 0 ? ` · ${fmt(total)}` : ''}`}
        </Button>
      </div>

      <Modal isOpen={showSuccess} onClose={handleDone}>
        <SuccessScreen
          standalone={false}
          title="Sale Recorded!"
          subtitle="The sale has been successfully recorded."
          details={[
            { label: 'Sale Number', value: saleNumber },
            { label: 'Total', value: fmt(total) },
            { label: 'Payment', value: paymentKind },
          ]}
          primaryAction={<Button fullWidth size="lg" onClick={handleDone}>Record another sale</Button>}
        />
      </Modal>
    </>
  );
}
