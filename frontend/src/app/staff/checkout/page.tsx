'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { api } from '@/lib/api';
import { Item, BorrowRequest, BorrowRecord } from '@/types';
import { useToast } from '@/context/ToastContext';
import { StockBadge } from '@/components/common/Badge';
import {
  Layers,
  BookOpen,
  User,
  CheckCircle2,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function StaffCheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
      <StaffCheckoutContent />
    </ProtectedRoute>
  );
}

function StaffCheckoutContent() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [memberId, setMemberId] = useState<number | ''>(3); // Default seed member ID is 3
  const [memberEmail, setMemberEmail] = useState('member@libravault.com');
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recentIssued, setRecentIssued] = useState<BorrowRecord | null>(null);

  const fetchAvailableItems = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await api.items.getAll({ page: 0, size: 50 });
      setItems(res.content || []);
      if (res.content && res.content.length > 0) {
        setSelectedItemId(res.content[0].id);
      }
    } catch (err: any) {
      toastError('Failed to load items', err.message);
    } finally {
      setLoadingItems(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchAvailableItems();
  }, [fetchAvailableItems]);

  const selectedItem = items.find((i) => i.id === Number(selectedItemId));

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !memberId) {
      toastError('Invalid Input', 'Please select both an item and member.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: BorrowRequest = {
        memberId: Number(memberId),
        itemId: Number(selectedItemId),
      };
      const record = await api.borrow.issue(payload);
      setRecentIssued(record);
      toastSuccess('Checkout Completed!', `Issued '${record.itemTitle}' to ${record.userEmail}.`);
      fetchAvailableItems();
    } catch (err: any) {
      toastError('Checkout Failed', err.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-indigo-400" />
          Staff Circulation &amp; Issue Desk
        </h1>
        <p className="text-slate-400 text-xs mt-1">
          Perform transactional book checkouts protected by database-level pessimistic write locking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form (2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border-white/10 shadow-2xl space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Issue Book to Member
          </h2>

          <form onSubmit={handleCheckout} className="space-y-5">
            {/* Member Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Borrowing Member ID / Account</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="Member ID (e.g. 3)"
                    value={memberId}
                    onChange={(e) => setMemberId(parseInt(e.target.value) || '')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Member Email note (optional)"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Seeded Member user ID is <span className="text-indigo-400 font-mono font-semibold">3</span> (member@libravault.com).
              </p>
            </div>

            {/* Book Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select Item to Checkout</label>
              {loadingItems ? (
                <div className="p-3 glass-input rounded-xl text-xs text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Loading library titles...
                </div>
              ) : (
                <select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(parseInt(e.target.value) || '')}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input bg-slate-900 text-white"
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900 text-white">
                      {item.title} — {item.availableCopies > 0 ? `In Stock (${item.availableCopies} avail)` : 'OUT OF STOCK (0)'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Book Live Preview Card */}
            {selectedItem && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{selectedItem.title}</p>
                    <p className="text-xs text-slate-400">By {selectedItem.author}</p>
                  </div>
                  <StockBadge available={selectedItem.availableCopies} total={selectedItem.totalCopies} />
                </div>
                <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 font-mono">
                  <span>ISBN: {selectedItem.isbn}</span>
                  <span>Category: {selectedItem.category}</span>
                </div>
                {selectedItem.availableCopies <= 0 && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Zero stock available. Attempting checkout will trigger a 409 Conflict rejection.
                  </p>
                )}
              </div>
            )}

            {/* Loan Terms Summary */}
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
              <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Standard Loan Duration: <strong>14 Days</strong> (Overdue fine rate: $0.50 per day late).</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedItemId || !memberId}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Acquiring Pessimistic Lock &amp; Issuing...
                </>
              ) : (
                'Issue Book Loan'
              )}
            </button>
          </form>
        </div>

        {/* Transaction Feedback Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border-white/10 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Checkout Confirmation
            </h3>
            {recentIssued ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <p className="font-bold text-sm">Loan Record #{recentIssued.id}</p>
                  <p className="mt-1 text-slate-200">Book: {recentIssued.itemTitle}</p>
                  <p className="text-slate-300">Member: {recentIssued.userEmail}</p>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p>
                    <strong>Issued At:</strong> {new Date(recentIssued.borrowedAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {new Date(recentIssued.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Complete a checkout transaction above to view the real-time record confirmation receipt here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
