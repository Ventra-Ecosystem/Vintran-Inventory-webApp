'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  FolderPlus,
  ChevronRight,
  X,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Dropdown } from '@/src/components/ui/Dropdown';
import { SuccessScreen } from '@/src/components/dashboard/SuccessScreen';
import { Modal } from '@/src/components/ui/Modal';
import { categoriesApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { cn } from '@/src/lib/utils';
import { toArr } from '@/src/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────

type Category = {
  id: string;
  name: string;
  description?: string;
  subcategories?: Category[];
  productCount?: number;
  parentCategoryId?: string;
};

type SubScreen =
  | { type: 'list' }
  | { type: 'createCategory' }
  | { type: 'categoryDetail'; category: Category }
  | { type: 'createSubcategory'; category: Category };

interface CategoriesTabProps {
  /** Called after a category is successfully created (optional — used by the parent page for success toasts). */
  onSuccess?: (name: string) => void;
}

// ─── Pill-shaped search bar (matches mobile pill style) ──────────────────

function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center h-11 bg-[#F8FAFC] rounded-[22px] px-4 gap-2 border border-[#F1F5F9]">
      <Search size={16} className="text-[#94A3B8] shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search…'}
        className="flex-1 h-full bg-transparent text-sm text-[#0A0D14] placeholder:text-[#94A3B8] outline-none"
      />
    </div>
  );
}

// ─── Three-dot context menu (⋮) ──────────────────────────────────────────

type MenuAction = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
};

function DotMenu({ actions }: { actions: MenuAction[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1 rounded-lg hover:bg-gray-100 text-[#64748B] transition-colors cursor-pointer"
        aria-label="More options"
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 min-w-[180px] bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                a.onClick();
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-left cursor-pointer',
                a.danger
                  ? 'text-red-500 hover:bg-red-50'
                  : 'text-[#0A0D14] hover:bg-[#F8FAFC]'
              )}
            >
              <span
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  a.danger ? 'bg-red-100' : 'bg-[#F8FAFC]'
                )}
              >
                {a.icon}
              </span>
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sheet / slide-in panel (bottom-sheet equivalent for web) ─────────────

function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-black/25 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />
      {/* Panel — slides up from the bottom on small screens, from the right on sm+ */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-xl',
          'sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none sm:pb-10',
          'transition-transform duration-300 ease-in-out',
          open ? 'translate-y-0 sm:translate-x-0' : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
        )}
      >
        {/* Handle for mobile */}
        <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />

        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-bold text-[#0A0D14]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-[#64748B] cursor-pointer mt-0.5 shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-4">{children}</div>
      </div>
    </>
  );
}

// ─── Back-button header shared across all sub-screens ────────────────────

function SubScreenHeader({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <button
        type="button"
        onClick={onBack}
        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F1F5F9] text-[#0A0D14] transition-colors cursor-pointer shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
      <h2 className="text-base font-bold text-[#0A0D14]">{title}</h2>
    </div>
  );
}

// ─── Category Detail Screen ───────────────────────────────────────────────

