import { User } from '../store/useAuthStore';

/**
 * Get the effective role for a user, forcing SUPER_ADMIN for admin mobile
 * @param user - The user object
 * @returns The effective role string
 */
export const getEffectiveRole = (user: User | null): string => {
  if (!user) return '';
  
  const adminMobile = '9999999999';
  const isAdminUser = user.phone === adminMobile;
  
  return isAdminUser ? 'SUPER_ADMIN' : (user.role || '');
};

/**
 * Check if user is effectively a SUPER_ADMIN
 */
export const isSuperAdmin = (user: User | null): boolean => {
  return getEffectiveRole(user).toLowerCase() === 'super_admin';
};

/**
 * Check if user is effectively a SHOP_OWNER
 */
export const isShopOwner = (user: User | null): boolean => {
  return getEffectiveRole(user).toLowerCase() === 'shop_owner';
};
