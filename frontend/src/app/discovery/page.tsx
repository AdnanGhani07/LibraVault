'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  BookOpen,
  Sparkles,
  FileText,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  Library,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ResearchPaper, GlobalBook, PaperSummary } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PdfReaderModal } from '@/components/discovery/PdfReaderModal';
import { AiSummaryModal } from '@/components/discovery/AiSummaryModal';
import { MathText } from '@/components/common/MathText';
import { cn } from '@/lib/utils';

type ActiveTab = 'PAPERS' | 'BOOKS';

const PAPER_CATEGORIES = [
  { id: '', label: 'All Disciplines' },
  { id: 'cs.AI', label: 'Artificial Intelligence' },
  { id: 'cs.SE', label: 'Software Engineering' },
  { id: 'cs.DC', label: 'Distributed Systems' },
  { id: 'cs.CR', label: 'Cryptography & Security' },
  { id: 'stat.ML', label: 'Machine Learning' },
  { id: 'cs.DB', label: 'Databases' },
];

const PAPER_QUICK_SEARCHES = [
  'Transformers & Attention',
  'Distributed Consensus Raft',
  'Zero-Knowledge Proofs',
  'PostgreSQL Query Optimization',
  'LLM Inference Acceleration',
  'Microservice Resiliency',
];

const BOOK_QUICK_SEARCHES = [
  'Designing Data-Intensive Applications',
  'Clean Code',
  'Design Patterns Elements of Reusable',
  'Database Internals Alex Petrov',
  'Site Reliability Engineering',
];

