"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  Search,
  Sparkles,
  User as UserIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const TRENDING_SEARCHES = [
  { label: "Transformers & Attention", query: "Transformers", tab: "PAPERS" },
  {
    label: "Distributed Consensus Raft",
    query: "Distributed Consensus Raft",
    tab: "PAPERS",
  },
  {
    label: "LLM Reasoning & Chain-of-Thought",
    query: "Reasoning LLM",
    tab: "PAPERS",
  },
  {
    label: "Designing Data-Intensive Apps",
    query: "Designing Data-Intensive Applications",
    tab: "BOOKS",
  },
  {
    label: "Zero-Knowledge Cryptography",
    query: "Zero-Knowledge Proofs",
    tab: "PAPERS",
  },
];

export default function HomePage() {
  const { user, login } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"PAPERS" | "BOOKS">("PAPERS");
  const [spotlightTab, setSpotlightTab] = useState<
    "AI" | "ABSTRACT" | "BIBTEX"
  >("AI");
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(
    null,
  );

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q =
      searchQuery.trim() ||
      (searchType === "PAPERS" ? "transformers" : "Clean Code");
    router.push(`/discovery?q=${encodeURIComponent(q)}&tab=${searchType}`);
  };

  const handleChipClick = (query: string, tab: string) => {
    router.push(`/discovery?q=${encodeURIComponent(query)}&tab=${tab}`);
  };

  const handleDemoLogin = async (email: string, roleName: string) => {
    setQuickLoginLoading(roleName);
    try {
      await login({ email, password: "Password@123" });
    } catch (err) {
      console.error(err);
    } finally {
      setQuickLoginLoading(null);
    }
  };

  const handleCopyBibtex = () => {
    const bibtex = `@article{vaswani2017attention,
  title={Attention Is All You Need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, Lukasz and Polosukhin, Illia},
  journal={arXiv preprint arXiv:1706.03762},
  year={2017}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION & INTERACTIVE LIVE SEARCH */}
      <section className="relative pt-6 sm:pt-10 pb-4 text-center space-y-8">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-72 bg-gradient-to-b from-indigo-500/15 via-purple-500/10 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Live System Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 shadow-inner backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>Next-Gen Academic Discovery &amp; Scientific Intelligence</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </div>

        {/* Main Hero Headline */}
        <div className="space-y-4 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight sm:leading-none">
            Accelerate Research with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              AI-Powered Intelligence
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Search 2M+ arXiv academic papers and global literature in real time.
            Read full-text PDFs in-browser, distill dense science into 5-part
            executive summaries with{" "}
            <span className="text-indigo-300 font-medium">
              instant AI distillation
            </span>
            , and curate your personal research vault.
          </p>
        </div>

        {/* Interactive Hero Search Console */}
        <div className="max-w-3xl mx-auto">
          <form
            onSubmit={handleHeroSearch}
            className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl space-y-3"
          >
            {/* Search Type Selector */}
            <div className="flex items-center gap-2 px-2 pt-1">
              <button
                type="button"
                onClick={() => setSearchType("PAPERS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  searchType === "PAPERS"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                arXiv Research Papers (2M+)
              </button>
              <button
                type="button"
                onClick={() => setSearchType("BOOKS")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  searchType === "BOOKS"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Open Library Books
              </button>
            </div>

            {/* Input & Action Button */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    searchType === "PAPERS"
                      ? "Search arXiv preprints by title, author, or keyword (e.g. Transformers, Quantum, Raft)..."
                      : "Search millions of global books by title or author (e.g. Clean Code, Petrov)..."
                  }
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 shrink-0 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Trending Query Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 px-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider">
                Trending:
              </span>
              {TRENDING_SEARCHES.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => handleChipClick(chip.query, chip.tab)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-[11px]"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Quick Hub Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/discovery"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-white/10 hover:bg-white/15 border border-white/15 backdrop-blur-md transition-all"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            Launch Full Discovery Hub
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-500"
            >
              Sign In to Your Vault
            </Link>
          ) : (
            <Link
              href={
                user.role === "ROLE_ADMIN"
                  ? "/admin/audit"
                  : "/member/bookshelf"
              }
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
            >
              <span>
                {user.role === "ROLE_ADMIN"
                  ? "Open Admin Analytics"
                  : "Open My Research Vault"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </section>

      {/* 2. INTERACTIVE LIVE SPOTLIGHT DEMO (Attention Is All You Need) */}
      <section className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Platform Capability Preview</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Interactive Landmark Paper Spotlight
            </h2>
          </div>
          <Link
            href="/discovery?q=Attention+Is+All+You+Need&tab=PAPERS"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Search this paper in Discovery Hub{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/20 shadow-2xl relative overflow-hidden space-y-6">
          {/* Header Info */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  arXiv:1706.03762
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Computation and Language (cs.CL)
                </span>
                <span className="text-xs text-slate-400">
                  Published: Jun 12, 2017
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Attention Is All You Need
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit,
                Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/discovery?q=Attention+Is+All+You+Need&tab=PAPERS"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Read In-Browser PDF
              </Link>
            </div>
          </div>

          {/* Spotlight Tab Controls */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setSpotlightTab("AI")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                spotlightTab === "AI"
                  ? "bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-indigo-200 border border-indigo-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI 5-Part Digest
            </button>
            <button
              onClick={() => setSpotlightTab("ABSTRACT")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                spotlightTab === "ABSTRACT"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-300" />
              Original Abstract
            </button>
            <button
              onClick={() => setSpotlightTab("BIBTEX")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                spotlightTab === "BIBTEX"
                  ? "bg-white/10 text-white border border-white/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
              BibTeX Citation
            </button>
          </div>

          {/* Spotlight Tab Content */}
          {spotlightTab === "AI" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/20 space-y-1.5">
                <span className="font-bold text-indigo-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  1. Core Objective
                </span>
                <p className="text-slate-200 leading-relaxed">
                  Eliminate recurring sequential RNN/LSTM operations in sequence
                  modeling by relying exclusively on multi-head self-attention
                  mechanisms.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-purple-500/20 space-y-1.5">
                <span className="font-bold text-purple-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                  2. Methodology
                </span>
                <p className="text-slate-200 leading-relaxed">
                  Encoder-decoder stacked architecture using scaled dot-product
                  multi-head attention, position-wise feed-forward layers, and
                  sinusoidal positional encodings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 space-y-1.5">
                <span className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  3. Key Findings
                </span>
                <p className="text-slate-200 leading-relaxed">
                  Achieved state-of-the-art BLEU score of 28.4 on WMT 2014
                  English-to-German, training in just 3.5 days on 8 P100 GPUs
                  with massive parallelization.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-pink-500/20 space-y-1.5">
                <span className="font-bold text-pink-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-pink-400" />
                  4. Practical Implications
                </span>
                <p className="text-slate-200 leading-relaxed">
                  Became the foundational architecture for modern Generative AI,
                  Large Language Models (LLMs), and multimodal reasoning
                  systems.
                </p>
              </div>
            </div>
          )}

          {spotlightTab === "ABSTRACT" && (
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/5 text-slate-300 text-xs sm:text-sm leading-relaxed space-y-2">
              <p>
                The dominant sequence transduction models are based on complex
                recurrent or convolutional neural networks that include an
                encoder and a decoder. The best performing models also connect
                the encoder and decoder through an attention mechanism. We
                propose a new simple network architecture, the Transformer,
                based solely on attention mechanisms, dispensing with recurrence
                and convolutions entirely.
              </p>
              <p>
                Experiments on two machine translation tasks show these models
                to be superior in quality while being more parallelizable and
                requiring significantly less time to train.
              </p>
            </div>
          )}

          {spotlightTab === "BIBTEX" && (
            <div className="relative p-4 rounded-2xl bg-slate-950 border border-white/10 font-mono text-xs text-indigo-300">
              <pre className="overflow-x-auto whitespace-pre leading-relaxed">
                {`@article{vaswani2017attention,
  title={Attention Is All You Need},
  author={Vaswani, Ashish and Shazeer, Noam and Parmar, Niki and Uszkoreit, Jakob and Jones, Llion and Gomez, Aidan N and Kaiser, Lukasz and Polosukhin, Illia},
  journal={arXiv preprint arXiv:1706.03762},
  year={2017}
}`}
              </pre>
              <button
                onClick={handleCopyBibtex}
                className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
              >
                {copiedBibtex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Copy BibTeX</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. THE THREE PILLARS OF LIBRAVAULT */}
      <section className="space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Engineered for Modern Scientific &amp; Literature Exploration
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            From live open academic archives to multi-tier enterprise
            persistence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="glass-panel p-7 rounded-3xl border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Live arXiv Scientific Index
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Connect directly to 2M+ scholarly preprints across Computer
                Science, AI, Distributed Systems, and Physics. Query live Atom
                XML feeds with anti-XXE safety and open full-text PDFs in our
                zero-download in-browser reader.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Real-time arXiv API integration</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>In-browser full-screen PDF modal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Categorized filters (cs.AI, cs.SE, cs.DC)</span>
                </li>
              </ul>
            </div>
            <Link
              href="/discovery?tab=PAPERS"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
            >
              <span>Explore Research Preprints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel p-7 rounded-3xl border-purple-500/20 hover:border-purple-500/40 transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                AI Research Assistant
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Powered by high-throughput neural intelligence with heuristic
                NLP fallback. Transforms dense 30-page academic texts into
                immediate 5-part executive syntheses: Objectives, Methodology,
                Key Findings, Limitations, and Practical Value.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Structured 5-section cognitive digest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Sub-second response streaming</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Offline heuristic NLP fallback</span>
                </li>
              </ul>
            </div>
            <Link
              href="/discovery"
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
            >
              <span>Test AI Summarizer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel p-7 rounded-3xl border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-5 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Bookmark className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Digital Vault &amp; World Books
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Curate your private research shelf. Bookmark live papers with
                1-click BibTeX citation exports, tag reading progress, and query
                Open Library for millions of global book covers, authors, and
                editions.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Flyway V3 persistent vault bookmarks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1-Click standard BibTeX clipboard export</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>30M+ Open Library book volumes</span>
                </li>
              </ul>
            </div>
            <Link
              href={user ? "/member/bookshelf" : "/login"}
              className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all"
            >
              <span>
                {user ? "View My Research Vault" : "Sign In to Access Vault"}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. RESEARCH CURATION & VAULT WORKFLOW (USER-FOCUSED ONLY) */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
            <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
            <span>Digital Vault Workflow</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            How Researchers &amp; Engineers Use LibraVault
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            From initial preprint discovery to full-text distillation and
            seamless citation management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Search className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              1. Real-Time Discovery
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Instantly query 2M+ arXiv papers and millions of Open Library
              books with specialized category filters and live keyword search.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              2. AI Distillation &amp; PDFs
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Read papers in-browser using our zero-download viewer and generate
              5-part structured executive syntheses within seconds.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-white">
              3. Personal Research Vault
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Bookmark discoveries to your personal shelf, annotate reading
              notes, and export properly formatted BibTeX citations with one
              click.
            </p>
          </div>
        </div>

        {/* 1-Click Demo for Readers/Users */}
        <div className="text-center pt-2">
          {!user && (
            <button
              onClick={() => handleDemoLogin("member@libravault.com", "Member")}
              disabled={quickLoginLoading !== null}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all shadow-lg shadow-emerald-500/10"
            >
              <UserIcon className="w-3.5 h-3.5" />
              {quickLoginLoading === "Member"
                ? "Authenticating..."
                : "Try Instant Demo as Researcher"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* 5. MODERN FOOTER (NEXT.JS 16 & GEMINI ATTRIBUTION HERE ONLY) */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          <span className="font-semibold text-white">
            LibraVault Research Intelligence
          </span>{" "}
          — Spring Boot 3, Next.js 16 &amp; Google Gemini AI.
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/discovery"
            className="hover:text-indigo-400 transition-colors"
          >
            Discovery Hub
          </Link>
          <Link
            href="/member/bookshelf"
            className="hover:text-emerald-400 transition-colors"
          >
            Research Vault
          </Link>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "").replace(/\/api$/, "")}/swagger-ui/index.html`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1"
          >
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "").replace(/\/api$/, "")}/actuator/health`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
          >
            <span>Actuator Health</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
