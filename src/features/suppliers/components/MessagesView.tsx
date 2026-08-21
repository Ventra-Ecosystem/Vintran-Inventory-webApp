'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Send } from 'lucide-react';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';
import { toArr } from '@/src/lib/utils';

export function MessagesView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    suppliersApi.list({ search: search || undefined })
      .then((res: any) => setSuppliers(toArr(res.data)))
      .catch(() => {});
  }, [search]);

  const loadMessages = (supplier: any) => {
    setSelectedSupplier(supplier);
    suppliersApi.getMessages(supplier.id)
      .then((res: any) => setMessages(toArr(res.data)))
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedSupplier) return;
    setSending(true);
    try {
      await suppliersApi.sendMessage(selectedSupplier.id, { body: text.trim() });
      setMessages((prev) => [...prev, { id: Date.now(), body: text.trim(), sentByMe: true, sentOnUtc: new Date().toISOString() }]);
      setText('');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (selectedSupplier) {
    return (
      <div className="flex flex-col h-[500px]">
        <div className="flex items-center gap-3 mb-4">
          <button type="button" onClick={() => setSelectedSupplier(null)} className="text-sm text-brand font-medium">← Back</button>
          <p className="font-semibold text-text-default">{selectedSupplier.name}</p>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No messages yet. Start the conversation.</p>
          ) : messages.map((msg: any, idx: number) => (
            <div key={msg.id ?? idx} className={`flex ${msg.sentByMe || msg.direction === 'Outbound' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${msg.sentByMe || msg.direction === 'Outbound' ? 'bg-brand text-white' : 'bg-[#F1F5F9] text-[#0A0D14]'}`}>
                <p>{msg.body ?? msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.sentByMe || msg.direction === 'Outbound' ? 'text-blue-200' : 'text-gray-400'}`}>
                  {msg.sentOnUtc ? new Date(msg.sentOnUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message…"
            className="flex-1 h-10 rounded-xl border border-gray-200 px-3 text-sm focus:border-brand focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !text.trim()}
            className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center h-11 bg-[#F8FAFC] rounded-[22px] px-4 gap-2 border border-[#F1F5F9]">
        <Search size={16} className="text-[#94A3B8] shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search suppliers…"
          className="flex-1 h-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
        />
      </div>
      {suppliers.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No suppliers yet</p>
      ) : (
        <div className="bg-bg-surface rounded-xl overflow-hidden">
          {suppliers.map((s: any, idx: number) => (
            <button
              key={s.id}
              type="button"
              onClick={() => loadMessages(s)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${idx < suppliers.length - 1 ? 'border-b border-[#9B9EA34D]' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-brand-lighter flex items-center justify-center text-brand font-bold text-sm shrink-0">
                {(s.name ?? '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-default truncate">{s.name}</p>
                <p className="text-xs text-text-muted truncate">{s.email ?? s.phoneNumber ?? '—'}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