function DiscoveryContent() {
  const { isAuthenticated } = useToastContextBridge();
  const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('PAPERS');

  // Search States
  const [paperQuery, setPaperQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [bookQuery, setBookQuery] = useState('');

  // Results
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [paperTotal, setPaperTotal] = useState(0);
  const [paperPage, setPaperPage] = useState(1);
  const [papersLoading, setPapersLoading] = useState(false);

  const [books, setBooks] = useState<GlobalBook[]>([]);
  const [bookTotal, setBookTotal] = useState(0);
  const [bookPage, setBookPage] = useState(1);
  const [booksLoading, setBooksLoading] = useState(false);

  // Expanded Abstracts
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  // Saved Status Map
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  // Modals
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [activePdf, setActivePdf] = useState<{ title: string; url: string; arxivId?: string } | null>(null);

  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<PaperSummary | null>(null);
  const [aiPaperTitle, setAiPaperTitle] = useState('');

  // Fetch Papers
  const fetchPapers = useCallback(async (q = paperQuery, cat = selectedCategory, page = paperPage) => {
    setPapersLoading(true);
    try {
      const res = await api.discovery.getPapers({
        query: q,
        category: cat || undefined,
        page,
        size: 10,
      });
      setPapers(res.papers || []);
      setPaperTotal(res.totalResults || 0);
    } catch (err: any) {
      toastError('Search Failed', err.data?.message || err.message || 'Unable to fetch research papers.');
    } finally {
      setPapersLoading(false);
    }
  }, [paperQuery, selectedCategory, paperPage, toastError]);

  // Fetch Books
  const fetchBooks = useCallback(async (q = bookQuery, page = bookPage) => {
    setBooksLoading(true);
    try {
      const res = await api.discovery.getBooks({
        query: q || 'software engineering',
        page,
        size: 10,
      });
      setBooks(res.books || []);
      setBookTotal(res.totalResults || 0);
    } catch (err: any) {
      toastError('Search Failed', err.data?.message || err.message || 'Unable to fetch global books.');
    } finally {
      setBooksLoading(false);
    }
  }, [bookQuery, bookPage, toastError]);

  const searchParams = useSearchParams();
  const paramQuery = searchParams.get('q') || '';
  const paramTab = searchParams.get('tab');
  const paramCategory = searchParams.get('category') || '';

  // Initial Load from URL params or defaults
  useEffect(() => {
    if (paramTab && paramTab.toUpperCase() === 'BOOKS') {
      setActiveTab('BOOKS');
      const initialBookQ = paramQuery || 'Clean Code';
      setBookQuery(initialBookQ);
      fetchBooks(initialBookQ, 1);
    } else {
      setActiveTab('PAPERS');
      const initialPaperQ = paramQuery || 'transformers';
      const initialCat = paramCategory || (paramQuery ? '' : 'cs.AI');
      setPaperQuery(initialPaperQ);
      if (initialCat) setSelectedCategory(initialCat);
      fetchPapers(initialPaperQ, initialCat, 1);
    }
  }, [paramQuery, paramTab, paramCategory]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'BOOKS' && books.length === 0) {
      fetchBooks('Clean Code', 1);
    }
  };

  const handlePaperSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPaperPage(1);
    fetchPapers(paperQuery, selectedCategory, 1);
  };

  const handleBookSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookPage(1);
    fetchBooks(bookQuery, 1);
  };

  const toggleAbstract = (arxivId: string) => {
    setExpandedAbstracts(prev => ({ ...prev, [arxivId]: !prev[arxivId] }));
  };

  const openPdf = (paper: ResearchPaper) => {
    setActivePdf({ title: paper.title, url: paper.pdfUrl, arxivId: paper.arxivId });
    setPdfModalOpen(true);
  };

  const runAiSummarize = async (paper: ResearchPaper) => {
    setAiPaperTitle(paper.title);
    setAiSummary(null);
    setAiLoading(true);
    setAiModalOpen(true);

    try {
      const summary = await api.ai.summarize({
        arxivId: paper.arxivId,
        title: paper.title,
        abstractText: paper.summary,
      });
      setAiSummary(summary);
    } catch (err: any) {
      toastError('AI Error', 'Failed to generate summary.');
    } finally {
      setAiLoading(false);
    }
  };

  const copyBibtex = (paper: ResearchPaper) => {
    if (paper.bibtex) {
      navigator.clipboard.writeText(paper.bibtex);
      toastSuccess('BibTeX Copied', 'Citation copied to clipboard.');
    }
  };

  const savePaperToVault = async (paper: ResearchPaper) => {
    if (!isAuthenticated) {
      toastInfo('Sign In Required', 'Please log in to bookmark papers to your bookshelf.');
      return;
    }
    try {
      await api.vault.save({
        resourceType: 'RESEARCH_PAPER',
        externalId: paper.arxivId,
        title: paper.title,
        authors: paper.authors.join(', '),
        coverOrPdfUrl: paper.pdfUrl,
        categoryOrYear: paper.primaryCategory,
        notes: `Saved via Live Discovery (${paper.publishedDate})`,
      });
      setSavedMap(prev => ({ ...prev, [paper.arxivId]: true }));
      toastSuccess('Saved to Vault!', `"${paper.title.slice(0, 30)}..." added to your shelf.`);
    } catch (err: any) {
      if (err.status === 409) {
        setSavedMap(prev => ({ ...prev, [paper.arxivId]: true }));
        toastInfo('Already Saved', 'This paper is already in your vault.');
      } else {
        toastError('Save Failed', err.data?.message || err.message);
      }
    }
  };

  const saveBookToVault = async (book: GlobalBook) => {
    if (!isAuthenticated) {
      toastInfo('Sign In Required', 'Please log in to save books to your bookshelf.');
      return;
    }
    try {
      await api.vault.save({
        resourceType: 'EXTERNAL_BOOK',
        externalId: book.openLibraryKey,
        title: book.title,
        authors: book.authors.join(', '),
        coverOrPdfUrl: book.coverUrl || undefined,
        categoryOrYear: book.firstPublishYear ? book.firstPublishYear.toString() : undefined,
        notes: 'Saved from Open Library',
      });
      setSavedMap(prev => ({ ...prev, [book.openLibraryKey]: true }));
      toastSuccess('Saved to Bookshelf!', `"${book.title.slice(0, 30)}..." added to your shelf.`);
    } catch (err: any) {
      if (err.status === 409) {
        setSavedMap(prev => ({ ...prev, [book.openLibraryKey]: true }));
        toastInfo('Already Saved', 'This book is already in your vault.');
      } else {
        toastError('Save Failed', err.data?.message || err.message);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            Live Global Knowledge Discovery & AI Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore 2M+ Academic Papers & World Literature
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Connect directly to live scientific research from <span className="text-indigo-300 font-semibold">arXiv</span> and published books from <span className="text-violet-300 font-semibold">Open Library</span>. Read open-access PDFs, extract instant AI summaries, and curate your personal research vault.
          </p>

          {/* Tab Switcher */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => handleTabChange('PAPERS')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                activeTab === 'PAPERS'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              )}
            >
              <GraduationCap className="w-4 h-4" />
              Scientific Research (arXiv)
            </button>
            <button
              onClick={() => handleTabChange('BOOKS')}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all',
                activeTab === 'BOOKS'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-white/5'
              )}
            >
              <Library className="w-4 h-4" />
              Global Books (Open Library)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESEARCH PAPERS (arXiv) */}
      {/* ========================================================================= */}
      {activeTab === 'PAPERS' && (
        <div className="space-y-6">
          {/* Search & Categories Bar */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <form onSubmit={handlePaperSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search papers (e.g. transformers, consensus, quantum, postgresql)..."
                  value={paperQuery}
                  onChange={e => setPaperQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-white placeholder-slate-400"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setPaperPage(1);
                  fetchPapers(paperQuery, e.target.value, 1);
                }}
                className="px-3.5 py-2.5 rounded-xl text-sm glass-input text-white bg-slate-900 border border-white/10"
              >
                {PAPER_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
                    {cat.label}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={papersLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {papersLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
            </form>

            {/* Quick searches */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Trending Topics:</span>
              {PAPER_QUICK_SEARCHES.map(topic => {
                const isActive = paperQuery === topic;
                return (
                  <button
                    key={topic}
                    onClick={() => {
                      setPaperQuery(topic);
                      setSelectedCategory('');
                      setPaperPage(1);
                      fetchPapers(topic, '', 1);
                    }}
                    className={cn(
                      "px-2.5 py-1 rounded-lg transition-all border text-xs font-medium",
                      isActive
                        ? "bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-sm shadow-indigo-500/20"
                        : "bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200 border-white/10 hover:border-indigo-500/30"
                    )}
                  >
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Found <strong className="text-white">{paperTotal.toLocaleString()}</strong> peer-reviewed papers
              {selectedCategory && ` in ${selectedCategory}`}
            </span>
            <span>Page {paperPage}</span>
          </div>

          {/* Paper Cards List */}
          {papersLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs text-slate-400">Querying arXiv Open Research Index...</p>
            </div>
          ) : papers.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-medium text-white">No research papers found</p>
              <p className="text-xs">Try different keywords or reset category filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {papers.map(paper => {
                const isExpanded = expandedAbstracts[paper.arxivId];
                const isSaved = savedMap[paper.arxivId];

                return (
                  <div
                    key={paper.arxivId}
                    className="glass-panel rounded-2xl p-5 sm:p-6 border border-white/10 hover:border-indigo-500/30 transition-all space-y-4"
                  >
                    {/* Top Row: Meta badges & actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {paper.primaryCategory}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          arXiv:{paper.arxivId}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {paper.publishedDate}
                        </span>
                      </div>

                      {/* Right action icons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyBibtex(paper)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                          title="Copy BibTeX Citation"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cite</span>
                        </button>
                        <button
                          onClick={() => savePaperToVault(paper)}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all',
                            isSaved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                          )}
                          title="Save to My Bookshelf"
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      <MathText text={paper.title} />
                    </h2>

                    {/* Authors */}
                    <div className="flex items-center gap-2 text-xs text-indigo-300/90">
                      <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span className="truncate max-w-xl">{paper.authors.join(', ')}</span>
                    </div>

                    {/* Abstract preview */}
                    <div className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <div className={cn(!isExpanded && 'line-clamp-3')}>
                        <MathText text={paper.summary} />
                      </div>
                      {paper.summary.length > 200 && (
                        <button
                          onClick={() => toggleAbstract(paper.arxivId)}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs mt-1.5 flex items-center gap-1"
                        >
                          {isExpanded ? (
                            <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                          ) : (
                            <>Read Full Abstract <ChevronDown className="w-3.5 h-3.5" /></>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {paper.pdfUrl && (
                          <button
                            onClick={() => openPdf(paper)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-sm shadow-rose-600/20"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Read PDF
                          </button>
                        )}
                        <button
                          onClick={() => runAiSummarize(paper)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-200 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 shadow-sm transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          AI Summarize
                        </button>
                      </div>

                      <a
                        href={paper.absUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                      >
                        View on arXiv <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {papers.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={paperPage <= 1 || papersLoading}
                onClick={() => {
                  const p = paperPage - 1;
                  setPaperPage(p);
                  fetchPapers(paperQuery, selectedCategory, p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400">Page {paperPage}</span>
              <button
                disabled={papers.length < 10 || papersLoading}
                onClick={() => {
                  const p = paperPage + 1;
                  setPaperPage(p);
                  fetchPapers(paperQuery, selectedCategory, p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GLOBAL BOOKS & LITERATURE (Open Library) */}
      {/* ========================================================================= */}
      {activeTab === 'BOOKS' && (
        <div className="space-y-6">
          {/* Book Search Bar */}
          <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
            <form onSubmit={handleBookSearchSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search global books (e.g. Clean Architecture, Designing Data-Intensive Applications)..."
                  value={bookQuery}
                  onChange={e => setBookQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input text-white placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                disabled={booksLoading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors disabled:opacity-50"
              >
                {booksLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search Books
              </button>
            </form>

            {/* Quick searches */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Classics & Engineering:</span>
              {BOOK_QUICK_SEARCHES.map(topic => (
                <button
                  key={topic}
                  onClick={() => {
                    setBookQuery(topic);
                    setBookPage(1);
                    fetchBooks(topic, 1);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-violet-500/20 text-slate-300 hover:text-violet-200 border border-white/10 hover:border-violet-500/30 transition-all"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Found <strong className="text-white">{bookTotal.toLocaleString()}</strong> books on Open Library</span>
            <span>Page {bookPage}</span>
          </div>

          {/* Books Grid */}
          {booksLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-xs text-slate-400">Querying Open Library Database...</p>
            </div>
          ) : books.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border border-white/10 text-slate-400 space-y-2">
              <Library className="w-8 h-8 mx-auto text-slate-500" />
              <p className="text-sm font-medium text-white">No books found</p>
              <p className="text-xs">Try different keywords or author names.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map(book => {
                const isSaved = savedMap[book.openLibraryKey];

                return (
                  <div
                    key={book.openLibraryKey}
                    className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-violet-500/30 transition-all flex gap-4"
                  >
                    {/* Book Cover */}
                    <div className="w-20 h-28 sm:w-24 sm:h-34 rounded-xl bg-slate-800 border border-white/10 flex-shrink-0 overflow-hidden relative shadow-md">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-indigo-950 to-slate-900">
                          <BookOpen className="w-6 h-6 text-indigo-400 mb-1" />
                          <span className="text-[10px] text-slate-400 line-clamp-2">{book.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {book.firstPublishYear && <span>{book.firstPublishYear}</span>}
                          {book.editionCount > 1 && <span>• {book.editionCount} editions</span>}
                          {book.hasFullText && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                              Readable
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-2">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-300 truncate">
                          {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown Author'}
                        </p>
                        {book.isbn && (
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            ISBN: {book.isbn}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 flex items-center justify-between gap-2 border-t border-white/5 mt-2">
                        {book.readUrl ? (
                          <a
                            href={book.readUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                          >
                            Read Online <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span />}

                        <button
                          onClick={() => saveBookToVault(book)}
                          className={cn(
                            'flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                            isSaved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10'
                          )}
                        >
                          {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Bookmark className="w-3.5 h-3.5" />}
                          <span>{isSaved ? 'Saved' : 'Save to Shelf'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Book Pagination */}
          {books.length > 0 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={bookPage <= 1 || booksLoading}
                onClick={() => {
                  const p = bookPage - 1;
                  setBookPage(p);
                  fetchBooks(bookQuery, p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400">Page {bookPage}</span>
              <button
                disabled={books.length < 10 || booksLoading}
                onClick={() => {
                  const p = bookPage + 1;
                  setBookPage(p);
                  fetchBooks(bookQuery, p);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-white/10 text-white disabled:opacity-40"
              >
                Next
              </button>
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

      {/* AI Summary Modal */}
      <AiSummaryModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        summary={aiSummary}
        loading={aiLoading}
        paperTitle={aiPaperTitle}
      />
    </div>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
          <p className="text-slate-400 text-sm">Launching Live Discovery Hub...</p>
        </div>
      }
    >
      <DiscoveryContent />
    </Suspense>
  );
}

// Small hook wrapper to avoid hook cycle issues
function useToastContextBridge() {
  const { isAuthenticated } = useAuth();
  return { isAuthenticated };
}
