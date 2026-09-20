'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCheck, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const FULL_CONVERSATION: Message[] = [
  {
    id: '1',
    sender: 'user',
    text: 'Hi, I need to reschedule my dental cleaning to Thursday afternoon.',
    time: '10:14 AM',
  },
  {
    id: '2',
    sender: 'agent',
    text: 'Certainly! I have 2:30 PM or 4:00 PM available on Thursday. Which works best for you?',
    time: '10:14 AM',
  },
  {
    id: '3',
    sender: 'user',
    text: "Let's do 4:00 PM please.",
    time: '10:15 AM',
  },
  {
    id: '4',
    sender: 'agent',
    text: 'All set! You are confirmed for Thursday at 4:00 PM with Dr. Harris. A calendar invite has been dispatched.',
    time: '10:15 AM',
  },
];

export function MessagingDemo() {
  const [visibleCount, setVisibleCount] = useState(1);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= FULL_CONVERSATION.length) {
          return 1; // loop seamlessly
        }
        const next = prev + 1;
        if (FULL_CONVERSATION[next - 1]?.sender === 'agent') {
          setIsAgentTyping(true);
          setTimeout(() => setIsAgentTyping(false), 800);
        }
        return next;
      });
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-3xl bg-zinc-900/95 border border-zinc-800/90 shadow-2xl space-y-4 font-sans backdrop-blur-xl relative overflow-hidden">
      {/* Top ambient purple glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold text-xs border border-purple-500/30 shadow-inner">
            <MessageSquare className="size-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-tight">Omnichannel SMS Concierge</div>
            <div className="text-[10px] text-zinc-400 font-medium">+1 (415) 555-0199 • 2-Way Conversational</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
            Connected
          </span>
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-3 min-h-[235px] max-h-[235px] overflow-y-auto pr-1 flex flex-col justify-start">
        {FULL_CONVERSATION.slice(0, visibleCount).map((msg) => {
          const isAgent = msg.sender === 'agent';
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
                isAgent
                  ? 'bg-purple-600/15 border border-purple-500/30 text-purple-100 ml-0 mr-auto'
                  : 'bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 ml-auto mr-0'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-semibold mb-1 opacity-75">
                <span className={isAgent ? 'text-purple-300 font-bold' : 'text-zinc-300 font-bold'}>
                  {isAgent ? 'AI Assistant' : 'Customer'}
                </span>
                <span className="font-mono text-[9px] text-zinc-400">{msg.time}</span>
              </div>
              <p className="font-normal">{msg.text}</p>
              <div className="flex justify-end mt-1 opacity-60">
                <CheckCheck className="size-3 text-emerald-400" />
              </div>
            </div>
          );
        })}

        {/* Live typing indicator dots */}
        {isAgentTyping && (
          <div className="p-2.5 rounded-2xl bg-purple-600/10 border border-purple-500/20 max-w-[80px] flex items-center justify-center gap-1 animate-pulse ml-0 mr-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-200" />
          </div>
        )}
      </div>
    </div>
  );
}
