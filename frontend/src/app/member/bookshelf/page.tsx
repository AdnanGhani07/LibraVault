"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MathText } from "@/components/common/MathText";
import { PdfReaderModal } from "@/components/discovery/PdfReaderModal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { api } from "@/lib/api";
import { SavedResource } from "@/types";
import {
  Bookmark,
  BookOpen,
  Copy,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers,
  Loader2,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function MemberBookshelfPage() {
  return (
    <ProtectedRoute allowedRoles={["ROLE_MEMBER", "ROLE_ADMIN"]}>
      <MemberBookshelfContent />
    </ProtectedRoute>
  );
}

type VaultFilter = "ALL" | "PAPERS" | "BOOKS";

function MemberBookshelfContent() {
  const { user } = useAuth();
  const {
    error: toastError,
    success: toastSuccess,
    info: toastInfo,
  } = useToast();

  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<VaultFilter>("ALL");

  // PDF Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{
    title: string;
    url: string;
    arxivId?: string;
  } | null>(null);

  const fetchVault = useCallback(async () => {
    setLoading(true);
    try {
      const vaultRes = await api.vault.getMyResources().catch(() => []);
      setSavedResources(vaultRes || []);
    } catch (err: any) {
      toastError("Failed to Load Vault", err.message);
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  const handleRemoveSaved = async (id: number, title: string) => {
    try {
      await api.vault.remove(id);
      setSavedResources((prev) => prev.filter((r) => r.id !== id));
      toastSuccess(
        "Removed",
        `"${title.slice(0, 30)}..." removed from your vault.`,
      );
    } catch (err: any) {
      toastError("Remove Failed", err.data?.message || err.message);
    }
  };

  const copyCitation = (res: SavedResource) => {
    const citation =
      res.resourceType === "RESEARCH_PAPER"
        ? `@article{arxiv_${(res.externalId || "").replace(/[^a-zA-Z0-9]/g, "_")},\n  title={${res.title}},\n  author={${res.authors || "Unknown"}},\n  journal={arXiv preprint arXiv:${res.externalId || ""}},\n  year={${res.categoryOrYear || "2024"}}\n}`
        : `${res.authors || "Unknown"}. "${res.title}". ${res.categoryOrYear || ""}.`;

    navigator.clipboard.writeText(citation);
    toastInfo("Citation Copied", "BibTeX citation copied to clipboard.");
  };

  useEffect(() => {
    fetchVault();
  }, [fetchVault]);

  const papersCount = savedResources.filter(
    (r) => r.resourceType === "RESEARCH_PAPER",
  ).length;
  const booksCount = savedResources.filter(
    (r) => r.resourceType === "EXTERNAL_BOOK",
  ).length;

  const filteredResources = savedResources.filter((r) => {
    if (filter === "PAPERS") return r.resourceType === "RESEARCH_PAPER";
    if (filter === "BOOKS") return r.resourceType === "EXTERNAL_BOOK";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
              <Bookmark className="w-7 h-7 text-emerald-400" />
              Personal Research Vault
            </h1>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Curate peer-reviewed preprints, annotated research papers, volumes,
            and BibTeX citations.
          </p>
        </div>

        {/* Refresh Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={fetchVault}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            filter === "ALL"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Layers className="w-4 h-4" />
          All Resources ({savedResources.length})
        </button>
        <button
          onClick={() => setFilter("PAPERS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            filter === "PAPERS"
              ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-300" />
          Research Papers ({papersCount})
        </button>
        <button
          onClick={() => setFilter("BOOKS")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            filter === "BOOKS"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-300" />
          Books &amp; Volumes ({booksCount})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="glass-panel p-16 text-center rounded-2xl border border-white/10">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
          <p className="text-slate-300 text-sm">
            Loading your curated research vault...
          </p>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="glass-panel p-14 text-center rounded-2xl border border-white/10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <p className="font-bold text-white text-base">
              Your Research Vault is currently empty
            </p>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Explore 2M+ arXiv peer-reviewed preprints or 30M+ global volumes
              and click &quot;Save to Vault&quot; to bookmark them here.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/discovery?tab=PAPERS"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20"
            >
              <GraduationCap className="w-4 h-4" />
              Explore Research Papers
            </Link>
            <Link
              href="/discovery?tab=BOOKS"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              Explore Books &amp; Volumes
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredResources.map((res) => {
            const isPaper = res.resourceType === "RESEARCH_PAPER";

            return (
              <div
                key={res.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 flex flex-col justify-between space-y-3 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md ${
                        isPaper
                          ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      }`}
                    >
                      {isPaper ? "arXiv Preprint" : "Open Library Book"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      Saved {new Date(res.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                    <MathText text={res.title} />
                  </h3>

                  {res.authors && (
                    <p className="text-xs text-slate-300 truncate">
                      {res.authors}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    {res.categoryOrYear && (
                      <span className="inline-block text-[11px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                        {res.categoryOrYear}
                      </span>
                    )}
                    {res.externalId && (
                      <span className="text-[11px] font-mono text-slate-500">
                        {isPaper
                          ? `arXiv:${res.externalId}`
                          : `ID: ${res.externalId}`}
                      </span>
                    )}
                  </div>

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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm shadow-rose-600/20"
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
                        className="flex items-center gap-1 text-xs text-purple-300 hover:text-white"
                      >
                        Open Library <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => copyCitation(res)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                      title="Copy BibTeX Citation"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>BibTeX</span>
                    </button>
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
