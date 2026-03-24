// app/lib/auth.ts

import { SuperAdmin } from '../types';

const TOKEN_KEY = 'super_admin_token';
const USER_KEY = 'super_admin_user';

/**
 * Save token to localStorage
 */
export const setToken = (token: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
        console.log('💾 Token saved to localStorage');
    }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('🔑 Token retrieved:', token ? `${token.substring(0, 20)}...` : 'null');
    return token;
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
        console.log('🗑️ Token removed from localStorage');
    }
};

/**
 * Save user to localStorage
 */
export const setUser = (user: SuperAdmin): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        console.log('💾 User saved to localStorage:', user.email);
    }
};

/**
 * Get user from localStorage
 */
export const getUser = (): SuperAdmin | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    console.log('👤 User retrieved:', user ? user.email : 'null');
    return user;
};

/**
 * Remove user from localStorage
 */
export const removeUser = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
        console.log('🗑️ User removed from localStorage');
    }
};

/**
 * Clear all auth data
 */
export const clearAuth = (): void => {
    removeToken();
    removeUser();
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
};