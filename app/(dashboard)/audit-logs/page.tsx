// app/(dashboard)/audit-logs/page.tsx

'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiActivity,
    FiCalendar,
    FiClock,
    FiDownload,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiUser,
    FiX
} from 'react-icons/fi';
import AuditLogDetailsModal from '../../components/audit/AuditLogDetailsModal';
import AuditLogTable from '../../components/audit/AuditLogTable';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { AuditLog } from '../../types';

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
    | 'export_for_analysis';

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
            const responseData = response.data;

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
        try {
            const params = new URLSearchParams();
            if (actionType !== 'all') params.append('action', actionType);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const response = await superAdminClient.get(`/audit-logs/export?${params}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${formatDate(new Date())}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export started');
        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error(error?.response?.data?.message || 'Failed to export logs');
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
    ];

    // Calculate stats
    const uniqueAdmins = new Set(logs.map(l => l.superAdminId?._id)).size;
    const sensitiveActions = logs.filter(l => l.action.includes('unmask')).length;
    const blockActions = logs.filter(l => l.action.includes('block')).length;
    const deleteActions = logs.filter(l => l.action.includes('delete')).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-1">
                        Track all super admin activities for security and compliance
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchAuditLogs}
                        isLoading={loading}
                    >
                        <FiRefreshCw className="mr-2" />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                    >
                        <FiDownload className="mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FiShield className="text-blue-600 text-lg mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-blue-800">Compliance & Security</p>
                        <p className="text-xs text-blue-700 mt-1">
                            All super admin actions are logged for audit purposes. This includes viewing sensitive data,
                            blocking users/companies, and exporting data. Logs are retained for 1 year.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <FiActivity className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalLogs}</p>
                    <p className="text-sm text-gray-600">Total Actions</p>
                </Card>
                <Card className="text-center">
                    <FiUser className="text-2xl text-green-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{uniqueAdmins}</p>
                    <p className="text-sm text-gray-600">Active Admins</p>
                </Card>
                <Card className="text-center">
                    <FiShield className="text-2xl text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{sensitiveActions}</p>
                    <p className="text-sm text-gray-600">Sensitive Access</p>
                </Card>
                <Card className="text-center">
                    <FiClock className="text-2xl text-orange-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{blockActions + deleteActions}</p>
                    <p className="text-sm text-gray-600">Actions Taken</p>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by admin name, email, or IP..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 pr-10"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        </form>

                        {/* Action Type Filter */}
                        <div className="w-full md:w-64">
                            <Select
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value as ActionType)}
                                options={actionOptions}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Start Date */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* End Date */}
                        <div className="flex-1">
                            <div className="relative">
                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        {(search || actionType !== 'all' || startDate || endDate) && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Active Filters Display */}
                    {(search || actionType !== 'all' || startDate || endDate) && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            <span className="text-xs text-gray-500">Active filters:</span>
                            {search && (
                                <Badge variant="default" className="text-xs">
                                    Search: {search}
                                </Badge>
                            )}
                            {actionType !== 'all' && (
                                <Badge variant="info" className="text-xs">
                                    Action: {actionType.replace(/_/g, ' ')}
                                </Badge>
                            )}
                            {startDate && (
                                <Badge variant="default" className="text-xs">
                                    From: {formatDate(startDate)}
                                </Badge>
                            )}
                            {endDate && (
                                <Badge variant="default" className="text-xs">
                                    To: {formatDate(endDate)}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Results count */}
                    <div className="text-sm text-gray-500 border-t pt-4">
                        Showing {logs.length} of {totalLogs} audit logs
                    </div>
                </div>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Spinner size="lg" />
                </div>
            )}

            {/* Empty State */}
            {!loading && logs.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiActivity className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No audit logs found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || actionType !== 'all' || startDate || endDate
                                ? 'Try adjusting your filters'
                                : 'No super admin actions have been logged yet'}
                        </p>
                        {(search || actionType !== 'all' || startDate || endDate) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Audit Logs Table */}
            {!loading && logs.length > 0 && (
                <Card className="overflow-hidden">
                    <AuditLogTable
                        logs={logs}
                        onViewDetails={handleViewDetails}
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && logs.length > 0 && totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(page + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Details Modal */}
            <AuditLogDetailsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                log={selectedLog}
            />
        </div>
    );
}