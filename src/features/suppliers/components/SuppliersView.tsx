'use client';

import { useEffect, useState } from 'react';
import { PlusIcon } from '@/src/assets/icon';
import { Search, ChevronRight, CheckCircle2, Clock, Star } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
}

function ConnectionBadge({ status }: { status: string }) {
  if (!status) return null;
  const active = status === 'Active' || status === 'Connected';
  return (
    <div className="flex items-center gap-1 mt-1.5">
      {active ? (
        <CheckCircle2 size={12} className="text-green-600" />
      ) : (
        <Clock size={12} className="text-amber-600" />
      )}
      <span className="text-[10px] font-medium text-gray-500">{status}</span>
    </div>
  );
}

interface AddSupplierSheetProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function AddSupplierSheet({ open, onClose, onSaved }: AddSupplierSheetProps) {
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Supplier name is required'); return; }
    setSaving(true);
    try {
      await suppliersApi.create({ name: name.trim(), contactPerson: contactPerson || undefined, email: email || undefined, phoneNumber: phone || undefined });
      toast.success('Supplier added');
      setName(''); setContactPerson(''); setEmail(''); setPhone('');
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to add supplier');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm" />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-6 pb-10 shadow-xl sm:inset-y-0 sm:left-auto sm:right-0 sm:w-[420px] sm:rounded-l-3xl sm:rounded-tr-none sm:rounded-br-none">
        <div className="mx-auto mb-4 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#0A0D14]">Add Supplier</h3>
            <p className="text-xs text-[#64748B] mt-0.5">Add a new supplier to your directory</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-[#64748B]">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Supplier Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Enter supplier name" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Contact Person</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="Name" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="supplier@example.com" className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#0A0D14]">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." className="w-full h-11 rounded-[10px] border border-gray-200 px-4 text-sm focus:border-brand focus:outline-none" />
          </div>
          <button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-brand text-white font-semibold text-sm disabled:opacity-50">
            {saving ? 'Saving…' : 'Add Supplier'}
          </button>
        </form>
      </div>
    </>
  );
}

export function SuppliersView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchSuppliers = () => {
    setLoading(true);
    Promise.all([
      suppliersApi.list({ search: search || undefined }),
      suppliersApi.list({ favouriteOnly: true }),
    ])
      .then(([allRes, favRes]: any[]) => {
        const toArr = (d: any) => Array.isArray(d) ? d : d?.items ?? d?.data ?? [];
        setSuppliers(toArr(allRes.data));
        setFavourites(toArr(favRes.data));
      })
      .catch((err: unknown) => {
        if (!(err instanceof ApiError && err.status === 403)) {
          toast.error('Failed to load suppliers');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchSuppliers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const toggleFavourite = async (supplier: any) => {
    try {
      if (supplier.isFavourite) {
        await suppliersApi.unfavourite(supplier.id);
      } else {
        await suppliersApi.favourite(supplier.id);
      }
      fetchSuppliers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to update favourite');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center h-11 bg-[#F8FAFC] rounded-[22px] px-4 gap-2 border border-[#F1F5F9]">
        <Search size={16} className="text-[#94A3B8] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="flex-1 h-full bg-transparent text-sm text-[#0A0D14] placeholder:text-[#94A3B8] outline-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">All Suppliers</h2>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500 text-center py-6">Loading suppliers…</p>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">No suppliers found</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {suppliers.map((item: any) => (
            <div
              key={item.id}
              className="min-w-[145px] p-3 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer hover:border-brand/30 transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-primary-alpha-10 flex items-center justify-center mb-2">
                <span className="text-sm font-bold text-brand">{getInitials(item.name ?? '')}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{item.contactPerson ?? item.email ?? '—'}</p>
              <ConnectionBadge status={item.connectionStatus ?? (item.isActive !== false ? 'Active' : 'Inactive')} />
              <button
                type="button"
                onClick={() => toggleFavourite(item)}
                className="mt-2 text-[10px] flex items-center gap-1 text-amber-500"
              >
                <Star size={10} fill={item.isFavourite ? 'currentColor' : 'none'} />
                {item.isFavourite ? 'Favourited' : 'Favourite'}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdd(true)}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-alpha-10 border-2 border-brand/20 text-brand font-semibold hover:bg-brand/10 transition-colors"
      >
        <PlusIcon width={18} className="text-brand" />
        <span>Add a Supplier</span>
      </button>

      <h2 className="text-base font-bold text-gray-900 pt-2">Favourite suppliers</h2>
      {favourites.length === 0 ? (
        <p className="text-sm text-gray-500">No favourite suppliers yet</p>
      ) : (
        <div className="space-y-4">
          {favourites.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-alpha-10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand">{getInitials(item.name ?? '')}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{item.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{item.connectionStatus ?? 'Active'}</span>
                  </div>
                </div>
              </div>
              <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      <AddSupplierSheet open={showAdd} onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchSuppliers(); }} />
    </div>
  );
}
