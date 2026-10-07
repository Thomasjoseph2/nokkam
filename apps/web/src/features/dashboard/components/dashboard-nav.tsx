'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/components/ui/cn';
import type { NavItem } from '../nav-items';

function NavLink({ item, mobile }: { item: NavItem; mobile: boolean }) {
  const active = usePathname().startsWith(item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative font-semibold transition-colors',
        mobile
          ? 'flex flex-1 items-center justify-center py-3.5 text-sm'
          : 'rounded-full px-4 py-2 text-sm',
        active ? 'text-brand-700' : 'text-muted hover:text-brand-800',
        active && !mobile && 'bg-gradient-brand-soft ring-1 ring-brand-200',
        !active && !mobile && 'hover:bg-brand-50',
        // Mobile: a gradient indicator bar on the active tab.
        mobile &&
          active &&
          'before:absolute before:inset-x-6 before:top-0 before:h-0.5 before:rounded-full before:bg-gradient-brand',
      )}
    >
      {item.label}
    </Link>
  );
}

/** Pill tabs in the header on tablet/desktop. */
export function DashboardNav({ items }: { items: NavItem[] }) {
  return (
    <nav aria-label="Dashboard" className="hidden items-center gap-1 sm:flex">
      {items.map((item) => (
        <NavLink key={item.href} item={item} mobile={false} />
      ))}
    </nav>
  );
}

/**
 * Thumb-reachable bottom tab bar on phones. Must be rendered outside any element with
 * backdrop-filter/transform, which would become its containing block and un-fix it.
 */
export function DashboardBottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Dashboard (mobile)"
      className="glass fixed inset-x-0 bottom-0 z-30 flex border-t border-brand-100 pb-[env(safe-area-inset-bottom)] sm:hidden"
    >
      {items.map((item) => (
        <NavLink key={item.href} item={item} mobile />
      ))}
    </nav>
  );
}
