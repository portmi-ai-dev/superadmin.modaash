// app/components/ui/Badge.tsx

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
    size?: 'sm' | 'md';
    children: ReactNode;
    className?: string;
    rounded?: boolean;
}

export default function Badge({
    variant = 'default',
    size = 'md',
    children,
    className,
    rounded = false,
}: BadgeProps) {
    const variants = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
        default: 'bg-gray-100 text-gray-800',
    };

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center font-medium',
                variants[variant],
                sizes[size],
                rounded ? 'rounded-full' : 'rounded-md',
                className
            )}
        >
            {children}
        </span>
    );
}