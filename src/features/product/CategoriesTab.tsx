'use client';

import { useEffect, useState } from 'react';
import { Search, Plus, Edit3 } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { ArrowdownIcon } from '@/src/assets/icon';
import { categoriesApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

export function CategoriesTab() {
  const [query, setQuery] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoriesApi.list()
      .then((res: any) => setCategories(res.data ?? []))
      .catch((err: unknown) => toast.error(err instanceof ApiError ? err.description : 'Failed to load categories'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    try {
      const res: any = await categoriesApi.create({ name: newCategoryName.trim() });
      setCategories((prev) => [...prev, res.data]);
      toast.success('Category added');
      setIsAddingCategory(false);
      setNewCategoryName('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (isAddingCategory) {
    return (
      <form onSubmit={handleAddCategory} noValidate className="space-y-4">
        <Input label="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} required />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth size="lg" type="button" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
          <Button variant="primary" fullWidth size="lg" type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add category'}</Button>
        </div>
      </form>
    );
  }

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <Button fullWidth size="lg" type="button" variant="secondary" onClick={() => setIsAddingCategory(true)}>
        <Plus size={16} className="mr-1" />Add category
      </Button>
      <div className="px-4 h-[50px] bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4">
        <Search size={16} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search category..." className="flex-1 flex h-full outline-0" />
      </div>
      <div>
        <p className="font-medium text-sm text-gray-950 mb-2">Categories</p>
        {loading ? (
          <div className="text-center py-8 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">No categories found</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((category) => (
              <div key={category.id} className="px-3 py-2.5 bg-bg-surface rounded-[12px] flex justify-between items-center text-[#6D7075]">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="text-text-subtle text-sm font-semibold">{category.name}</p>
                    <p className="text-text-subtle text-xs font-medium">
                      {category.subcategories?.length ?? 0} subcategories · {category.productCount ?? 0} products
                    </p>
                  </div>
                </div>
                <div className="flex gap-2"><Edit3 size={16} /><ArrowdownIcon width={16} /></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
