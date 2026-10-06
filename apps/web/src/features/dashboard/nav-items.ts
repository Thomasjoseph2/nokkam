import { type CurrentUserDto, UserRole } from '@nokkam/shared-types';

export interface NavItem {
  href: string;
  label: string;
}

/** Dashboard sections the user can see, derived from their roles. */
export function navItemsFor(user: CurrentUserDto): NavItem[] {
  const items: NavItem[] = [{ href: '/dashboard/tester', label: 'Explore' }];
  if (user.roles.includes(UserRole.BUSINESS_OWNER))
    items.push({ href: '/dashboard/business', label: 'My business' });
  if (user.roles.includes(UserRole.ADMIN)) items.push({ href: '/dashboard/admin', label: 'Admin' });
  return items;
}

export function homeFor(user: CurrentUserDto): string {
  if (user.roles.includes(UserRole.ADMIN)) return '/dashboard/admin';
  if (user.roles.includes(UserRole.BUSINESS_OWNER)) return '/dashboard/business';
  return '/dashboard/tester';
}
