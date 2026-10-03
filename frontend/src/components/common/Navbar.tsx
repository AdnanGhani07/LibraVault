"use client";

import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Activity,
  Bookmark,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { RoleBadge } from "./Badge";

function NavSegmentedPill() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab")?.toUpperCase() || "";

  const isDiscovery = pathname.startsWith("/discovery");
  const isPapersActive = isDiscovery && tab !== "BOOKS";
  const isBooksActive = isDiscovery && tab === "BOOKS";

  return (
    <div className="flex items-center p-1 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-inner">
      <Link
        href="/discovery?tab=PAPERS"
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all",
          isPapersActive
            ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
        )}
      >
        <GraduationCap className="w-4 h-4 text-indigo-300" />
        <span>Research Papers</span>
        <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </Link>

      <Link
        href="/discovery?tab=BOOKS"
        className={cn(
          "flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all",
          isBooksActive
            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/30"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
        )}
      >
        <BookOpen className="w-4 h-4 text-purple-300" />
        <span>Books &amp; Volumes</span>
      </Link>
    </div>
  );
}

function NavSegmentedPillFallback() {
  return (
    <div className="flex items-center p-1 rounded-2xl bg-white/[0.05] border border-white/10">
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400">
        <GraduationCap className="w-4 h-4 text-indigo-300" />
        <span>Research Papers</span>
      </div>
      <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-400">
        <BookOpen className="w-4 h-4 text-purple-300" />
        <span>Books &amp; Volumes</span>
      </div>
    </div>
  );
}

export function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex-1 flex items-center justify-start">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Libra<span className="text-indigo-400">Vault</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Research Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Two Nav Hubs (Research Papers & Books) */}
        <nav className="hidden md:flex items-center justify-center gap-3 flex-initial">
          <Suspense fallback={<NavSegmentedPillFallback />}>
            <NavSegmentedPill />
          </Suspense>

          {role === "ROLE_MEMBER" && (
            <Link
              href="/member/bookshelf"
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border",
                pathname.startsWith("/member")
                  ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/30 shadow-sm shadow-emerald-500/10"
                  : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent",
              )}
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Vault</span>
            </Link>
          )}

          {role === "ROLE_ADMIN" && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
              <Link
                href="/admin/audit"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  pathname.startsWith("/admin/audit")
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                )}
              >
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>Analytics</span>
              </Link>
              <Link
                href="/admin/inventory"
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  pathname.startsWith("/admin/inventory")
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                )}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-purple-400" />
                <span>Inventory</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Right: User Auth Action Cluster */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">
                    {user.fullName}
                  </span>
                  <span className="px-1.5 py-0.2 text-[10px] font-mono bg-slate-800 text-indigo-300 rounded border border-slate-700">
                    ID: #{user.id}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{user.email}</span>
              </div>
              <RoleBadge role={user.role} />
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
