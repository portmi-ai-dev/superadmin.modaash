// app/components/audit/AuditLogTable.tsx

'use client';

import {
    FiBarChart2,
    FiBriefcase,
    FiDatabase,
    FiDownload,
    FiEye,
    FiFileText,
    FiHome,
    FiLock,
    FiRotateCcw,
    FiTrash2,
    FiUnlock,
    FiUser,
    FiUserCheck,
    FiUserPlus
} from 'react-icons/fi';
import { formatDate } from '../../lib/utils';
import { AuditLog } from '../../types';
import Badge from '../ui/Badge';
import Table from '../ui/Table';

interface AuditLogTableProps {
    logs: AuditLog[];
    onViewDetails?: (log: AuditLog) => void;
}

const getActionIcon = (action: string) => {
    if (action.includes('view')) return <FiEye className="text-blue-500" />;
    if (action.includes('block')) return <FiLock className="text-red-500" />;
    if (action.includes('unblock')) return <FiUnlock className="text-green-500" />;
    if (action.includes('delete')) return <FiTrash2 className="text-red-500" />;
    if (action.includes('restore')) return <FiRotateCcw className="text-green-500" />;
    if (action.includes('export')) return <FiDownload className="text-purple-500" />;
    if (action.includes('stats')) return <FiBarChart2 className="text-indigo-500" />;
    return <FiDatabase className="text-gray-500" />;
};

const getActionBadgeVariant = (action: string): 'danger' | 'warning' | 'success' | 'info' | 'default' => {
    if (action.includes('view')) return 'info';
    if (action.includes('block')) return 'danger';
    if (action.includes('unblock')) return 'success';
    if (action.includes('delete')) return 'danger';
    if (action.includes('restore')) return 'success';
    if (action.includes('export')) return 'warning';
    return 'default';
};

const getTargetIcon = (targetType?: string) => {
    switch (targetType) {
        case 'Company':
            return <FiHome className="text-purple-500" />;
        case 'User':
            return <FiUser className="text-blue-500" />;
        case 'Employer':
            return <FiBriefcase className="text-orange-500" />;
        case 'JobDemand':
            return <FiFileText className="text-red-500" />;
        case 'Worker':
            return <FiUserPlus className="text-pink-500" />;
        case 'SubAgent':
            return <FiUserCheck className="text-indigo-500" />;
        default:
            return <FiDatabase className="text-gray-500" />;
    }
};

export default function AuditLogTable({ logs, onViewDetails }: AuditLogTableProps) {
    const columns = [
        {
            key: 'timestamp',
            header: 'Timestamp',
            render: (log: AuditLog) => (
                <div className="text-sm">
                    <div className="font-medium text-gray-900">{formatDate(log.timestamp)}</div>
                    <div className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            )
        },
        {
            key: 'superAdmin',
            header: 'Super Admin',
            render: (log: AuditLog) => (
                <div>
                    <div className="flex items-center gap-1">
                        <FiUser className="text-gray-400 text-xs" />
                        <span className="font-medium text-gray-900">{log.superAdminId?.fullName || 'Unknown'}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{log.superAdminId?.email || 'No email'}</div>
                </div>
            )
        },
        {
            key: 'action',
            header: 'Action',
            render: (log: AuditLog) => (
                <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                    </Badge>
                </div>
            )
        },
        {
            key: 'target',
            header: 'Target',
            render: (log: AuditLog) => (
                <div className="flex items-center gap-2">
                    {getTargetIcon(log.targetType)}
                    <div>
                        <div className="text-sm text-gray-900">
                            {log.targetType || 'N/A'}
                        </div>
                        {log.targetId && (
                            <div className="text-xs text-gray-400 font-mono">
                                ID: {log.targetId.slice(-8)}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (log: AuditLog) => (
                <div className="max-w-[200px]">
                    {log.reason ? (
                        <span className="text-sm text-gray-600 line-clamp-2">{log.reason}</span>
                    ) : (
                        <span className="text-sm text-gray-400">—</span>
                    )}
                </div>
            )
        },
        {
            key: 'ipAddress',
            header: 'IP Address',
            render: (log: AuditLog) => (
                <span className="text-sm font-mono text-gray-600">{log.ipAddress || 'N/A'}</span>
            )
        },
        {
            key: 'details',
            header: '',
            render: (log: AuditLog) => (
                <button
                    onClick={() => onViewDetails?.(log)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="View details"
                >
                    <FiEye className="text-sm" />
                </button>
            )
        }
    ];

    return (
        <Table
            columns={columns}
            data={logs}
        />
    );
}