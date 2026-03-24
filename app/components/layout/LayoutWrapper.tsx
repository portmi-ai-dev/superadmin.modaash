// app/components/layout/LayoutWrapper.tsx

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import Header from './Header';
import Sidebar from './Sidebar';

export default function LayoutWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, checkAuth } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication on mount
    useEffect(() => {
        const authenticated = checkAuth();
        setIsLoading(false);

        // Redirect to login if not authenticated and not on login page
        if (!authenticated && pathname !== '/login') {
            router.push('/login');
        }
    }, []);

    // Don't show layout on login page
    if (pathname === '/login') {
        return <>{children}</>;
    }

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render layout (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0`}>
                <Sidebar />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                <Header
                    onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />
                <main className="pt-16 p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
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