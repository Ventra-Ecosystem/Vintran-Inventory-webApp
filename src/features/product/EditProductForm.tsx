'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Modal } from '@/src/components/ui/Modal';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { UploadIcon2 } from '@/src/assets/icon';
import { productsApi, categoriesApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  subcategory?: string;
  unitOfMeasure?: string;
  lowStockThreshold?: number;
}

interface EditProductFormProps {
  product: Product;
  onSaved: () => void;
}

export function EditProductForm({ product, onSaved }: EditProductFormProps) {
  const [name, setName] = useState(product.name ?? '');
  const [sku, setSku] = useState(product.sku ?? '');
  const [category, setCategory] = useState(product.category ?? '');
  const [subcategory, setSubcategory] = useState(product.subcategory ?? '');
  const [categoriesList, setCategoriesList] = useState<{ label: string; value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    categoriesApi.list()
      .then((res: any) => {
        const items = toArr(res.data);
        if (items.length > 0) {
          setCategoriesList(
            items.map((cat: any) => ({
              label: cat.name ?? cat.categoryName ?? 'Category',
              value: cat.name ?? cat.id,
            }))
          );
        }
      })
      .catch(() => {
        setCategoriesList([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await productsApi.update(product.id, {
        name: name.trim(),
        sku: sku.trim() || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined,
      });

      setShowSuccess(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="space-y-4 pb-12">
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
          placeholder="Enter SKU"
          onChange={(e) => setSku(e.target.value)}
        />

        <div>
          <p className="text-sm font-medium text-gray-950 mb-1">Category</p>
          <Dropdown
            options={categoriesList}
            value={category}
            placeholder="Select category"
            onChange={setCategory}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-950 mb-1">Upload product Image</p>
          <label
            htmlFor="edit-product-image"
            className="flex flex-col cursor-pointer items-center justify-center rounded-[10px] border border-[#EAECF0] px-6 py-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-bg-surface"
          >
            <div className="bg-[#F2F4F7] rounded-full w-10 h-10 flex justify-center items-center border-[6px] border-[#F9FAFB]">
              <UploadIcon2 />
            </div>
            <div className="flex gap-1">
              <p className="text-[#6941C6]">Click to upload</p>
              <p>or drag and drop</p>
            </div>
            <p className="text-center text-xs text-text-muted">SVG, PNG, JPG or GIF (max. 800x400px)</p>
          </label>
          <input id="edit-product-image" name="fileInput" type="file" accept="image/*" className="hidden" />
        </div>

        <Button type="submit" fullWidth size="lg" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      {/* Right-Side Drawer Success Screen */}
      <Modal isOpen={showSuccess} onClose={onSaved}>
        <SuccessScreen
          standalone={false}
          title="Product Updated Successfully!"
          subtitle={`Details for ${name} have been saved to your catalogue.`}
          primaryAction={
            <Button fullWidth size="lg" onClick={onSaved}>
              Continue
            </Button>
          }
        />
      </Modal>
    </>
  );
}
