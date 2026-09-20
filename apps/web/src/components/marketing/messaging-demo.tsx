'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCheck } from 'lucide-react';

interface Message {
  id: string;
  sender: 'Customer' | 'AI Assistant';
  text: string;
  time: string;
}

const SMS_CONVERSATION: Message[] = [
  {
    id: '1',
    sender: 'Customer',
    text: 'Hi, I need to reschedule my dental cleaning to Thursday afternoon.',
    time: '10:14 AM',
  },
  {
    id: '2',
    sender: 'AI Assistant',
    text: 'Certainly! I have 2:30 PM or 4:00 PM open on Thursday. Which works best for you?',
    time: '10:14 AM',
  },
  {
    id: '3',
    sender: 'Customer',
    text: "Let's do 4:00 PM please.",
    time: '10:15 AM',
  },
  {
    id: '4',
    sender: 'AI Assistant',
    text: 'All set! You are confirmed for Thursday at 4:00 PM. A calendar invite has been sent.',
    time: '10:15 AM',
  },
];

export function MessagingDemo() {
  const [turnIndex, setTurnIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTurnIndex((prev) => (prev + 1) % 3); // cycles pairs cleanly
    }, 3800);
    return () => clearInterval(interval);
  }, []);

  const currentMessages = [
    SMS_CONVERSATION[turnIndex % SMS_CONVERSATION.length],
    SMS_CONVERSATION[(turnIndex + 1) % SMS_CONVERSATION.length],
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0d080c]/90 border border-white/[0.08] shadow-2xl backdrop-blur-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[280px]">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/[0.08] rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">Omnichannel SMS Concierge</div>
            <div className="text-[10px] text-neutral-400 font-mono">+1 (415) 555-0199 • 2-Way Conversational</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          <span className="text-[9px] font-mono text-rose-300 font-bold uppercase tracking-wider">
            Connected
          </span>
        </div>
      </div>

      {/* Dynamic Animated SMS Thread with zero scrollbars */}
      <div className="space-y-3 overflow-hidden flex-1 flex flex-col justify-center">
        {currentMessages.map((msg, idx) => {
          const isAgent = msg.sender === 'AI Assistant';
          return (
            <div
              key={`${msg.id}-${idx}-${turnIndex}`}
              className={`p-3.5 rounded-2xl text-xs max-w-[88%] leading-relaxed transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${
                isAgent
                  ? 'bg-rose-950/20 border border-rose-500/30 text-neutral-100 ml-0 mr-auto'
                  : 'bg-neutral-900/80 border border-white/[0.08] text-neutral-200 ml-auto mr-0'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold mb-1 opacity-75">
                <span className={isAgent ? 'text-rose-400 font-bold' : 'text-neutral-300'}>
                  {msg.sender}
                </span>
                <span className="font-mono text-[9px] text-neutral-400">{msg.time}</span>
              </div>
              <p className="font-normal font-sans text-neutral-200">{msg.text}</p>
              <div className="flex justify-end mt-1 opacity-60">
                <CheckCheck className="w-3.5 h-3.5 text-rose-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
