'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Supplier, Message } from './types';
import { cn } from '@/src/lib/utils';

interface SupplierChatProps {
  supplier: Supplier;
  proposalMessage?: string;
}

export function SupplierChat({ supplier, proposalMessage }: SupplierChatProps) {
  const initialMessages: Message[] = proposalMessage
    ? [
        {
          id: '0',
          text: proposalMessage,
          fromUser: true,
          isProposal: true,
          timestamp: 'Just now',
        },
      ]
    : [];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: input.trim(),
        fromUser: true,
        isProposal: false,
        timestamp: 'Just now',
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-3 pb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex',
              msg.fromUser ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3',
                msg.fromUser
                  ? msg.isProposal
                    ? 'bg-green-500 text-white'
                    : 'bg-brand text-white'
                  : 'bg-bg-surface text-neutral-900'
              )}
            >
              <p className="text-xs">{msg.text}</p>
              <p
                className={cn(
                  'text-[10px] mt-1',
                  msg.fromUser ? 'text-white/70' : 'text-text-muted'
                )}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center border-t border-neutral-100 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={`Message ${supplier.name}`}
          className="flex-1 h-11 rounded-xl border border-neutral-200 px-4 text-sm focus:border-brand focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="h-11 w-11 rounded-full bg-brand flex items-center justify-center text-white"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
