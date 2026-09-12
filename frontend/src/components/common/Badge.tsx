import React from 'react';
import { cn } from '@/lib/utils';
import { Role, BorrowStatus } from '@/types';

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const configs = {
    ROLE_ADMIN: {
      label: 'Admin',
      classes: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    },
    ROLE_STAFF: {
      label: 'Staff',
      classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    ROLE_MEMBER: {
      label: 'Member',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
  };

  const config = configs[role] || configs.ROLE_MEMBER;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface StockBadgeProps {
  available: number;
  total: number;
  className?: string;
}

export function StockBadge({ available, total, className }: StockBadgeProps) {
  if (available <= 0) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-rose-500/15 text-rose-300 border-rose-500/30',
          className
        )}
      >
        Out of Stock (0/{total})
      </span>
    );
  }

  if (available <= 2) {
    return (
      <span
        className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-amber-500/15 text-amber-300 border-amber-500/30',
          className
        )}
      >
        Low Stock ({available}/{total})
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        className
      )}
    >
      Available ({available}/{total})
    </span>
  );
}

interface StatusBadgeProps {
  status: BorrowStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs = {
    ACTIVE: {
      label: 'Active Loan',
      classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    },
    RETURNED: {
      label: 'Returned',
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
    OVERDUE: {
      label: 'Overdue',
      classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
  };

  const config = configs[status] || configs.ACTIVE;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
