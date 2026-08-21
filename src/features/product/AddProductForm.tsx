'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { Modal } from '@/src/components/ui/Modal';
import { UploadIcon2 } from '@/src/assets/icon';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { productsApi, categoriesApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';
import { cn } from '@/src/lib/utils';

type Channel = 'InStore' | 'Marketplace' | 'Both';

const UNIT_OPTIONS = [
  { label: 'Unit', value: 'unit' },
  { label: 'Count', value: 'count' },
  { label: 'Kg', value: 'kg' },
  { label: 'Gram', value: 'g' },
  { label: 'Litre', value: 'l' },
  { label: 'mL', value: 'ml' },
  { label: 'Pieces', value: 'pcs' },
  { label: 'Pack', value: 'pack' },
  { label: 'Dozen', value: 'dozen' },
];

const CHANNEL_OPTIONS: { label: string; value: Channel; sub: string }[] = [
  { label: 'Both', value: 'Both', sub: 'In-store & Marketplace' },
  { label: 'In-Store Sale', value: 'InStore', sub: 'Physical store only' },
  { label: 'Marketplace / Storefront', value: 'Marketplace', sub: 'Online only' },
];

interface AddProductFormProps {
  editProductId?: string;
  saveLabel?: string;
  onSave: (sku?: string) => void;
}

export function AddProductForm({ editProductId, saveLabel = 'Add product', onSave }: AddProductFormProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [unitOfMeasure, setUnitOfMeasure] = useState('unit');
  const [costPrice, setCostPrice] = useState('');
  const [channels, setChannels] = useState<Channel>('Both');
  const [lowStockEnabled, setLowStockEnabled] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [channelSheetOpen, setChannelSheetOpen] = useState(false);

  const [categoriesList, setCategoriesList] = useState<{ label: string; value: string }[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<{ label: string; value: string }[]>([]);
  const [rawCategories, setRawCategories] = useState<any[]>([]);

  const [loadingProduct, setLoadingProduct] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedSku, setSavedSku] = useState<string | undefined>(undefined);

  // Load categories
  useEffect(() => {
    categoriesApi.list()
      .then((res: any) => {
        const items = toArr(res.data);
        setRawCategories(items);
        setCategoriesList(items.map((c: any) => ({ label: c.name, value: c.name })));
      })
      .catch(() => {});
  }, []);

  // Populate subcategories when category changes
  useEffect(() => {
    if (!category) { setSubcategoriesList([]); return; }
    const match = rawCategories.find((c) => c.name === category || c.id === category);
    setSubcategoriesList(toArr(match?.subcategories).map((s: any) => ({ label: s.name, value: s.name })));
  }, [category, rawCategories]);

  // Load existing product when editing
  useEffect(() => {
    if (!editProductId) return;
    setLoadingProduct(true);
    productsApi.get(editProductId)
      .then((res: any) => {
        const p = res.data;
        if (p) {
          setName(p.name ?? '');
          setSku(p.sku ?? '');
          setDescription(p.description ?? '');
          setCategory(p.category ?? '');
          setSubcategory(p.subcategory ?? '');
          setUnitOfMeasure(p.unitOfMeasure ?? 'unit');
          setCostPrice(p.costPrice != null ? String(p.costPrice) : '');
          setChannels((p.channels as Channel) ?? 'Both');
          const threshold = p.lowStockThreshold ?? 0;
          setLowStockEnabled(threshold > 0);
          setLowStockThreshold(String(threshold > 0 ? threshold : 10));
        }
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.description : 'Failed to load product'))
      .finally(() => setLoadingProduct(false));
  }, [editProductId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Product name is required'); return; }

    setIsSubmitting(true);
    try {
      const body = {
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        unitOfMeasure,
        costPrice: costPrice ? Number(costPrice) : undefined,
        channels,
        lowStockThreshold: lowStockEnabled ? Number(lowStockThreshold) || 0 : 0,
      };

      if (editProductId) {
        await productsApi.update(editProductId, body);
        setSavedSku(sku);
      } else {
        const res: any = await productsApi.create({ ...body, channels });
        setSavedSku(res.data?.sku ?? sku);
      }
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDone = () => {
    setShowSuccess(false);
    onSave(savedSku);
  };

  if (loadingProduct) {
    return <div className="text-center py-12 text-text-muted text-sm">Loading product details…</div>;
  }

  const channelLabel = CHANNEL_OPTIONS.find((c) => c.value === channels)?.label ?? 'Both';

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-16">
        {/* Product name */}
        <Input
          label="Product name *"
          value={name}
          placeholder="Enter product name"
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* SKU */}
        <Input
          label="SKU / Product code (optional)"
          value={sku}
          placeholder="Auto-generated if left blank"
          onChange={(e) => setSku(e.target.value)}
        />

        {/* Description */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-[#0A0D14]">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product"
            rows={3}
            className="w-full rounded-[10px] border border-gray-200 px-4 py-2.5 text-sm focus:border-brand focus:outline-none resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Category</p>
          <Dropdown options={categoriesList} value={category} placeholder="Select category" onChange={(v) => { setCategory(v); setSubcategory(''); }} />
        </div>

        {/* Subcategory — shown only when parent has subcategories */}
        {subcategoriesList.length > 0 && (
          <div>
            <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Subcategory</p>
            <Dropdown options={subcategoriesList} value={subcategory} placeholder="Select subcategory" onChange={setSubcategory} />
          </div>
        )}

        {/* Unit of measure */}
        <div>
          <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Unit of Measure</p>
          <Dropdown options={UNIT_OPTIONS} value={unitOfMeasure} placeholder="Select unit" onChange={setUnitOfMeasure} />
        </div>

        {/* Cost price */}
        <Input
          label="Cost Price (₦)"
          type="number"
          value={costPrice}
          placeholder="0.00"
          onChange={(e) => setCostPrice(e.target.value)}
        />

        {/* Availability / Channels */}
        <div>
          <p className="text-sm font-medium text-[#0A0D14] mb-1.5">Availability Display</p>
          <button
            type="button"
            onClick={() => setChannelSheetOpen(true)}
            className="w-full h-11 flex items-center justify-between border border-gray-200 rounded-[10px] px-4 text-sm text-[#0A0D14] hover:border-brand transition-colors bg-white"
          >
            <span>{channelLabel}</span>
            <span className="text-gray-400 text-xs">▾</span>
          </button>

          {/* Channel picker sheet */}
          {channelSheetOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/25" onClick={() => setChannelSheetOpen(false)} />
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-5 pb-10 shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[400px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none">
                <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />
                <p className="text-base font-bold text-[#0A0D14] mb-1">Availability Display</p>
                <p className="text-xs text-text-muted mb-5">Select where this product will be sold</p>
                <div className="space-y-2">
                  {CHANNEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setChannels(opt.value); setChannelSheetOpen(false); }}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3.5 rounded-xl border text-left transition-colors',
                        channels === opt.value ? 'border-brand bg-brand-lighter' : 'border-gray-100 bg-[#F8FAFC] hover:border-brand/30'
                      )}
                    >
                      <div>
                        <p className={cn('text-sm font-semibold', channels === opt.value ? 'text-brand' : 'text-[#0A0D14]')}>{opt.label}</p>
                        <p className="text-xs text-text-muted mt-0.5">{opt.sub}</p>
                      </div>
                      <div className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center', channels === opt.value ? 'border-brand' : 'border-gray-300')}>
                        {channels === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                      </div>
                    </button>
                  ))}
                </div>
                <Button type="button" fullWidth size="lg" className="mt-5" onClick={() => setChannelSheetOpen(false)}>Done</Button>
              </div>
            </>
          )}
        </div>

        {/* Low stock threshold toggle */}
        <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl px-4 py-3.5 border border-gray-100">
          <div>
            <p className="text-sm font-semibold text-[#0A0D14]">Low-stock threshold</p>
            <p className="text-xs text-text-muted mt-0.5">Get notified when stock is low</p>
          </div>
          <button
            type="button"
            onClick={() => setLowStockEnabled(!lowStockEnabled)}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              lowStockEnabled ? 'bg-brand' : 'bg-gray-300'
            )}
          >
            <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', lowStockEnabled ? 'translate-x-5' : 'translate-x-0.5')} />
          </button>
        </div>

        {lowStockEnabled && (
          <Input
            label="Low threshold number"
            type="number"
            value={lowStockThreshold}
            placeholder="10"
            onChange={(e) => setLowStockThreshold(e.target.value)}
          />
        )}

        {/* Image upload */}
        <div>
          <p className="text-sm font-medium text-[#0A0D14] mb-1.5">
            Upload product image <span className="text-text-muted font-normal">(Optional)</span>
          </p>
          <label
            htmlFor="product-form-image"
            className="flex flex-col cursor-pointer items-center justify-center rounded-2xl border border-dashed border-gray-200 px-6 py-5 hover:bg-[#F8FAFC] transition-colors"
          >
            <div className="bg-[#F2F4F7] rounded-full w-10 h-10 flex justify-center items-center border-[6px] border-[#F9FAFB] mb-2">
              <UploadIcon2 />
            </div>
            <div className="flex gap-1 mb-0.5 text-xs font-semibold">
              <span className="text-brand">Click to upload</span>
              <span className="text-text-muted">or drag and drop</span>
            </div>
            <p className="text-center text-[10px] text-text-muted">SVG, PNG, JPG or GIF (max. 800×400px)</p>
          </label>
          <input id="product-form-image" name="fileInput" type="file" accept="image/*" className="hidden" />
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : saveLabel}
        </Button>
      </form>

      {/* Success modal */}
      <Modal isOpen={showSuccess} onClose={handleDone}>
        <SuccessScreen
          standalone={false}
          title={editProductId ? 'Product updated successfully' : 'Product added successfully'}
          subtitle={editProductId ? 'Your changes have been saved' : 'Your product has been added to your catalogue'}
          details={savedSku ? [{ label: 'Product code / SKU', value: savedSku }] : undefined}
          primaryAction={
            <Button type="button" fullWidth size="lg" onClick={handleDone}>
              {editProductId ? 'Back to catalogue' : 'Continue'}
            </Button>
          }
        />
      </Modal>
    </>
  );
}
