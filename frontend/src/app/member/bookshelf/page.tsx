'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { BorrowRecord, SavedResource } from '@/types';
import { useToast } from '@/context/ToastContext';
import { StatusBadge } from '@/components/common/Badge';
import { PdfReaderModal } from '@/components/discovery/PdfReaderModal';
import {
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  User,
  Sparkles,
  FileText,
  Trash2,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';

export default function MemberBookshelfPage() {
  return (
    <ProtectedRoute allowedRoles={['ROLE_MEMBER', 'ROLE_STAFF', 'ROLE_ADMIN']}>
      <MemberBookshelfContent />
    </ProtectedRoute>
  );
}

function MemberBookshelfContent() {
  const { user } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();

  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY' | 'SAVED_VAULT'>('ACTIVE');

  // PDF Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ title: string; url: string; arxivId?: string } | null>(null);

  const fetchMyHistory = useCallback(async () => {
    setLoading(true);
    try {
      const [historyRes, vaultRes] = await Promise.all([
        api.borrow.getMyHistory(0, 50).catch(() => ({ content: [] })),
        api.vault.getMyResources().catch(() => []),
      ]);
      setRecords(historyRes.content || []);
      setSavedResources(vaultRes || []);
    } catch (err: any) {
      toastError('Failed to Load Bookshelf', err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const handleRemoveSaved = async (id: number, title: string) => {
    try {
      await api.vault.remove(id);
      setSavedResources(prev => prev.filter(r => r.id !== id));
      toastSuccess('Removed', `"${title.slice(0, 25)}..." removed from your vault.`);
    } catch (err: any) {
      toastError('Remove Failed', err.data?.message || err.message);
    }
  };

  useEffect(() => {
    fetchMyHistory();
  }, [fetchMyHistory]);

  const activeLoans = records.filter((r) => r.status === 'ACTIVE');
  const pastHistory = records.filter((r) => r.status === 'RETURNED');

  const getDueCountdownBadge = (dueDateStr: string) => {
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Overdue by {Math.abs(diffDays)} {Math.abs(diffDays) === 1 ? 'day' : 'days'}
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <Clock className="w-3.5 h-3.5" />
          Due Today
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Due in {diffDays} days
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
        <Calendar className="w-3.5 h-3.5" />
        Due in {diffDays} days
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header with Digital Membership ID Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-emerald-400" />
              My Bookshelf &amp; Reading Timeline
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Track your currently borrowed books, return countdown timers, and past reading history.
          </p>
        </div>

        {/* Member ID Digital Card Chip */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
              <User className="w-4 h-4" />
              <div className="text-xs">
                <span className="text-slate-400">Membership ID:</span>{' '}
                <span className="font-mono font-bold text-white">#{user.id}</span>
              </div>
            </div>
          )}
          <button
            onClick={fetchMyHistory}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'ACTIVE'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Active Loans ({activeLoans.length})
        </button>
        <button
          onClick={() => setActiveTab('SAVED_VAULT')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'SAVED_VAULT'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Digital Research Vault ({savedResources.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'HISTORY'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          Reading History ({pastHistory.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="glass-panel p-16 text-center rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
          <p className="text-slate-300 text-sm">Loading your personal bookshelf...</p>
        </div>
      ) : activeTab === 'ACTIVE' ? (
        <div className="space-y-4">
          {activeLoans.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border-slate-800 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-base">No active books currently borrowed.</p>
              <p className="text-slate-400 text-xs">
                Explore our live research papers and global books, and bookmark them directly to your Digital Research Vault!
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('SAVED_VAULT')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  View Saved Digital Vault
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className="glass-card p-6 rounded-2xl border border-white/5 hover:border-emerald-500/30 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-white text-lg leading-snug">{loan.itemTitle}</h3>
                    </div>
                    <p className="text-slate-400 text-xs font-mono">ISBN: {loan.itemIsbn}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Borrowed: {new Date(loan.borrowedAt).toLocaleDateString()}
                      </span>
                      {getDueCountdownBadge(loan.dueDate)}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Due by {new Date(loan.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'HISTORY' ? (
        <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Book Title</th>
                  <th className="py-3.5 px-4">Borrowed Date</th>
                  <th className="py-3.5 px-4">Returned Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Late Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No returned reading history found.
                    </td>
                  </tr>
                ) : (
                  pastHistory.map((rec) => (
                    <tr key={rec.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{rec.itemTitle}</p>
                        <p className="text-xs text-slate-400 font-mono">ISBN: {rec.itemIsbn}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                        {new Date(rec.borrowedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-300">
                        {rec.returnedAt ? new Date(rec.returnedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        {rec.fineAmount > 0 ? (
                          <span className="text-rose-400 font-bold">${rec.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {savedResources.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 space-y-3">
              <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
              <p className="font-bold text-white text-base">Your digital vault is currently empty</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                Visit the Live Discovery tab to search 2M+ research papers and books, and click &quot;Save&quot; to bookmark them here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedResources.map((res) => {
                const isPaper = res.resourceType === 'RESEARCH_PAPER';

                return (
                  <div
                    key={res.id}
                    className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${
                          isPaper
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        }`}>
                          {isPaper ? 'arXiv Research' : 'Open Library Book'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          Saved {new Date(res.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {res.title}
                      </h3>

                      {res.authors && (
                        <p className="text-xs text-slate-300 truncate">
                          {res.authors}
                        </p>
                      )}

                      {res.categoryOrYear && (
                        <span className="inline-block text-[11px] font-mono text-slate-400">
                          {res.categoryOrYear}
                        </span>
                      )}

                      {res.notes && (
                        <p className="text-xs text-slate-400 italic bg-white/5 p-2 rounded-lg">
                          &ldquo;{res.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPaper && res.coverOrPdfUrl && (
                          <button
                            onClick={() => {
                              setActivePdf({
                                title: res.title,
                                url: res.coverOrPdfUrl!,
                                arxivId: res.externalId,
                              });
                              setPdfModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Read PDF
                          </button>
                        )}
                        {!isPaper && res.externalId && (
                          <a
                            href={`https://openlibrary.org/works/${res.externalId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-violet-300 hover:text-white"
                          >
                            Open Library <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <button
                        onClick={() => handleRemoveSaved(res.id, res.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Remove from vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PDF Modal Viewer */}
      {activePdf && (
        <PdfReaderModal
          isOpen={pdfModalOpen}
          onClose={() => setPdfModalOpen(false)}
          title={activePdf.title}
          pdfUrl={activePdf.url}
          arxivId={activePdf.arxivId}
        />
      )}
    </div>
  );
}
