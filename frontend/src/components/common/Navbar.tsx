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
import { Logo } from "@/components/common/Logo";

function NavSegmentedPill({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab")?.toUpperCase() || "";

  const isDiscovery = pathname.startsWith("/discovery");
  const isPapersActive = isDiscovery && tab !== "BOOKS";
  const isBooksActive = isDiscovery && tab === "BOOKS";
  const isVaultActive = pathname.startsWith("/member");

  return (
    <div className="flex items-center p-1 rounded-2xl bg-white/[0.05] border border-white/10 backdrop-blur-md shadow-inner">
      <Link
        href="/discovery?tab=PAPERS"
        className={cn(
          "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
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
          "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
          isBooksActive
            ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-md shadow-purple-500/25 border border-purple-400/30"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
        )}
      >
        <BookOpen className="w-4 h-4 text-purple-300" />
        <span>Books &amp; Volumes</span>
      </Link>

      {isAuthenticated && (
        <Link
          href="/member/bookshelf"
          className={cn(
            "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all",
            isVaultActive
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 border border-emerald-400/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
          )}
        >
          <Bookmark className="w-4 h-4 text-emerald-300" />
          <span>My Vault</span>
        </Link>
      )}
    </div>
  );
}

function NavSegmentedPillFallback() {
  return (
    <div className="flex items-center p-1 rounded-2xl bg-white/[0.05] border border-white/10">
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400">
        <GraduationCap className="w-4 h-4 text-indigo-300" />
        <span>Research Papers</span>
      </div>
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400">
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
          <Logo size="md" />
        </div>

        {/* Center: Unified Navigation Pill */}
        <nav className="hidden md:flex items-center justify-center gap-3 flex-initial">
          <Suspense fallback={<NavSegmentedPillFallback />}>
            <NavSegmentedPill isAuthenticated={isAuthenticated} />
          </Suspense>

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
                <span className="text-xs font-semibold text-white">
                  {user.fullName}
                </span>
                <span className="text-[11px] text-slate-400">{user.email}</span>
              </div>
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
