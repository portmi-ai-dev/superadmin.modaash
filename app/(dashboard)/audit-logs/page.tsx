// app/(dashboard)/audit-logs/page.tsx

'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiActivity,
    FiCalendar,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiDownload,
    FiEye,
    FiFilter,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiUser,
    FiX,
    FiTrendingUp,
    FiAlertCircle,
    FiLock
} from 'react-icons/fi';
import AuditLogDetailsModal from '../../components/audit/AuditLogDetailsModal';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { AuditLog } from '../../types';

interface AuditLogsResponse {
    success: boolean;
    data: AuditLog[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

type ActionType =
    | 'all'
    | 'view_companies'
    | 'view_company_details'
    | 'view_users'
    | 'view_employers'
    | 'view_job_demands'
    | 'view_workers_masked'
    | 'view_workers_unmasked'
    | 'block_company'
    | 'unblock_company'
    | 'block_user'
    | 'unblock_user'
    | 'delete_employer'
    | 'restore_employer'
    | 'delete_worker'
    | 'restore_worker'
    | 'delete_job_demand'
    | 'restore_job_demand'
    | 'delete_sub_agent'
    | 'restore_sub_agent'
    | 'export_for_analysis'
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'password_change';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionType, setActionType] = useState<ActionType>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchAuditLogs();
    }, [page, actionType, startDate, endDate]);

    const fetchAuditLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '50');
            if (actionType !== 'all') params.append('action', actionType);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await superAdminClient.get(`/audit-logs?${params}`);
            const responseData = response.data as AuditLogsResponse;

            setLogs(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalLogs(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch audit logs:', error);
            toast.error(error?.response?.data?.message || 'Failed to load audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting audit logs:\n' +
            'Examples:\n' +
            '- Compliance audit report\n' +
            '- Security investigation\n' +
            '- Monthly review\n' +
            '- Regulatory requirement'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (actionType !== 'all') params.append('action', actionType);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('reason', reason);

            const response = await superAdminClient.get(`/audit-logs/export?${params}`, {
                responseType: 'blob'
            });

            // response.data is the blob
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${new Date().toISOString().slice(0, 19)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export started (access logged)');
        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to export logs');
        } finally {
            setExporting(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchAuditLogs();
    };

    const clearFilters = () => {
        setSearch('');
        setActionType('all');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setModalOpen(true);
    };

    const actionOptions = [
        { value: 'all', label: 'All Actions' },
        { value: 'view_companies', label: 'View Companies' },
        { value: 'view_company_details', label: 'View Company Details' },
        { value: 'view_users', label: 'View Users' },
        { value: 'view_employers', label: 'View Employers' },
        { value: 'view_job_demands', label: 'View Job Demands' },
        { value: 'view_workers_masked', label: 'View Workers (Masked)' },
        { value: 'view_workers_unmasked', label: 'View Workers (Unmasked - Sensitive)' },
        { value: 'block_company', label: 'Block Company' },
        { value: 'unblock_company', label: 'Unblock Company' },
        { value: 'block_user', label: 'Block User' },
        { value: 'unblock_user', label: 'Unblock User' },
        { value: 'delete_employer', label: 'Delete Employer' },
        { value: 'restore_employer', label: 'Restore Employer' },
        { value: 'delete_worker', label: 'Delete Worker' },
        { value: 'restore_worker', label: 'Restore Worker' },
        { value: 'delete_job_demand', label: 'Delete Job Demand' },
        { value: 'restore_job_demand', label: 'Restore Job Demand' },
        { value: 'delete_sub_agent', label: 'Delete Sub Agent' },
        { value: 'restore_sub_agent', label: 'Restore Sub Agent' },
        { value: 'export_for_analysis', label: 'Export for Analysis' },
        { value: 'login_success', label: 'Login Success' },
        { value: 'login_failed', label: 'Login Failed' },
        { value: 'logout', label: 'Logout' },
        { value: 'password_change', label: 'Password Change' },
    ];

    // Calculate stats
    const uniqueAdmins = new Set(logs.map(l => l.superAdminId?._id)).size;
    const sensitiveActions = logs.filter(l => l.action.includes('unmask')).length;
    const blockActions = logs.filter(l => l.action.includes('block')).length;
    const deleteActions = logs.filter(l => l.action.includes('delete')).length;
    const activityRate = totalLogs > 0 ? Math.round((blockActions + deleteActions) / totalLogs * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            <div className="max-w-[1600px] mx-auto px-8 py-10">

                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">SECURITY & COMPLIANCE</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                Audit Logs
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Track all super admin activities for security and compliance
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchAuditLogs}
                                disabled={loading}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={exporting}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                            >
                                {exporting ? (
                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
                                ) : (
                                    <FiDownload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                                )}
                                <span>{exporting ? 'Exporting...' : 'Export'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 rounded-2xl p-6 mb-10 border border-indigo-200">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FiShield className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-indigo-800">🔒 Compliance & Security</h3>
                            <p className="text-sm text-indigo-700 mt-1">
                                All super admin actions are logged for audit purposes. This includes viewing sensitive data,
                                blocking users/companies, and exporting data. Logs are retained for 1 year.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-5 gap-5 mb-10">
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <FiActivity className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Total</span>
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalLogs.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Actions</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUser className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{uniqueAdmins}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-light">Active Admins</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiLock className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{sensitiveActions}</p>
                        <p className="text-xs text-rose-600 mt-1 font-light">Sensitive Access</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiAlertCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{blockActions + deleteActions}</p>
                        <p className="text-xs text-orange-600 mt-1 font-light">Actions Taken</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiTrendingUp className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{activityRate}%</p>
                        <p className="text-xs text-purple-600 mt-1 font-light">Activity Rate</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by admin name, email, or IP..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative flex-1 max-w-xs">
                            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value as ActionType)}
                                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            >
                                {actionOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                placeholder="From"
                            />
                        </div>
                        <div className="relative">
                            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                placeholder="To"
                            />
                        </div>
                        {(search || actionType !== 'all' || startDate || endDate) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <div className="flex-1 text-right text-xs text-gray-300">
                            {logs.length} of {totalLogs} results
                        </div>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(search || actionType !== 'all' || startDate || endDate) && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <span className="text-xs text-gray-500">Active filters:</span>
                        {search && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                Search: {search}
                                <button onClick={() => setSearch('')} className="hover:text-gray-800">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {actionType !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-full text-xs text-indigo-600">
                                Action: {actionType.replace(/_/g, ' ')}
                                <button onClick={() => setActionType('all')} className="hover:text-indigo-800">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {startDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                From: {formatDate(startDate)}
                                <button onClick={() => setStartDate('')} className="hover:text-gray-800">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                        {endDate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                                To: {formatDate(endDate)}
                                <button onClick={() => setEndDate('')} className="hover:text-gray-800">
                                    <FiX className="w-3 h-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* Security Cards */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiShield className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Audit Trail</p>
                                <p className="text-xs text-gray-400 mt-1">Complete history of all super admin actions.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiClock className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Retention Policy</p>
                                <p className="text-xs text-gray-400 mt-1">Logs are retained for 1 year for compliance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Audit Logs Table */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiActivity className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No audit logs found</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {logs.map((log) => (
                                            <tr
                                                key={log._id}
                                                onClick={() => handleViewDetails(log)}
                                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(log.timestamp)}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {new Date(log.timestamp).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                                            <FiUser className="w-3 h-3 text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {log.superAdminId?.fullName || 'Unknown'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {log.superAdminId?.email || 'No email'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge variant={
                                                        log.action.includes('view') ? 'info' :
                                                        log.action.includes('block') ? 'danger' :
                                                        log.action.includes('unblock') ? 'success' :
                                                        log.action.includes('delete') ? 'danger' :
                                                        log.action.includes('restore') ? 'success' :
                                                        log.action.includes('export') ? 'warning' :
                                                        'default'
                                                    }>
                                                        {log.action.replace(/_/g, ' ')}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-600">
                                                        {log.targetType || 'N/A'}
                                                    </div>
                                                    {log.targetId && (
                                                        <div className="text-xs text-gray-400 font-mono">
                                                            ID: {log.targetId.slice(-8)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm font-mono text-gray-500">{log.ipAddress || 'N/A'}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewDetails(log);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-1 mt-12">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-all"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 text-sm rounded-full transition-all ${page === pageNum
                                                ? 'bg-indigo-500 text-white shadow-md'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-30 transition-all"
                                >
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Details Modal */}
            <AuditLogDetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
}