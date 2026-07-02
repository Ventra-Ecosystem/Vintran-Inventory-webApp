// src/features/product/CategoriesTab.tsx
'use client';

import { useState } from 'react';
import { Search, Plus, Smartphone, Edit2, Edit3 } from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { ArrowdownIcon } from '@/src/assets/icon';

// TODO: replace with real API call
const categories = [
  { id: '1', name: 'Grains', productCount: 12 },
  { id: '2', name: 'Oils', productCount: 6 },
  { id: '3', name: 'Pantry', productCount: 20 },
];

export function CategoriesTab() {
  const [query, setQuery] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  if (isAddingCategory) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          // TODO: replace with real API call
          console.log('add category', newCategoryName);
          setIsAddingCategory(false);
          setNewCategoryName('');
        }}
        noValidate
        className="space-y-4"
      >
        <Input
          label="Category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          required
        />
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            fullWidth
            size="lg"
            type="button"
            onClick={() => setIsAddingCategory(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" fullWidth size="lg" type="submit">
            Add category
          </Button>
        </div>
      </form>
    );
  }

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Button
        fullWidth
        size="lg"
        type="button"
        variant="secondary"
        onClick={() => setIsAddingCategory(true)}
      >
        <Plus size={16} className="mr-1" />
        Add category
      </Button>

      <div className="px-4 h-[50px] bg-bg-surface text-[#525866] rounded-full text-sm font-normal flex items-center gap-4 ">
        <Search size={16} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search category..."
          className="flex-1 flex h-full outline-0"
        />
      </div>

      <div>
        <p className="font-medium text-sm text-gray-950 mb-2">
          Select upload method
        </p>

        <div className="flex flex-col gap-4">
          {filtered.map((category) => (
            <div
              key={category.id}
              className="px-3 py-2.5 bg-bg-surface rounded-[12px] flex justify-between items-center text-[#6D7075]"
            >
              <div className="flex items-center gap-2">
                <Smartphone size={20} />
                <div>
                  <p className="text-text-subtle text-sm font-semibold">
                    {category.name}
                  </p>
                  <p className="text-text-subtle text-xs font-medium">
                    3 subcategories · {category.productCount} product
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Edit3 size={16} />
                <ArrowdownIcon width={16} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
