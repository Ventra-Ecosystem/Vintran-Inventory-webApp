'use client';

import { useState } from 'react';
import { Link2, X, AlertCircle } from 'lucide-react';
import { marketplaceApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { Button } from '@/src/components/ui/Button';
import { PakageIcon } from '@/src/assets/icon';

interface Props {
  listing: any;
  productName: string;
  productSku: string;
  channels: any[];
  onClose: () => void;
  onRefresh: () => void;
}

export function ListedProductSheet({ listing, productName, productSku, channels, onClose, onRefresh }: Props) {
  const [qty, setQty] = useState(String(listing.listedQuantity ?? listing.quantity ?? ''));
  const [vintranLink, setVintranLink] = useState('');
  const [showLinkSheet, setShowLinkSheet] = useState(false);
  const [busy, setBusy] = useState(false);

  const listingChannels = channels.filter((c: any) => (listing.channelIds ?? []).includes(c.id));
  const isActive = listing.status === 'Active';

  const doAction = async (action: () => Promise<any>, successMsg: string) => {
    setBusy(true);
    try { await action(); toast.success(successMsg); onClose(); onRefresh(); }
    catch (err) { toast.error(err instanceof ApiError ? err.description : 'Failed'); }
    finally { setBusy(false); }
  };

  const handleUpdateQty = () => {
    const n = Number(qty);
    if (!n || n === (listing.listedQuantity ?? listing.quantity)) return;
    doAction(() => marketplaceApi.updateQuantity(listing.id, { newQuantity: n }), 'Quantity updated');
  };

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm" />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-xl overflow-y-auto max-h-[90vh] sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[440px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none sm:max-h-none">
        <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />
        <p className="text-base font-bold text-[#0A0D14] mb-4">Listed product</p>

        {/* Product card */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-lighter flex items-center justify-center shrink-0">
            <PakageIcon width={20} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#0A0D14]">{productName}</p>
            <p className="text-xs text-text-muted">{productSku}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Quantity */}
          <div>
            <p className="text-sm font-semibold text-[#0A0D14] mb-2">Quantity</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="flex-1 h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none bg-[#F8FAFC]"
              />
              <button
                type="button"
                onClick={handleUpdateQty}
                disabled={!qty || Number(qty) === (listing.listedQuantity ?? listing.quantity) || busy}
                className="px-4 rounded-[10px] bg-brand text-white text-sm font-semibold disabled:opacity-50"
              >
                Update
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">Min order qty: {listing.minimumOrderQuantity ?? 1}</p>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-sm font-semibold text-[#0A0D14] mb-2">Pricing</p>
            <div className="bg-[#F8FAFC] rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between mb-1">
                <p className="text-sm text-text-muted">Effective price</p>
                <p className="text-sm font-bold text-[#0A0D14]">₦{(listing.effectivePrice ?? 0).toLocaleString()}</p>
              </div>
              <p className="text-xs text-text-muted">
                {listing.tracksStorePrice ? 'Tracks in-store price automatically' : 'Custom marketplace price'}
              </p>
            </div>
          </div>

          {/* Channels */}
          {listingChannels.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-[#0A0D14] mb-2">Published to</p>
              <div className="flex flex-wrap gap-2">
                {listingChannels.map((c: any) => (
                  <span key={c.id} className="bg-brand-lighter text-brand text-xs font-medium px-3 py-1.5 rounded-full">{c.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Vintran Link */}
          <button type="button" onClick={() => setShowLinkSheet(true)} className="flex items-center gap-2 text-sm font-semibold text-brand">
            <Link2 size={14} /> Attach Vintran Link
          </button>

          {/* Pause / Resume */}
          <button
            type="button"
            disabled={busy}
            onClick={() => doAction(
              () => isActive ? marketplaceApi.pause(listing.id) : marketplaceApi.resume(listing.id),
              isActive ? 'Listing paused' : 'Listing resumed'
            )}
            className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50"
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>

          {/* Delist */}
          <button
            type="button"
            disabled={busy}
            onClick={() => doAction(() => marketplaceApi.delete(listing.id), 'Listing removed')}
            className="w-full h-12 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm disabled:opacity-50"
          >
            De-list Product
          </button>
        </div>
      </div>

      {/* Vintran Link Sheet */}
      {showLinkSheet && (
        <>
          <div onClick={() => setShowLinkSheet(false)} className="fixed inset-0 z-50 bg-black/25" />
          <div className="fixed bottom-0 left-0 right-0 z-[60] bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-xl">
            <p className="text-base font-bold text-[#0A0D14] mb-4">Attach Vintran Link</p>
            <div className="flex items-start gap-3 bg-brand-lighter rounded-xl px-3.5 py-3 mb-4">
              <AlertCircle size={16} className="text-brand shrink-0 mt-0.5" />
              <p className="text-xs text-brand leading-relaxed">Enter the Vintran Link contract reference for this listing. Buyers can choose to apply it at checkout.</p>
            </div>
            <input
              value={vintranLink}
              onChange={e => setVintranLink(e.target.value)}
              placeholder="Vintran Link reference"
              className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none mb-4"
            />
            <button
              type="button"
              disabled={!vintranLink.trim() || busy}
              onClick={() => doAction(
                () => marketplaceApi.attachVintranLink(listing.id, { link: vintranLink.trim() }),
                'Vintran Link attached'
              )}
              className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50"
            >
              Attach
            </button>
          </div>
        </>
      )}
    </>
  );
}
