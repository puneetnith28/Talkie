'use client';

import React from 'react';

export function MessagingDemo() {
  const conversation = [
    { sender: 'user', text: 'Hi, I need to reschedule my dental cleaning to Thursday afternoon.', time: '10:14 AM' },
    { sender: 'agent', text: 'Certainly! I have 2:30 PM or 4:00 PM available on Thursday. Which works best for you?', time: '10:14 AM' },
    { sender: 'user', text: 'Let\'s do 4:00 PM please.', time: '10:15 AM' },
    { sender: 'agent', text: 'All set! You are confirmed for Thursday at 4:00 PM with Dr. Harris. A calendar invite has been dispatched.', time: '10:15 AM' },
  ];

  return (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/30">
            💬
          </div>
          <div>
            <div className="text-xs font-bold text-white">Omnichannel SMS Concierge</div>
            <div className="text-[10px] text-zinc-500">+1 (415) 555-0199 • 2-Way Conversational</div>
          </div>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
      </div>

      <div className="space-y-3 min-h-[220px]">
        {conversation.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
              msg.sender === 'agent'
                ? 'bg-purple-600/20 border border-purple-500/30 text-purple-100 ml-0 mr-auto'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-200 ml-auto mr-0'
            }`}
          >
            <div className="text-[10px] opacity-70 font-semibold mb-0.5">
              {msg.sender === 'agent' ? 'AI Assistant' : 'Customer'}
            </div>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}
