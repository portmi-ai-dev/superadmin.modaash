// app/components/layout/LayoutWrapper.tsx

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, checkAuth, user } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('📄 LayoutWrapper mounted, pathname:', pathname);
        const authenticated = checkAuth();
        console.log('🔐 Authentication status after checkAuth:', authenticated);
        setIsLoading(false);

        if (!authenticated && pathname !== '/login') {
            console.log('🚨 Not authenticated, redirecting to login...');
            router.push('/login');
        }
    }, []);

    // Don't show layout on login page
    if (pathname === '/login') {
        console.log('📄 On login page, returning children only');
        return <>{children}</>;
    }

    // Show loading spinner while checking auth
    if (isLoading) {
        console.log('⏳ Loading...');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
                    <p className="text-xs text-gray-400 mt-1">Please wait</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render layout (redirect will happen)
    if (!isAuthenticated) {
        console.log('🚫 Not authenticated, returning null');
        return null;
    }

    console.log('✅ Rendering dashboard layout with user:', user?.email);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}>
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : 'lg:ml-0'}`}>
                <main className="p-6 pt-6">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1f2937',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '12px 16px',
                    },
                    success: {
                        duration: 3000,
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        duration: 4000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </div>
    );
}