function CategoryDetailScreen({
  cat,
  onCreateSubcategory,
  onBack,
}: {
  cat: Category;
  onCreateSubcategory: () => void;
  onBack: () => void;
}) {
  const [subSearch, setSubSearch] = useState('');

  const subcategories: Category[] = cat.subcategories ?? [];
  const filtered = subcategories.filter((s) =>
    s.name.toLowerCase().includes(subSearch.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-16">
      <SubScreenHeader title={cat.name} onBack={onBack} />

      {/* Create New Subcategory — light-blue outline style, matching mobile alpha10bg */}
      <button
        type="button"
        onClick={onCreateSubcategory}
        className="w-full h-12 rounded-2xl bg-[#EFF5FF] hover:bg-blue-100 text-[#0055FF] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#0055FF]/10"
      >
        <Plus size={16} />
        <span>Create New Subcategory</span>
      </button>

      {/* Search */}
      <SearchBar
        value={subSearch}
        onChange={setSubSearch}
        placeholder="Search subcategory…"
      />

      {/* Count */}
      <p className="text-[13px] font-medium text-[#64748B]">
        Subcategories ({filtered.length})
      </p>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-medium text-[#0A0D14]">
            {subcategories.length === 0 ? 'No subcategories yet' : 'No results found'}
          </p>
          <p className="text-xs text-[#94A3B8] mt-1 text-center leading-relaxed">
            {subcategories.length === 0
              ? `Tap "Create New Subcategory" to add one under ${cat.name}`
              : 'Try a different search term'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden">
          {filtered.map((sub, i) => (
            <div
              key={sub.id ?? i}
              className={cn(
                'flex items-center justify-between px-4 py-3.5',
                i < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#0A0D14] truncate">{sub.name}</p>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {sub.productCount ?? 0} items
                </p>
              </div>
              <DotMenu
                actions={[
                  {
                    icon: <Eye size={16} className="text-[#64748B]" />,
                    label: 'View',
                    onClick: () => {},
                  },
                  {
                    icon: <Edit3 size={16} className="text-[#64748B]" />,
                    label: 'Edit',
                    onClick: () => {},
                  },
                ]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Create Subcategory Form ──────────────────────────────────────────────

function CreateSubcategoryForm({
  category,
  onBack,
  onSuccess,
}: {
  category: Category;
  onBack: () => void;
  onSuccess: (name: string) => void;
}) {
  const [name, setName] = useState('');
  const [itemCount, setItemCount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Subcategory name is required'); return; }
    setSubmitting(true);
    try {
      await categoriesApi.create({
        name: name.trim(),
        description: itemCount ? `Initial items: ${itemCount}` : undefined,
        parentCategoryId: category.id,
      });
      const savedName = name.trim();
      setName('');
      setItemCount('');
      onSuccess(savedName);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create subcategory');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 pb-16">
      <SubScreenHeader title="New Subcategory" onBack={onBack} />

      {/* Parent category breadcrumb chip — mirrors the mobile blue pill */}
      <div className="flex items-center gap-2">
        <span className="bg-[#EFF5FF] text-[#0055FF] text-xs font-medium px-3 py-1 rounded-full">
          {category.name}
        </span>
        <span className="text-xs text-[#94A3B8]">/ New Subcategory</span>
      </div>

      <form onSubmit={handleCreate} noValidate className="space-y-4">
        <Input
          label="Subcategory Name"
          value={name}
          placeholder="e.g. Smartphones, Running Shoes…"
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="space-y-1">
          <Input
            label="Number of Items"
            value={itemCount}
            placeholder="0"
            inputMode="numeric"
            onChange={(e) => setItemCount(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            You can assign products to this subcategory after creating it.
          </p>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" disabled={submitting} className="cursor-pointer">
            {submitting ? 'Creating…' : 'Create Subcategory'}
          </Button>
        </div>
      </form>
    </div>
  );
}

// ─── Main CategoriesTab ───────────────────────────────────────────────────

export function CategoriesTab({ onSuccess }: CategoriesTabProps) {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [subScreen, setSubScreen] = useState<SubScreen>({ type: 'list' });
  const [successData, setSuccessData] = useState<{ name: string; isSub: boolean; parent?: Category } | null>(null);

  // ── Create category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── Edit sheet state
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  // ── Delete sheet state
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [reassignTo, setReassignTo] = useState('');
  const [deleteWorking, setDeleteWorking] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────

  const fetchCategories = () => {
    setLoading(true);
    categoriesApi
      .list()
      .then((res: any) => setCategories(toArr(res.data)))
      .catch((err: unknown) =>
        toast.error(err instanceof ApiError ? err.description : 'Failed to load categories')
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openEdit = (cat: Category) => {
    setEditName(cat.name);
    setEditDesc(cat.description ?? '');
    setTimeout(() => setEditTarget(cat), 50);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editName.trim()) return;
    setEditSaving(true);
    try {
      await categoriesApi.update(editTarget.id, {
        name: editName.trim(),
        description: editDesc.trim() || undefined,
      });
      toast.success('Category updated');
      fetchCategories();
      setEditTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update category');
    } finally {
      setEditSaving(false);
    }
  };

  const submitDelete = async () => {
    if (!deleteTarget) return;
    setDeleteWorking(true);
    try {
      const res: any = await categoriesApi.delete(
        deleteTarget.id,
        reassignTo ? { reassignToCategoryId: reassignTo } : undefined
      );
      const moved = res?.data ?? 0;
      toast.success(
        moved > 0
          ? `Category deleted · ${moved} product${moved === 1 ? '' : 's'} ${reassignTo ? 'reassigned' : 'uncategorised'}`
          : 'Category deleted'
      );
      fetchCategories();
      setDeleteTarget(null);
      setReassignTo('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to delete category');
    } finally {
      setDeleteWorking(false);
    }
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) { toast.error('Category name is required'); return; }
    setSubmitting(true);
    try {
      await categoriesApi.create({ name: catName.trim(), description: catDesc.trim() || undefined });
      const name = catName.trim();
      setCatName(''); setCatDesc('');
      fetchCategories();
      if (onSuccess) {
        onSuccess(name);
      } else {
        setSubScreen({ type: 'list' });
        setSuccessData({ name, isSub: false });
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reassign dropdown options for delete sheet ────────────────────────────

  const reassignOptions = [
    { label: 'Leave uncategorised', value: '' },
    ...categories
      .filter((c) => c.id !== deleteTarget?.id && !!c.parentCategoryId === !!deleteTarget?.parentCategoryId)
      .map((c) => ({ label: c.name, value: c.id })),
  ];



  // ── Create Category form sub-screen ──────────────────────────────────────

  if (subScreen.type === 'createCategory') {
    return (
      <div className="space-y-4 pb-16">
        <SubScreenHeader title="Create a Category" onBack={() => setSubScreen({ type: 'list' })} />
        <form onSubmit={handleCreateCategorySubmit} noValidate className="space-y-4">
          <Input
            label="Category Name"
            value={catName}
            placeholder="Enter category name"
            onChange={(e) => setCatName(e.target.value)}
            required
          />
          <Input
            label="Description (optional)"
            value={catDesc}
            placeholder="Add a description"
            onChange={(e) => setCatDesc(e.target.value)}
          />
          <div className="pt-2">
            <Button type="submit" fullWidth size="lg" disabled={submitting} className="cursor-pointer">
              {submitting ? 'Creating…' : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ── Category Detail sub-screen ────────────────────────────────────────────

  if (subScreen.type === 'categoryDetail') {
    const cat = subScreen.category;
    return (
      <CategoryDetailScreen
        cat={cat}
        onBack={() => setSubScreen({ type: 'list' })}
        onCreateSubcategory={() => setSubScreen({ type: 'createSubcategory', category: cat })}
      />
    );
  }

  // ── Create Subcategory sub-screen ─────────────────────────────────────────

  if (subScreen.type === 'createSubcategory') {
    const cat = subScreen.category;
    return (
      <CreateSubcategoryForm
        category={cat}
        onBack={() => setSubScreen({ type: 'categoryDetail', category: cat })}
        onSuccess={(name) => {
          fetchCategories();
          setSubScreen({ type: 'categoryDetail', category: cat });
          setSuccessData({ name, isSub: true, parent: cat });
        }}
      />
    );
  }

  // ── Main list view ────────────────────────────────────────────────────────

  const filtered = categories.filter((c) =>
    (c?.name ?? '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="space-y-4 pb-16">
        {/* Create New Category — light-blue outlined (matches mobile alpha10bg) */}
        <button
          type="button"
          onClick={() => setSubScreen({ type: 'createCategory' })}
          className="w-full h-12 rounded-2xl bg-[#EFF5FF] hover:bg-blue-100 text-[#0055FF] font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#0055FF]/10"
        >
          <Plus size={16} />
          <span>Create New Category</span>
        </button>

        {/* Search — pill-shaped, matching mobile */}
        <SearchBar value={query} onChange={setQuery} placeholder="Search category" />

        {/* Count label */}
        <p className="text-[13px] font-medium text-[#64748B]">
          Categories ({filtered.length})
        </p>

        {/* Category list */}
        {loading ? (
          <div className="text-center py-10 text-[#64748B] text-sm font-medium">
            Loading categories…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[#64748B] text-sm font-medium">
            No categories found
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#F1F5F9] overflow-hidden">
            {filtered.map((category, idx) => (
              <div
                key={category?.id ?? idx}
                onClick={() => setSubScreen({ type: 'categoryDetail', category })}
                className={cn(
                  'flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#F8FAFC] transition-colors',
                  idx < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                )}
              >
                {/* Checkbox square — unchecked (mirrors mobile) */}
                <div className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#CBD5E1] bg-white shrink-0" />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#0A0D14] truncate">
                    {category?.name ?? 'Unnamed Category'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {category?.subcategories?.length ?? 0} subcategories ·{' '}
                    {category?.productCount ?? 0} items
                  </p>
                </div>

                {/* Three-dot menu */}
                <DotMenu
                  actions={[
                    {
                      icon: <Eye size={16} className="text-[#64748B]" />,
                      label: 'View',
                      onClick: () => setSubScreen({ type: 'categoryDetail', category }),
                    },
                    {
                      icon: <Edit3 size={16} className="text-[#64748B]" />,
                      label: 'Edit',
                      onClick: () => openEdit(category),
                    },
                    {
                      icon: <Edit3 size={16} className="text-[#64748B]" />,
                      label: 'Rename',
                      onClick: () => openEdit(category),
                    },
                    {
                      icon: <Trash2 size={16} className="text-red-500" />,
                      label: 'Delete Category',
                      danger: true,
                      onClick: () => {
                        setReassignTo('');
                        setDeleteTarget(category);
                      },
                    },
                  ]}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Edit / Rename sheet ─────────────────────────────────────────── */}
      <Sheet
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit category"
        subtitle="Renaming updates every product currently filed under this category."
      >
        <form onSubmit={submitEdit} noValidate className="space-y-4">
          <Input
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Category name"
            required
          />
          <Input
            label="Description"
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Optional"
          />
          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={!editName.trim() || editSaving}
            className="cursor-pointer"
          >
            {editSaving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Sheet>

      {/* ── Delete confirmation sheet ───────────────────────────────────── */}
      <Sheet
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setReassignTo(''); }}
        title={`Delete ${deleteTarget?.name ?? 'category'}?`}
        subtitle={
          (deleteTarget?.productCount ?? 0) > 0
            ? `${deleteTarget?.productCount} product(s) are filed under this category. Choose where they should go — leave it unset to clear their category instead.`
            : 'No products are filed under this category.'
        }
      >
        {(deleteTarget?.productCount ?? 0) > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-[#0A0D14]">Reassign products to</p>
            <Dropdown
              options={reassignOptions}
              value={reassignTo}
              onChange={setReassignTo}
              placeholder="Leave uncategorised"
            />
          </div>
        )}
        <Button
          fullWidth
          size="lg"
          disabled={deleteWorking}
          onClick={submitDelete}
          className="bg-red-500 hover:bg-red-600 cursor-pointer"
        >
          {deleteWorking ? 'Deleting…' : 'Delete category'}
        </Button>
      </Sheet>

      {/* ── Success Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!successData} onClose={() => setSuccessData(null)}>
        {successData && (
          <SuccessScreen
            standalone={false}
            title={`${successData.name} created successfully`}
            subtitle={`Your ${successData.isSub ? 'subcategory' : 'category'} has been successfully created`}
            primaryAction={
              <Button
                type="button"
                fullWidth
                size="lg"
                onClick={() => {
                  if (successData.isSub && successData.parent) {
                    setSubScreen({ type: 'createSubcategory', category: successData.parent });
                  } else {
                    setSubScreen({ type: 'createCategory' });
                  }
                  setSuccessData(null);
                }}
              >
                Create another
              </Button>
            }
            secondaryAction={
              <Button
                type="button"
                fullWidth
                size="lg"
                variant="secondary"
                onClick={() => setSuccessData(null)}
              >
                {successData.isSub ? 'Back to category' : 'Back to categories'}
              </Button>
            }
          />
        )}
      </Modal>
    </>
  );
}
