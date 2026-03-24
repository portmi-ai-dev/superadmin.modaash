// app/components/ui/Table.tsx

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => ReactNode;
    className?: string;
    sortable?: boolean;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    className?: string;
    emptyMessage?: string;
    loading?: boolean;
}

export default function Table<T extends Record<string, any>>({
    columns,
    data,
    onRowClick,
    className,
    emptyMessage = 'No data available',
    loading = false,
}: TableProps<T>) {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key as string}
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                    column.className
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                        <tr
                            key={item.id || item._id || index}
                            onClick={() => onRowClick?.(item)}
                            className={cn(
                                onRowClick && 'cursor-pointer hover:bg-gray-50 transition-colors'
                            )}
                        >
                            {columns.map((column) => (
                                <td
                                    key={column.key as string}
                                    className={cn('px-6 py-4 whitespace-nowrap text-sm text-gray-900', column.className)}
                                >
                                    {column.render ? column.render(item) : item[column.key as keyof T]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-12 text-center text-sm text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}