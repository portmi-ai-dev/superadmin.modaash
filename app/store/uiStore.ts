// app/store/uiStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
    // Sidebar
    sidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;

    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: 'light' | 'dark' | 'system') => void;

    // Loading states
    globalLoading: boolean;
    setGlobalLoading: (loading: boolean) => void;

    // Modal states
    modals: Record<string, boolean>;
    openModal: (modalId: string) => void;
    closeModal: (modalId: string) => void;
    closeAllModals: () => void;

    // Toast (for local toasts, though we use react-hot-toast for most)
    toastMessage: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
    showToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    hideToast: () => void;

    // Confirmation dialog
    confirmDialog: {
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: (() => void) | null;
        onCancel: (() => void) | null;
    };
    showConfirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
    hideConfirm: () => void;

    // View preferences (grid vs table)
    viewMode: Record<string, 'grid' | 'table'>;
    setViewMode: (page: string, mode: 'grid' | 'table') => void;

    // Filters (persisted)
    filters: Record<string, any>;
    setFilter: (page: string, key: string, value: any) => void;
    clearFilters: (page: string) => void;
    clearAllFilters: () => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set, get) => ({
            // Sidebar
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),

            // Theme
            theme: 'light',
            setTheme: (theme) => {
                set({ theme });
                // Apply theme to document
                if (typeof document !== 'undefined') {
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    } else if (theme === 'light') {
                        document.documentElement.classList.remove('dark');
                    } else {
                        // System preference
                        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        if (isDark) {
                            document.documentElement.classList.add('dark');
                        } else {
                            document.documentElement.classList.remove('dark');
                        }
                    }
                }
            },

            // Loading states
            globalLoading: false,
            setGlobalLoading: (loading) => set({ globalLoading: loading }),

            // Modal states
            modals: {},
            openModal: (modalId) => set((state) => ({
                modals: { ...state.modals, [modalId]: true }
            })),
            closeModal: (modalId) => set((state) => ({
                modals: { ...state.modals, [modalId]: false }
            })),
            closeAllModals: () => set({ modals: {} }),

            // Toast
            toastMessage: null,
            showToast: (message, type) => {
                set({ toastMessage: { message, type } });
                // Auto hide after 3 seconds
                setTimeout(() => {
                    if (get().toastMessage?.message === message) {
                        set({ toastMessage: null });
                    }
                }, 3000);
            },
            hideToast: () => set({ toastMessage: null }),

            // Confirmation dialog
            confirmDialog: {
                isOpen: false,
                title: '',
                message: '',
                onConfirm: null,
                onCancel: null,
            },
            showConfirm: (title, message, onConfirm, onCancel) => {
                set({
                    confirmDialog: {
                        isOpen: true,
                        title,
                        message,
                        onConfirm,
                        onCancel: onCancel || null,
                    },
                });
            },
            hideConfirm: () => {
                set({
                    confirmDialog: {
                        isOpen: false,
                        title: '',
                        message: '',
                        onConfirm: null,
                        onCancel: null,
                    },
                });
            },

            // View preferences
            viewMode: {},
            setViewMode: (page, mode) =>
                set((state) => ({
                    viewMode: { ...state.viewMode, [page]: mode }
                })),

            // Filters
            filters: {},
            setFilter: (page, key, value) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        [page]: {
                            ...state.filters[page],
                            [key]: value,
                        },
                    },
                })),
            clearFilters: (page) =>
                set((state) => ({
                    filters: {
                        ...state.filters,
                        [page]: {},
                    },
                })),
            clearAllFilters: () => set({ filters: {} }),
        }),
        {
            name: 'ui-storage',
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                theme: state.theme,
                viewMode: state.viewMode,
                filters: state.filters,
            }),
        }
    )
);