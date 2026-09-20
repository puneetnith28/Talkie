'use client';

import React, { useState } from 'react';
import { Button, Textarea } from '@talkie/ui';
import { Send, Loader2, Sparkles, Paperclip } from 'lucide-react';

interface MessageComposerProps {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!text.trim() || sending || disabled) return;
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t border-white/[0.08] bg-[#0a0c10] space-y-2">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder="Type your message... (Press ⌘+Enter to send)"
          rows={2}
          className="w-full rounded-xl bg-black/40 border border-white/[0.08] p-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500/50 resize-none transition-all"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span className="font-mono">{text.length} chars</span>
          <span>•</span>
          <span className="font-mono">{Math.max(1, Math.ceil(text.length / 160))} segment(s)</span>
        </div>

        <Button
          variant="primary"
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="h-8 px-4 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
        >
          {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          <span>Send</span>
        </Button>
      </div>
    </div>
  );
}
