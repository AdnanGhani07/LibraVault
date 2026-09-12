'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { BorrowRecord } from '@/types';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/common/Badge';
import {
  RotateCcw,
  BookOpen,
  User,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function StaffReturnsPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
      <StaffReturnsContent />
    </ProtectedRoute>
  );
}

function StaffReturnsContent() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.borrow.getAll(page, 15);
      setRecords(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      toastError('Failed to Load Borrow Records', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, toastError]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleProcessReturn = async (record: BorrowRecord) => {
    setProcessingId(record.id);
    try {
      const updated = await api.borrow.returnItem(record.id);
      if (updated.fineAmount > 0) {
        toastSuccess(
          'Return Processed with Late Fine',
          `Book '${updated.itemTitle}' checked in. Late fine assessed: $${updated.fineAmount.toFixed(2)}`
        );
      } else {
        toastSuccess('Book Returned', `'${updated.itemTitle}' returned on time with $0.00 fine.`);
      }
      fetchRecords();
    } catch (err: any) {
      toastError('Return Failed', err.data?.message || err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <RotateCcw className="w-7 h-7 text-indigo-400" />
            Return Processing Desk
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Check-in returned books, calculate overdue penalty fees ($0.50/day), and replenish library inventory stock.
          </p>
        </div>
        <button
          onClick={fetchRecords}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh Records
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Loan ID &amp; Item</th>
                <th className="py-3.5 px-4">Borrower</th>
                <th className="py-3.5 px-4">Issued &amp; Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Fine Assessed</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
                    Loading circulation records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No circulation records found.
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const isOverdue =
                    rec.status === 'ACTIVE' && new Date(rec.dueDate) < new Date();

                  return (
                    <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-indigo-400 font-bold block">
                          #{rec.id}
                        </span>
                        <p className="font-semibold text-white">{rec.itemTitle}</p>
                        <p className="text-xs text-slate-400 font-mono">ISBN: {rec.itemIsbn}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-semibold text-slate-200">{rec.userName}</p>
                        <p className="text-[11px] text-slate-400">{rec.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                        <p>Issued: {new Date(rec.borrowedAt).toLocaleDateString()}</p>
                        <p className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                          Due: {new Date(rec.dueDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {rec.fineAmount > 0 ? (
                          <span className="text-rose-400 font-bold">${rec.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {rec.status === 'ACTIVE' ? (
                          <button
                            disabled={processingId === rec.id}
                            onClick={() => handleProcessReturn(rec)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center gap-1.5 ml-auto"
                          >
                            {processingId === rec.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            Process Return
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
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
