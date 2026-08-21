'use client';

import { useEffect, useState } from 'react';
import { MoreVertical, Copy, Trash2, Edit } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { PakageIcon, WareHouseIcon, StoreIcon } from '@/src/assets/icon';
import { productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

interface ProductDetailProps {
  product: { id: string; [key: string]: any };
  onEdit: () => void;
  onDeleted?: () => void;
}

const MOVEMENT_KIND_LABEL: Record<string, string> = {
  Receipt: 'Stock received',
  Adjustment: 'Stock adjusted',
  TransferOut: 'Transferred out',
  TransferIn: 'Transferred in',
  B2BShipment: 'B2B shipment',
  Sale: 'Sold',
  Spoilage: 'Spoilage',
  Return: 'Return',
};

export function ProductDetail({ product: initialProduct, onEdit, onDeleted }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'Details' | 'Stock Levels'>('Details');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Full product data (we may only receive { id } from the stack so we fetch the full record)
  const [product, setProduct] = useState<any>(initialProduct);
  const [loadingProduct, setLoadingProduct] = useState(!initialProduct.name);
  const [stockData, setStockData] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);

  const productId = initialProduct.id;

  useEffect(() => {
    if (!productId) return;

    // Fetch full product if we only have the id stub
    if (!initialProduct.name) {
      setLoadingProduct(true);
      productsApi.get(productId)
        .then((res: any) => setProduct(res.data ?? initialProduct))
        .catch(() => {})
        .finally(() => setLoadingProduct(false));
    }

    productsApi.getStock(productId)
      .then((res: any) => setStockData(res.data ?? null))
      .catch(() => {});

    productsApi.getMovements(productId, { limit: 20 })
      .then((res: any) => setMovements(toArr(res.data)))
      .catch(() => {});
  }, [productId]);

  const copySku = () => {
    if (product.sku) {
      navigator.clipboard.writeText(product.sku);
      toast.success('SKU copied to clipboard');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await productsApi.update(productId, { isDeleted: true }); // soft-delete via patch if available
      setDeleteSuccess(true);
    } catch (err: any) {
      // If the API doesn't support soft-delete via patch, surface the error
      toast.error(err instanceof ApiError ? err.description : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const fmtCost = product.costPrice != null ? `₦${Number(product.costPrice).toLocaleString()}` : '—';

  // Handle both API shapes: { totalOwned, locations } and { totalQuantity, byLocation }
  const totalOwned =
    stockData?.totalOwned ??
    stockData?.totalQuantity ??
    product.stock ??
    0;
  const locationList: any[] = toArr(stockData?.locations ?? stockData?.byLocation);
  const warehouseLocations = locationList.filter((l: any) => l.kind === 'Warehouse' || l.locationType === 'Warehouse');
  const storeLocations = locationList.filter((l: any) => l.kind === 'Store' || l.locationType === 'Store');
  const inWarehouse = warehouseLocations.reduce((s: number, l: any) => s + (l.quantity ?? l.availableQuantity ?? 0), 0);
  const inStore = storeLocations.reduce((s: number, l: any) => s + (l.quantity ?? l.availableQuantity ?? 0), 0);

  if (loadingProduct) {
    return (
      <div className="text-center py-16 text-text-muted text-sm">Loading product details…</div>
    );
  }

  if (deleteSuccess) {
    return (
      <SuccessScreen
        standalone={false}
        title="Product deleted"
        subtitle="The product has been removed from your catalogue."
        primaryAction={
          <Button fullWidth size="lg" onClick={() => onDeleted?.()}>
            Back to catalogue
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-5 pb-16">
      {/* ── Product Header Card ── */}
      <div className="bg-[#F8FAFC] rounded-2xl p-4 flex justify-between items-center border border-gray-100">
        <div className="flex gap-3 items-center min-w-0 flex-1">
          <div className="w-11 h-11 rounded-xl bg-brand-lighter flex items-center justify-center shrink-0">
            <PakageIcon width={22} className="text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0A0D14] truncate">{product.name}</p>
            <p className="text-xs text-text-muted mt-0.5 truncate">
              {product.sku ?? 'No SKU'} · {product.category ?? '—'}
              {product.subcategory ? ` / ${product.subcategory}` : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Product options"
          className="p-1.5 hover:bg-gray-200/60 rounded-lg text-[#0A0D14] cursor-pointer transition-colors shrink-0"
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* ── Segmented Tabs ── */}
      <div className="flex bg-[#F8FAFC] p-1 rounded-2xl border border-gray-100">
        {(['Details', 'Stock Levels'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === t ? 'bg-brand text-white shadow-sm' : 'text-text-subtle hover:text-[#0A0D14]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── DETAILS TAB ── */}
      {activeTab === 'Details' && (
        <div className="space-y-4">
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-bold text-[#0A0D14] mb-1">Product Details</p>
            <div className="divide-y divide-gray-100">
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">SKU / Code</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#0A0D14]">{product.sku ?? '—'}</span>
                  {product.sku && (
                    <button type="button" onClick={copySku} className="text-brand p-1 hover:bg-blue-100 rounded cursor-pointer">
                      <Copy size={13} />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">Category</span>
                <span className="text-xs font-semibold text-[#0A0D14]">{product.category ?? '—'}</span>
              </div>
              {product.subcategory && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-text-subtle font-medium">Subcategory</span>
                  <span className="text-xs font-semibold text-[#0A0D14]">{product.subcategory}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">Unit of Measure</span>
                <span className="text-xs font-semibold text-[#0A0D14]">{product.unitOfMeasure ?? 'unit'}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">Cost Price</span>
                <span className="text-xs font-semibold text-[#0A0D14]">{fmtCost}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">Low Stock Threshold</span>
                <span className="text-xs font-semibold text-[#0A0D14]">{product.lowStockThreshold ?? 0} units</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xs text-text-subtle font-medium">Sales Channel</span>
                <span className="text-xs font-semibold text-[#0A0D14]">{product.channels ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* Movement History */}
          <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
            <p className="text-sm font-bold text-[#0A0D14] mb-3">Stock Movement History</p>
            {movements.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No movement history recorded yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {movements.map((m: any, i: number) => (
                  <div key={m.id ?? i} className="flex justify-between items-center py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-[#0A0D14]">
                        {MOVEMENT_KIND_LABEL[m.kind] ?? m.kind ?? m.movementType ?? '—'}
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">
                        {m.occurredOnUtc ? new Date(m.occurredOnUtc).toLocaleString() : '—'}
                        {m.locationName ? ` · ${m.locationName}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-bold ${(m.quantityDelta ?? m.quantity ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {(m.quantityDelta ?? m.quantity ?? 0) >= 0 ? '+' : ''}
                      {m.quantityDelta ?? m.quantity ?? 0} units
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STOCK LEVELS TAB ── */}
      {activeTab === 'Stock Levels' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
              <p className="text-xl font-bold text-[#0A0D14] mb-0.5">{totalOwned}</p>
              <p className="text-xs text-text-subtle">Total Owned</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
              <p className="text-xl font-bold text-[#0A0D14] mb-0.5">{inWarehouse}</p>
              <p className="text-xs text-text-subtle">In Warehouse</p>
            </div>
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
              <p className="text-xl font-bold text-[#0A0D14] mb-0.5">{inStore}</p>
              <p className="text-xs text-text-subtle">In Store</p>
            </div>
          </div>

          {warehouseLocations.length > 0 && (
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
              <p className="text-sm font-bold text-[#0A0D14] mb-3">Warehouse Stock</p>
              <div className="divide-y divide-gray-100">
                {warehouseLocations.map((loc: any, i: number) => (
                  <div key={loc.id ?? i} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-2">
                      <WareHouseIcon width={18} className="text-brand" />
                      <span className="text-xs font-semibold text-[#0A0D14]">{loc.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0A0D14]">
                      {loc.quantity ?? loc.availableQuantity ?? 0} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {storeLocations.length > 0 && (
            <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-gray-100">
              <p className="text-sm font-bold text-[#0A0D14] mb-3">Store Stock</p>
              <div className="divide-y divide-gray-100">
                {storeLocations.map((loc: any, i: number) => (
                  <div key={loc.id ?? i} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-2">
                      <StoreIcon width={18} className="text-brand" />
                      <span className="text-xs font-semibold text-[#0A0D14]">{loc.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#0A0D14]">
                      {loc.quantity ?? loc.availableQuantity ?? 0} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Actions Menu ── */}
      <Modal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)}>
        <div className="space-y-1 pb-2">
          <p className="text-sm font-bold text-[#0A0D14] px-4 py-2">Product Actions</p>
          <button
            type="button"
            onClick={() => { setIsMenuOpen(false); onEdit(); }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-[#0A0D14] hover:bg-[#F8FAFC] flex gap-3 items-center cursor-pointer transition-colors"
          >
            <Edit size={18} className="text-brand" />
            <span>Edit product details</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsMenuOpen(false); setIsDeleteModalOpen(true); }}
            className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-500 hover:bg-red-50 flex gap-3 items-center cursor-pointer transition-colors"
          >
            <Trash2 size={18} className="text-red-500" />
            <span>Delete product</span>
          </button>
        </div>
      </Modal>

      {/* ── Delete Confirmation ── */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="space-y-4 pb-2">
          <p className="text-base font-bold text-[#0A0D14]">Delete {product.name}?</p>
          <p className="text-sm text-text-muted leading-relaxed">
            This will remove the product from your catalogue. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              size="lg"
              disabled={deleting}
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
