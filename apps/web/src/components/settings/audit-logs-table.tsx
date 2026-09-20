'use client';

import React from 'react';

interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadataJson?: string;
  createdAt: string;
  user?: {
    email: string;
    name?: string;
  };
}

export function AuditLogsTable({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center py-10 text-zinc-500 text-xs font-mono">
        No security audit events recorded yet.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
      <h3 className="text-base font-bold text-white">Compliance & Audit Trail</h3>
      <p className="text-xs text-zinc-400">Immutable record of administrative changes, security modifications, and billing actions.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400">
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Action</th>
              <th className="py-2.5 px-3">Resource</th>
              <th className="py-2.5 px-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                <td className="py-2.5 px-3 text-zinc-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-medium text-white">
                  {log.user?.email || log.userId || 'System'}
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-zinc-700/60">
                    {log.action}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-zinc-400 capitalize">
                  {log.resourceType}
                </td>
                <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px] truncate max-w-xs">
                  {log.metadataJson || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
