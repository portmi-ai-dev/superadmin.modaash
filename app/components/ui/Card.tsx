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
  gradient?: boolean;
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
  gradient = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300',
        hoverable && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        gradient && 'bg-gradient-to-br from-white to-gray-50',
        className
      )}
      onClick={onClick}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      
      <div className={cn('p-6', !title && !action && 'pt-6')}>{children}</div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}