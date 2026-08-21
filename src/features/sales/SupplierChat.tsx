'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import type { Supplier } from './types';
import { cn, toArr } from '@/src/lib/utils';
import { suppliersApi } from '@/src/lib/api/catalog';
import { ApiError } from '@/src/lib/api/client';
import { toast } from 'sonner';

interface SupplierChatProps {
  supplier: Supplier;
  proposalMessage?: string;
}

export function SupplierChat({ supplier, proposalMessage }: SupplierChatProps) {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState(proposalMessage ?? '');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    suppliersApi.getMessages(supplier.id)
      .then((res: any) => setMessages(toArr(res.data)))
      .catch(() => {});
  }, [supplier.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    setSending(true);
    const optimistic = { id: Date.now().toString(), body: text, direction: 'Outbound', sentOnUtc: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setInput('');
    try {
      await suppliersApi.sendMessage(supplier.id, { body: text });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.description : 'Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.length === 0 && (
          <p className="text-xs text-text-muted text-center py-6">No messages yet. Start the conversation.</p>
        )}
        {messages.map((msg: any, idx: number) => {
          const fromUser = msg.direction === 'Outbound' || msg.fromUser;
          return (
            <div key={msg.id ?? idx} className={cn('flex', fromUser ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] rounded-2xl px-4 py-3', fromUser ? 'bg-brand text-white' : 'bg-bg-surface text-neutral-900')}>
                <p className="text-xs">{msg.body ?? msg.content ?? msg.text}</p>
                <p className={cn('text-[10px] mt-1', fromUser ? 'text-white/70' : 'text-text-muted')}>
                  {msg.sentOnUtc ? new Date(msg.sentOnUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 items-center border-t border-neutral-100 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder={`Message ${supplier.name}`}
          className="flex-1 h-11 rounded-xl border border-neutral-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="h-11 w-11 rounded-full bg-brand flex items-center justify-center text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
