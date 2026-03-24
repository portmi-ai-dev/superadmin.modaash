// app/components/ui/Card.tsx

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
    title?: string;
    subtitle?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
    footer?: ReactNode;
    onClick?: () => void;
    hoverable?: boolean;
}

export default function Card({
    title,
    subtitle,
    children,
    className,
    action,
    footer,
    onClick,
    hoverable = false,
}: CardProps) {
    return (
        <div
            className={cn(
                'bg-white rounded-xl border border-gray-200 overflow-hidden',
                hoverable && 'hover:shadow-lg transition-shadow cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {(title || action) && (
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}

            <div className="p-6">{children}</div>

            {footer && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">{footer}</div>
            )}
        </div>
    );
}