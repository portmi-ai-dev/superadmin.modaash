// app/(dashboard)/layout.tsx

'use client';

import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This layout is just a wrapper - the actual layout is in LayoutWrapper
  return children;
}