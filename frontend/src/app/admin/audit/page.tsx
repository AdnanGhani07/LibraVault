'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { AuditLog } from '@/types';
import { useToast } from '@/context/ToastContext';
import { ShieldCheck, RotateCcw, Loader2, Clock, User, Target, Activity } from 'lucide-react';

export default function AdminAuditPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
      <AdminAuditContent />
    </ProtectedRoute>
  );
}

function AdminAuditContent() {
  const { error: toastError } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.audit.getAll({ page, size: 15 });
      setLogs(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
    } catch (err: any) {
      toastError('Failed to Load Audit Logs', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, toastError]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    if (action.includes('CREATED')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    if (action.includes('RETURNED')) {
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
    if (action.includes('DELETED')) {
      return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    }
    return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
            Immutable Audit Trail
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            System activity event log backed by Spring Application Events &amp; transactional AFTER_COMMIT listeners.
            Total events captured: <span className="text-purple-400 font-semibold">{totalElements}</span>
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh Feed
        </button>
      </div>

      {/* Log Feed Table */}
      <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target</th>
                <th className="py-3.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records captured yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-400 whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {log.actorEmail || 'SYSTEM'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                        {log.targetType} #{log.targetId}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded-lg glass-panel disabled:opacity-40 hover:text-white transition-all"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded-lg glass-panel disabled:opacity-40 hover:text-white transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
