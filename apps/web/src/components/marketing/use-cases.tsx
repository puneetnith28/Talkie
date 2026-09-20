import React from 'react';

export function MarketingUseCases() {
  const cases = [
    {
      icon: '🎧',
      title: 'Customer Support & Helpdesk',
      desc: 'Resolve 80%+ of incoming phone inquiries without human escalation. Instantly retrieve CRM customer context and answer questions.',
      tag: 'Inbound Telephony',
    },
    {
      icon: '📈',
      title: 'Outbound Sales & Lead Qualification',
      desc: 'Call newly submitted web leads within 30 seconds. Qualify intent, answer pricing queries, and book demo appointments onto sales reps calendars.',
      tag: 'Speed to Lead',
    },
    {
      icon: '🔐',
      title: '2FA & Critical Security Verification',
      desc: 'Deliver time-sensitive one-time passcodes and urgent account security verification alerts over high-deliverability carrier routes.',
      tag: 'Security & Auth',
    },
    {
      icon: '🤖',
      title: 'Autonomous Coding & AI Tools (MCP)',
      desc: 'Give Claude Code, Cursor, and custom agentic frameworks their own live phone numbers to call humans, order parts, and verify setups.',
      tag: 'MCP & Agents',
    },
  ];

  return (
    <section id="use-cases" className="py-20 bg-zinc-950/40 border-t border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">
            Production Applications
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for High-Scale Enterprise Voice
          </h3>
          <p className="text-sm text-zinc-400 mt-2">
            Talkie powers mission-critical AI phone operations from fast-growing startups to high-throughput enterprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cases.map((c) => (
            <div
              key={c.title}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition group shadow-xl"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl mb-4 border border-zinc-700/60 shadow-inner">
                  {c.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {c.tag}
                </span>
                <h4 className="text-lg font-bold text-white mt-3 mb-2">{c.title}</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
