'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, ApiResponseError } from '@/lib/api';
import { Item, PageResponse } from '@/types';
import { StockBadge } from '@/components/common/Badge';
import {
  BookOpen,
  Search,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  Lock,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const { user, login } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);

  const categories = ['ALL', 'Computer Science', 'Software Engineering', 'Science', 'Security', 'Database Systems'];

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const categoryParam = selectedCategory !== 'ALL' ? selectedCategory : undefined;
      const res = await api.items.getAll({
        search: search.trim() || undefined,
        category: categoryParam,
        page: 0,
        size: 12,
      });
      setItems(res.content || []);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchItems]);

  const handleDemoLogin = async (email: string, roleName: string) => {
    setQuickLoginLoading(roleName);
    try {
      await login({ email, password: 'Password@123' });
    } catch (err) {
      console.error(err);
    } finally {
      setQuickLoginLoading(null);
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 pb-12 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Spring Boot 3 + Next.js App Router Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Enterprise Inventory & Library Management with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Stateless RBAC
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Engineered for high-concurrency library operations. Featuring pessimistic database locking,
          decoupled transactional audit trails, and role-guarded workspaces.
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#catalog-section"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            Browse Live Catalog
            <ArrowRight className="w-4 h-4" />
          </a>
          {!user && (
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-600"
            >
              Sign In to Your Workspace
            </Link>
          )}
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-extrabold text-indigo-400">100%</p>
            <p className="text-xs text-slate-400 mt-1">Concurrency Safe</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-extrabold text-emerald-400">3 Roles</p>
            <p className="text-xs text-slate-400 mt-1">Admin, Staff, Member</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-extrabold text-purple-400">JWT</p>
            <p className="text-xs text-slate-400 mt-1">Stateless Security</p>
          </div>
          <div className="glass-card p-4 rounded-xl text-center">
            <p className="text-2xl font-extrabold text-pink-400">Flyway</p>
            <p className="text-xs text-slate-400 mt-1">Managed Schema</p>
          </div>
        </div>
      </section>

      {/* 2. THREE-ROLE PERSONA SHOWCASE & 1-CLICK DEMO LOGIN */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Select a Workspace Persona</h2>
          <p className="text-slate-400 text-sm">Experience the tailored role interface designed for each user tier.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="glass-panel p-6 rounded-2xl border-purple-500/20 hover:border-purple-500/40 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Administrator Console</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full catalog control, total copy adjustments with active borrow checks, and immutable PostgreSQL audit trails.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Add / Edit / Delete Inventory
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Audit Log Event Stream
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin('admin@libravault.com', 'Admin')}
              disabled={quickLoginLoading !== null}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === 'Admin' ? 'Launching...' : 'Quick Login as Admin'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Staff Card */}
          <div className="glass-panel p-6 rounded-2xl border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Staff Circulation Desk</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Issue loans with row-level pessimistic locking, process returns, calculate late fines, and track overdue loans.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Pessimistic Locked Checkouts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Late Fine Calculation ($0.50/day)
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin('staff@libravault.com', 'Staff')}
              disabled={quickLoginLoading !== null}
              className="w-full py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === 'Staff' ? 'Launching...' : 'Quick Login as Staff'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Member Card */}
          <div className="glass-panel p-6 rounded-2xl border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Member Portal</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Explore catalog availability, track active borrowed books with real-time due date countdowns, and view history.
              </p>
              <ul className="text-xs text-slate-300 space-y-1.5 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Stock Explorer
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Personal &quot;My Bookshelf&quot;
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin('member@libravault.com', 'Member')}
              disabled={quickLoginLoading !== null}
              className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === 'Member' ? 'Launching...' : 'Quick Login as Member'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. LIVE CATALOG EXPLORER SECTION */}
      <section id="catalog-section" className="space-y-6 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-400" />
              Live Library Catalog
            </h2>
            <p className="text-slate-400 text-xs mt-1">Real-time inventory synchronized directly with PostgreSQL.</p>
          </div>

          {/* Search Input */}
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm glass-input"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Book Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="glass-card p-5 rounded-xl animate-pulse h-48 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-5 bg-slate-700/50 rounded-md w-3/4"></div>
                  <div className="h-4 bg-slate-800/50 rounded-md w-1/2"></div>
                </div>
                <div className="h-4 bg-slate-800/50 rounded-md w-1/3"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border-slate-800 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
            <p className="text-slate-300 font-medium">No items found matching your criteria.</p>
            <p className="text-slate-500 text-xs">Try searching for a different title or resetting the category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card p-5 rounded-xl flex flex-col justify-between space-y-4 border border-white/5 hover:border-indigo-500/30"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{item.title}</h3>
                  </div>
                  <p className="text-slate-400 text-xs font-medium">{item.author}</p>
                  <div className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-mono">
                    {item.category}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">ISBN: {item.isbn}</span>
                    <StockBadge available={item.availableCopies} total={item.totalCopies} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ARCHITECTURE HIGHLIGHTS */}
      <section className="glass-panel p-8 rounded-2xl border-white/10 space-y-6">
        <h2 className="text-xl font-bold text-white text-center">Enterprise Technical Architecture</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Database className="w-6 h-6 text-indigo-400 mx-auto" />
            <p className="font-bold text-sm text-white">PostgreSQL 16</p>
            <p className="text-slate-400 text-xs">Flyway V1 & V2 migrations</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Lock className="w-6 h-6 text-purple-400 mx-auto" />
            <p className="font-bold text-sm text-white">Pessimistic Locking</p>
            <p className="text-slate-400 text-xs">SELECT ... FOR UPDATE</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto" />
            <p className="font-bold text-sm text-white">Stateless JWT</p>
            <p className="text-slate-400 text-xs">Spring Security 6 RBAC</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Zap className="w-6 h-6 text-pink-400 mx-auto" />
            <p className="font-bold text-sm text-white">Next.js 15 + Tailwind</p>
            <p className="text-slate-400 text-xs">App Router & Server Ready</p>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          <span className="font-semibold text-white">LibraVault Enterprise</span> — Spring Boot 3 & Next.js System.
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8080'}/swagger-ui.html`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors"
          >
            Swagger API Docs ↗
          </a>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:8080'}/actuator/health`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Actuator Health ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
