'use client';

import React from 'react';
import { Textarea, Badge } from '@talkie/ui';
import { Sparkles, Code2, Tag } from 'lucide-react';

interface PromptEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const TEMPLATE_VARIABLES = [
  { tag: '{{contact.name}}', description: 'Caller Name' },
  { tag: '{{contact.company}}', description: 'Company Name' },
  { tag: '{{phone_number}}', description: 'Dialed Number' },
  { tag: '{{current_time}}', description: 'Current Timestamp' },
];

export function PromptEditor({ value, onChange, disabled }: PromptEditorProps) {
  const estimatedTokens = Math.round((value?.length || 0) / 4);

  const insertVariable = (tag: string) => {
    onChange(`${value} ${tag} `);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Insert dynamic context variables:</span>
        </div>
        <div className="flex items-center gap-2">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => insertVariable(v.tag)}
              disabled={disabled}
              className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/20 text-neutral-300 border border-white/[0.08] transition-colors font-mono text-[11px] flex items-center gap-1"
            >
              <Tag className="w-2.5 h-2.5 text-emerald-400" />
              <span>{v.tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Textarea
          rows={7}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="You are a professional AI voice agent for..."
          className="font-mono text-xs leading-relaxed bg-[#0a0c10] border-white/[0.08] focus:border-emerald-500/40 p-4"
        />

        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <Badge
            variant="neutral"
            className="text-[10px] font-mono bg-black/60 backdrop-blur-sm border-white/[0.1] text-neutral-300"
          >
            {estimatedTokens} tokens
          </Badge>
        </div>
      </div>
    </div>
  );
}
