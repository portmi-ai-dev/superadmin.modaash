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
    }
};

/**
 * Get token from localStorage
 */
export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove token from localStorage
 */
export const removeToken = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
    }
};

/**
 * Save user to localStorage
 */
export const setUser = (user: SuperAdmin): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
};

/**
 * Get user from localStorage
 */
export const getUser = (): SuperAdmin | null => {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

/**
 * Remove user from localStorage
 */
export const removeUser = (): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(USER_KEY);
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