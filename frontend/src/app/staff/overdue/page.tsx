'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { BorrowRecord } from '@/types';
import { useToast } from '@/context/ToastContext';
import { AlertTriangle, Clock, RotateCcw, Loader2, CheckCircle2 } from 'lucide-react';

export default function StaffOverduePage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
      <StaffOverdueContent />
    </ProtectedRoute>
  );
}

function StaffOverdueContent() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchOverdueRecords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.borrow.getOverdue(page, 15);
      setRecords(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      toastError('Failed to Load Overdue Records', err.message);
    } finally {
      setLoading(false);
    }
  }, [page, toastError]);

  useEffect(() => {
    fetchOverdueRecords();
  }, [fetchOverdueRecords]);

  const handleProcessReturn = async (recordId: number) => {
    setProcessingId(recordId);
    try {
      const updated = await api.borrow.returnItem(recordId);
      toastSuccess('Overdue Loan Returned', `Item checked in. Assessed fine: $${updated.fineAmount.toFixed(2)}`);
      fetchOverdueRecords();
    } catch (err: any) {
      toastError('Return Failed', err.data?.message || err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const calculateDaysOverdue = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.max(1, Math.ceil((now - due) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <AlertTriangle className="w-7 h-7 text-rose-400" />
            Overdue Loans Monitor
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Active loans exceeding due dates. Fines accumulate at the standard policy rate of $0.50 per day late.
          </p>
        </div>
        <button
          onClick={fetchOverdueRecords}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh Overdue
        </button>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border-rose-500/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-rose-300 text-xs uppercase tracking-wider border-b border-rose-500/20 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Book Details</th>
                <th className="py-3.5 px-4">Borrower Account</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-center">Days Overdue</th>
                <th className="py-3.5 px-4 text-center">Accrued Fine</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-rose-400 mb-2" />
                    Scanning overdue loan registry...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <p className="font-semibold text-slate-200">Zero Overdue Records</p>
                      <p className="text-xs text-slate-500">All active loans are currently within their valid loan window.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((rec) => {
                  const daysLate = calculateDaysOverdue(rec.dueDate);
                  const estimatedFine = (daysLate * 0.5).toFixed(2);

                  return (
                    <tr key={rec.id} className="hover:bg-rose-500/[0.03] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-mono text-rose-400 font-bold block">
                          Loan #{rec.id}
                        </span>
                        <p className="font-semibold text-white">{rec.itemTitle}</p>
                        <p className="text-xs text-slate-400 font-mono">ISBN: {rec.itemIsbn}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-semibold text-slate-200">{rec.userName}</p>
                        <p className="text-[11px] text-slate-400">{rec.userEmail}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-rose-300">
                        {new Date(rec.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          {daysLate} {daysLate === 1 ? 'day' : 'days'} late
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-rose-400">
                        ${estimatedFine}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          disabled={processingId === rec.id}
                          onClick={() => handleProcessReturn(rec.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          {processingId === rec.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Check In &amp; Bill
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
