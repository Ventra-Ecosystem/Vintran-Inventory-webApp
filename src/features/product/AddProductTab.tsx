'use client';

import { useState } from 'react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { UploadIcon2 } from '@/src/assets/icon';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { productsApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

interface AddProductTabProps {
  onDone: () => void;
}

const categories = [
  { label: 'Grains', value: 'grains' },
  { label: 'Oils', value: 'oils' },
  { label: 'Pantry', value: 'pantry' },
  { label: 'Tech', value: 'tech' },
  { label: 'Fashion', value: 'fashion' },
];

const subcategories = [
  { label: 'Gadgets', value: 'gadgets' },
  { label: 'Adult Clothing', value: 'adultClothing' },
  { label: 'Stationery', value: 'stationery' },
  { label: 'Others', value: 'others' },
];

export function AddProductTab({ onDone }: AddProductTabProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Product name is required'); return; }
    setIsSubmitting(true);
    try {
      await productsApi.create({
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
        unitOfMeasure: 'unit',
        lowStockThreshold: 0,
        channels: 'InStore',
      });
      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <SuccessScreen
        title="Product Added Successfully!"
        subtitle={`${name} has been added to your catalogue`}
        primaryAction={
          <Button type="button" fullWidth size="lg" onClick={() => { setShowSuccess(false); onDone(); }}>
            Continue
          </Button>
        }
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input label="Product name" value={name} placeholder="Enter product name" onChange={(e) => setName(e.target.value)} required />
      <Input label="SKU / Product code" value={sku} placeholder="Auto generated on save" onChange={(e) => setSku(e.target.value)} />
      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">Category</p>
        <Dropdown options={categories} value={category} placeholder="Select category" onChange={setCategory} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">Subcategory</p>
        <Dropdown options={subcategories} value={subcategory} placeholder="Select subcategory" onChange={setSubcategory} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">Upload product Image</p>
        <label htmlFor="product-image" className="flex flex-col cursor-pointer items-center justify-center rounded-[10px] border border-[#EAECF0] px-6 py-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-bg-surface">
          <div className="bg-[#F2F4F7] rounded-full w-10 h-10 flex justify-center items-center border-[6px] border-[#F9FAFB]">
            <UploadIcon2 />
          </div>
          <div className="flex gap-1"><p className="text-[#6941C6]">Click to upload</p><p>or drag and drop</p></div>
          <p className="text-center">SVG, PNG, JPG or GIF (max. 800x400px)</p>
        </label>
        <input id="product-image" name="fileInput" type="file" accept="image/*" className="hidden" />
      </div>
      <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Adding…' : 'Add product'}
      </Button>
    </form>
  );
}
