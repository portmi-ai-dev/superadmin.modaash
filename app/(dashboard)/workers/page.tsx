// app/(dashboard)/workers/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiActivity,
    FiBriefcase,
    FiChevronLeft,
    FiChevronRight,
    FiClock,
    FiDownload,
    FiGlobe,
    FiLock,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiTag,
    FiTrendingUp,
    FiUser,
    FiUserCheck,
    FiUserPlus,
    FiUsers,
    FiUserX
} from 'react-icons/fi';
import { superAdminClient } from '../../lib/api';
import { Worker } from '../../types';

interface WorkersResponse {
    success: boolean;
    data: Worker[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    meta?: {
        showingDeleted?: boolean;
        masked?: boolean;
        note?: string;
    };
}

interface StatusConfig {
    bg: string;
    text: string;
    dot: string;
}

export default function WorkersPage() {
    const router = useRouter();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalWorkers, setTotalWorkers] = useState(0);

    useEffect(() => {
        fetchWorkers();
    }, [page, search, status, includeDeleted]);

    const fetchWorkers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);
            if (status !== 'all') params.append('status', status);
            if (includeDeleted) params.append('includeDeleted', 'true');

            const response = await superAdminClient.get(`/workers?${params}`);
            const responseData = response.data as WorkersResponse;

            // DEBUG: Log the first worker to see what data is available
            if (responseData.data && responseData.data.length > 0) {
                console.log('=== WORKERS DATA DEBUG ===');
                console.log('Total workers:', responseData.data.length);
                const sample = responseData.data[0];
                console.log('Sample worker structure:', {
                    id: sample._id,
                    name: sample.name,
                    companyId: sample.companyId,
                    company: sample.company,
                    employerId: sample.employerId,
                    employer: sample.employer,
                    jobDemandId: sample.jobDemandId,
                    jobDemand: sample.jobDemand,
                    subAgentId: sample.subAgentId,
                    subAgent: sample.subAgent
                });
            }

            setWorkers(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalWorkers(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch workers:', error);
            toast.error(error?.response?.data?.message || 'Failed to load workers');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting worker data:\n' +
            'Examples:\n' +
            '- Monthly reporting\n' +
            '- Analytics for board meeting\n' +
            '- R visualization for research\n' +
            '- Compliance audit'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const response = await superAdminClient.get(
                `/workers?unmask=true&reason=${encodeURIComponent(reason)}&limit=10000`
            );

            const workersData = response.data.data as Worker[];
            const csvRows = [
                ['ID', 'Name', 'Passport', 'Contact', 'Status', 'Stage', 'Agency', 'Employer', 'Job Demand', 'Destination', 'Created'],
                ...workersData.map((w: Worker) => [
                    w._id.slice(-8),
                    w.name,
                    w.passportNumber || '—',
                    w.contact || '—',
                    w.status,
                    w.currentStage?.replace(/-/g, ' ') || '—',
                    getCompanyName(w),
                    getEmployerName(w),
                    getJobDemandTitle(w),
                    getDestination(w),
                    new Date(w.createdAt).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `workers_${new Date().toISOString().slice(0, 19)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success(`Exported ${workersData.length} workers (access logged)`);
        } catch (error: any) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleViewWorker = (worker: Worker) => {
        router.push(`/workers/${worker._id}`);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setIncludeDeleted(false);
        setPage(1);
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'deployed', label: 'Deployed' },
        { value: 'rejected', label: 'Rejected' },
    ];

    const getStatusConfig = (status: string): StatusConfig => {
        switch (status) {
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
            case 'processing':
                return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
            case 'deployed':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
            case 'rejected':
                return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    const statusCounts = workers.reduce((acc: Record<string, number>, w: Worker) => {
        acc[w.status] = (acc[w.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const activeRate = totalWorkers > 0
        ? Math.round(((statusCounts['processing'] || 0) + (statusCounts['deployed'] || 0)) / totalWorkers * 100)
        : 0;

    // Helper function to safely get company name
    const getCompanyName = (worker: Worker): string => {
        if (worker.company?.name) return worker.company.name;
        if (worker.companyId && typeof worker.companyId === 'object' && 'name' in worker.companyId) {
            return (worker.companyId as any).name;
        }
        return '—';
    };

    // Helper function to safely get employer name
    const getEmployerName = (worker: Worker): string => {
        if (worker.employer?.employerName) return worker.employer.employerName;
        if (worker.employerId && typeof worker.employerId === 'object' && 'employerName' in worker.employerId) {
            return (worker.employerId as any).employerName;
        }
        return '—';
    };

    // Helper function to safely get job demand title
    const getJobDemandTitle = (worker: Worker): string => {
        if (worker.jobDemand?.jobTitle) return worker.jobDemand.jobTitle;
        if (worker.jobDemandId && typeof worker.jobDemandId === 'object' && 'jobTitle' in worker.jobDemandId) {
            return (worker.jobDemandId as any).jobTitle;
        }
        return '—';
    };

    // FIXED: Get destination (employer's country) - NEVER fall back to worker's country
    const getDestination = (worker: Worker): string => {
        // Priority 1: Employer's country (where they are going)
        if (worker.employer?.country) {
            return worker.employer.country;
        }
        // Priority 2: Check if employerId is an object with country
        if (worker.employerId && typeof worker.employerId === 'object' && 'country' in worker.employerId) {
            return (worker.employerId as any).country;
        }
        // Priority 3: No employer assigned
        return 'Not Assigned';
    };

    // Helper to check if employer exists
    const hasEmployer = (worker: Worker): boolean => {
        return getEmployerName(worker) !== '—';
    };

    // Helper to check if job demand exists
    const hasJobDemand = (worker: Worker): boolean => {
        return getJobDemandTitle(worker) !== '—';
    };

    // Helper to check if destination exists
    const hasDestination = (worker: Worker): boolean => {
        return getDestination(worker) !== 'Not Assigned';
    };

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
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">WORKFORCE ANALYTICS</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                Worker Registry
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Comprehensive view of all workers across your organization
                            </p>
                        </div>
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
                            <span>{exporting ? 'Exporting...' : 'Export Data'}</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-5 mb-10">
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <FiUsers className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{activeRate}% active</span>
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalWorkers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Workers</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiClock className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts['pending'] || 0}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiTrendingUp className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts['processing'] || 0}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Processing</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts['deployed'] || 0}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Deployed</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserX className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts['rejected'] || 0}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Rejected</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by name, passport, or contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchWorkers()}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <label className="flex items-center gap-2 text-sm text-gray-500">
                            <input
                                type="checkbox"
                                checked={includeDeleted}
                                onChange={(e) => setIncludeDeleted(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-200 text-indigo-500 focus:ring-indigo-200"
                            />
                            <span>Include deleted</span>
                        </label>
                        {(search || status !== 'all' || includeDeleted) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <button
                            onClick={fetchWorkers}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex-1 text-right text-xs text-gray-300">
                            {workers.length} of {totalWorkers} results
                        </div>
                    </div>
                </div>

                {/* Security Cards */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiShield className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Data Privacy</p>
                                <p className="text-xs text-gray-400 mt-1">Personal data masked. API access requires audit logging.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiActivity className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Audit Trail</p>
                                <p className="text-xs text-gray-400 mt-1">All actions logged for compliance.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Workers Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : workers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiUsers className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No workers found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6">
                            {workers.map((worker) => {
                                const statusConfig = getStatusConfig(worker.status);
                                const companyName = getCompanyName(worker);
                                const employerName = getEmployerName(worker);
                                const jobDemandTitle = getJobDemandTitle(worker);
                                const destination = getDestination(worker);

                                return (
                                    <div
                                        key={worker._id}
                                        onClick={() => handleViewWorker(worker)}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                        <FiUser className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                            {worker.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{worker._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                                                    {worker.status}
                                                </div>
                                            </div>

                                            {/* Contact & Passport */}
                                            <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400">📞 Contact</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{worker.contact || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">🛂 Passport</p>
                                                    <p className="text-xs font-mono text-gray-600 mt-0.5">{worker.passportNumber || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Agency */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                <div className="flex items-center gap-1">
                                                    <FiBriefcase className="w-3 h-3 text-indigo-500" />
                                                    <span className="text-xs text-gray-500">Agency</span>
                                                </div>
                                                <span className="text-xs text-gray-700 font-medium truncate max-w-[180px]" title={companyName}>
                                                    {companyName}
                                                </span>
                                            </div>

                                            {/* Employer - Only show if exists */}
                                            {hasEmployer(worker) && (
                                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                    <div className="flex items-center gap-1">
                                                        <FiUserPlus className="w-3 h-3 text-emerald-500" />
                                                        <span className="text-xs text-gray-500">Employer</span>
                                                    </div>
                                                    <span className="text-xs text-gray-600 truncate max-w-[180px]" title={employerName}>
                                                        {employerName}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Job Demand - Only show if exists */}
                                            {hasJobDemand(worker) && (
                                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                    <div className="flex items-center gap-1">
                                                        <FiTag className="w-3 h-3 text-amber-500" />
                                                        <span className="text-xs text-gray-500">Job Demand</span>
                                                    </div>
                                                    <span className="text-xs text-gray-600 truncate max-w-[180px]" title={jobDemandTitle}>
                                                        {jobDemandTitle}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Destination - Only show if exists (employer's country) */}
                                            {hasDestination(worker) && (
                                                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                    <div className="flex items-center gap-1">
                                                        <FiGlobe className="w-3 h-3 text-purple-500" />
                                                        <span className="text-xs text-gray-500">Destination</span>
                                                    </div>
                                                    <span className="text-xs text-gray-600 truncate max-w-[180px]" title={destination}>
                                                        {destination}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Stage */}
                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs text-gray-400">Stage</span>
                                                <span className="text-xs text-gray-600 capitalize">{worker.currentStage?.replace(/-/g, ' ') || '—'}</span>
                                            </div>

                                            {/* Documents */}
                                            {worker.documents && worker.documents.length > 0 && (
                                                <div className="mt-3 pt-2 border-t border-gray-100">
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <FiLock className="w-3 h-3" />
                                                        <span>{worker.documents.length} document(s)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
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
        </div>
    );
}