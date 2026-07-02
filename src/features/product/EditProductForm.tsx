'use client';

import { useState } from 'react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { UploadIcon2 } from '@/src/assets/icon';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
}

interface EditProductFormProps {
  product: Product;
  onSaved: () => void;
}

const categories = [
  { label: 'Grains', value: 'grains' },
  { label: 'Oils', value: 'oils' },
  { label: 'Pantry', value: 'pantry' },
  { label: 'Tech', value: 'tech' },
  { label: 'Fashion', value: 'fashion' },
  { label: 'Decor', value: 'decor' },
  { label: 'School', value: 'school' },
  { label: 'Tools', value: 'tools' },
];
const subcategoriesByCategory = [
  { label: 'Gadgets', value: 'gadgets' },
  { label: 'Adult Clothing', value: 'adultClothing' },
  { label: 'Kids Clothing', value: 'kidsClothing' },
  { label: 'Stationery', value: 'stationery' },
  { label: 'Merch', value: 'merch' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Others...', value: 'others' },
];

export function EditProductForm({ product, onSaved }: EditProductFormProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState(product.category);
  const [subcategory, setSubcategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: replace with real API call
      console.log('save product', {
        id: product.id,
        name,
        category,
        subcategory,
      });
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <Input
        label="Product name"
        value={name}
        placeholder="Enter product name"
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="SKU / Product code"
        value={sku}
        placeholder="Auto generated on save"
        onChange={(e) => setSku(e.target.value)}
        required
      />

      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">Category</p>
        <Dropdown
          options={categories}
          value={category}
          placeholder="Select category"
          onChange={setCategory}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">Subcategory</p>
        <Dropdown
          options={subcategoriesByCategory}
          value={subcategory}
          placeholder="Select Subcategory"
          onChange={setSubcategory}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-950 mb-1">
          Upload product Image
        </p>
        <label
          htmlFor="product-image"
          className="flex flex-col cursor-pointer items-center justify-center rounded-[10px] border border-[#EAECF0] px-6 py-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-bg-surface"
        >
          <div className="bg-[#F2F4F7] rounded-full w-10 h-10 flex justify-center items-center border-[6px] border-[#F9FAFB]">
            <UploadIcon2 />
          </div>
          <div className="flex gap-1">
            <p className="text-[#6941C6]">Click to upload</p>
            <p>or drag and drop</p>
          </div>
          <p className="text-center">SVG, PNG, JPG or GIF (max. 800x400px)</p>
        </label>

        <input
          id="product-image"
          name="fileInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            console.log(file);
          }}
        />
      </div>

      <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
