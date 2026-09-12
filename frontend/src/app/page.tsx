"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Cloud,
  Database,
  Layers,
  Lock,
  Server,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const { user, login } = useAuth();
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(
    null,
  );

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

  return (
    <div className="space-y-20 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 pb-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Spring Boot 3 + Next.js App Router Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight sm:leading-none">
          Enterprise Inventory & Library Management with{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Stateless RBAC
          </span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Engineered for high-concurrency operations. Featuring row-level
          pessimistic database locking, transactional audit trail streams, and
          role-guarded enterprise workspaces.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/catalog"
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            Explore Live Catalog
            <ArrowRight className="w-4 h-4" />
          </Link>
          {!user ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-500"
            >
              Sign In to Your Workspace
            </Link>
          ) : (
            <Link
              href={
                user.role === "ROLE_ADMIN"
                  ? "/admin/inventory"
                  : user.role === "ROLE_STAFF"
                    ? "/staff/checkout"
                    : "/member/bookshelf"
              }
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 transition-all"
            >
              Open Active Portal ({user.role.replace("ROLE_", "")})
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10">
          <div className="glass-card p-4 rounded-2xl text-center border-white/5">
            <p className="text-2xl font-extrabold text-indigo-400">100%</p>
            <p className="text-xs text-slate-400 mt-1">Concurrency Safe</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border-white/5">
            <p className="text-2xl font-extrabold text-emerald-400">
              3 Personas
            </p>
            <p className="text-xs text-slate-400 mt-1">Admin, Staff, Member</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border-white/5">
            <p className="text-2xl font-extrabold text-purple-400">JJWT 0.12</p>
            <p className="text-xs text-slate-400 mt-1">Stateless Security</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border-white/5">
            <p className="text-2xl font-extrabold text-pink-400">Flyway</p>
            <p className="text-xs text-slate-400 mt-1">Managed Migrations</p>
          </div>
        </div>
      </section>

      {/* 2. THREE-ROLE PERSONA SHOWCASE & 1-CLICK DEMO LOGIN */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Interactive Persona Portals
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Test real role-based permission boundaries with pre-seeded accounts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="glass-panel p-6 rounded-3xl border-purple-500/20 hover:border-purple-500/40 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Administrator Console
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Full inventory CRUD control, total copy adjustments with safety
                checks, and immutable PostgreSQL audit trail stream.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Inventory Catalog Management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Real-time Audit Log Inspector</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin("admin@libravault.com", "Admin")}
              disabled={quickLoginLoading !== null}
              className="w-full py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === "Admin"
                ? "Authenticating..."
                : "Launch as Admin"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Staff Card */}
          <div className="glass-panel p-6 rounded-3xl border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white">
                Staff Circulation Desk
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Issue loans with row-level pessimistic locking, process returns,
                calculate late fines, and monitor overdue records.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Pessimistic-Locked Checkouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Late Fine Engine ($0.50/day)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin("staff@libravault.com", "Staff")}
              disabled={quickLoginLoading !== null}
              className="w-full py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === "Staff"
                ? "Authenticating..."
                : "Launch as Staff"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Member Card */}
          <div className="glass-panel p-6 rounded-3xl border-emerald-500/20 hover:border-emerald-500/40 transition-all space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Member Portal</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track active borrowed books with real-time due date countdowns,
                explore catalog stock, and review reading history.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Personal &quot;My Bookshelf&quot;</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Due Date Countdown Timers</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLogin("member@libravault.com", "Member")}
              disabled={quickLoginLoading !== null}
              className="w-full py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              {quickLoginLoading === "Member"
                ? "Authenticating..."
                : "Launch as Member"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. TECHNICAL ARCHITECTURE GRID */}
      <section className="glass-panel p-8 sm:p-10 rounded-3xl border-white/10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">
            Enterprise Engineering Architecture
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Built on industry-standard patterns for durability and performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <Database className="w-6 h-6 text-indigo-400" />
            <p className="font-bold text-sm text-white">PostgreSQL 16</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Flyway migrations with automated version tracking and relational
              integrity constraints.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <Lock className="w-6 h-6 text-purple-400" />
            <p className="font-bold text-sm text-white">Pessimistic Locking</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              <code className="text-purple-300 font-mono">
                SELECT ... FOR UPDATE
              </code>{" "}
              prevents race conditions under high concurrent checkouts.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <Server className="w-6 h-6 text-emerald-400" />
            <p className="font-bold text-sm text-white">
              Spring Boot 3 + Java 21
            </p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Decoupled{" "}
              <code className="text-emerald-300 font-mono">AFTER_COMMIT</code>{" "}
              event listeners for reliable transactional audit logging.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2.5">
            <Cloud className="w-6 h-6 text-pink-400" />
            <p className="font-bold text-sm text-white">Cloud Native DevOps</p>
            <p className="text-slate-400 text-xs leading-relaxed">
              Multi-stage Docker images, Kubernetes manifests, and automated
              GitHub Actions CI/CD pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          <span className="font-semibold text-white">
            LibraVault Enterprise
          </span>{" "}
          — Spring Boot 3 &amp; Next.js 15 System.
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="hover:text-indigo-400 transition-colors"
          >
            Catalog Explorer
          </Link>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "").replace(/\/api$/, "")}/swagger-ui/index.html`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors"
          >
            Swagger API Docs ↗
          </a>
          <a
            href={`${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "").replace(/\/api$/, "")}/actuator/health`}
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
