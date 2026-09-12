'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { RoleBadge } from './Badge';
import {
  BookOpen,
  LayoutDashboard,
  ShieldCheck,
  Bookmark,
  LogOut,
  LogIn,
  UserPlus,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              Libra<span className="text-indigo-400">Vault</span>
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href="/"
            className={cn(
              'px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
              pathname === '/'
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            Catalog Explorer
          </Link>

          {role === 'ROLE_ADMIN' && (
            <>
              <Link
                href="/admin/inventory"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/admin/inventory')
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" />
                Admin Inventory
              </Link>
              <Link
                href="/admin/audit"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/admin/audit')
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                Audit Trail
              </Link>
            </>
          )}

          {role === 'ROLE_STAFF' && (
            <>
              <Link
                href="/staff/checkout"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/staff/checkout')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <Layers className="w-4 h-4 text-indigo-400" />
                Checkout Desk
              </Link>
              <Link
                href="/staff/returns"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/staff/returns')
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                <Bookmark className="w-4 h-4 text-indigo-400" />
                Returns Desk
              </Link>
              <Link
                href="/staff/overdue"
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/staff/overdue')
                    ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )}
              >
                Overdue Monitor
              </Link>
            </>
          )}

          {role === 'ROLE_MEMBER' && (
            <Link
              href="/member/bookshelf"
              className={cn(
                'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all',
                pathname.startsWith('/member')
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              )}
            >
              <Bookmark className="w-4 h-4 text-emerald-400" />
              My Bookshelf
            </Link>
          )}
        </nav>

        {/* User Auth Action Cluster */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-white">{user.fullName}</span>
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
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Join Library
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
