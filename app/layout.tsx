// app/layout.tsx

import type { Metadata } from 'next';
import LayoutWrapper from './components/layout/LayoutWrapper';
import './globals.css';

export const metadata: Metadata = {
    title: 'Super Admin - MODAASH',
    description: 'Super Admin Dashboard for Manpower Management System',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <LayoutWrapper>
                    {children}
                </LayoutWrapper>
            </body>
        </html>
    );
}