'use client';

import React from 'react';

export function TranscriptionDemo() {
  const turns = [
    { speaker: 'Caller', time: '00:02', text: "Can you confirm the refund policy for enterprise annual subscriptions?" },
    { speaker: 'AI Agent', time: '00:05', text: "Yes. Enterprise plans include a 30-day money-back guarantee with zero cancellation fees." },
    { speaker: 'Caller', time: '00:09', text: "Fantastic. Can you email me the invoice?" },
    { speaker: 'AI Agent', time: '00:11', text: "Sent to your primary account email just now. Anything else I can assist with?" },
  ];

  return (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs border border-blue-500/30">
            🎙️
          </div>
          <div>
            <div className="text-xs font-bold text-white">Live Real-Time Transcription</div>
            <div className="text-[10px] text-zinc-500">Deepgram Nova-2 • 98.4% Accuracy</div>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
          Streaming
        </span>
      </div>

      <div className="space-y-2.5 font-mono text-xs min-h-[220px]">
        {turns.map((t, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mb-1">
              <span className={t.speaker === 'AI Agent' ? 'text-blue-400 font-bold' : 'text-zinc-300 font-bold'}>
                {t.speaker}
              </span>
              <span>{t.time}</span>
            </div>
            <p className="text-zinc-200 font-sans text-xs">{t.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
