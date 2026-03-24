// app/(dashboard)/employers/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiActivity,
    FiBriefcase,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiFileText,
    FiGlobe,
    FiMapPin,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiUserCheck,
    FiUsers,
    FiUserX,
} from 'react-icons/fi';
import { superAdminClient } from '../../lib/api';
import { Employer } from '../../types';

interface EmployersResponse {
    success: boolean;
    data: Employer[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    meta?: {
        showingDeleted?: boolean;
    };
}

interface StatusConfig {
    bg: string;
    text: string;
    dot: string;
}

export default function EmployersPage() {
    const router = useRouter();
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalEmployers, setTotalEmployers] = useState(0);

    useEffect(() => {
        fetchEmployers();
    }, [page, search, country, includeDeleted]);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);
            if (country) params.append('country', country);
            if (includeDeleted) params.append('includeDeleted', 'true');

            const response = await superAdminClient.get(`/employers?${params}`);
            const responseData = response.data as EmployersResponse;

            console.log('Employers data:', responseData.data);

            setEmployers(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalEmployers(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch employers:', error);
            toast.error(error?.response?.data?.message || 'Failed to load employers');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting employer data:\n' +
            'Examples:\n' +
            '- Employer database audit\n' +
            '- Market analysis report\n' +
            '- Compliance check\n' +
            '- Monthly reporting'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const response = await superAdminClient.get(`/employers?limit=10000`);
            const employersData = response.data.data as Employer[];

            const csvRows = [
                ['ID', 'Name', 'Country', 'Contact', 'Address', 'Status', 'Job Demands', 'Workers', 'Company', 'Created'],
                ...employersData.map((e: Employer) => [
                    e._id.slice(-8),
                    e.employerName,
                    e.country || '—',
                    e.contact || '—',
                    e.address || '—',
                    e.deleted ? 'Deleted' : 'Active',
                    e.stats?.jobDemands || 0,
                    e.stats?.workers || 0,
                    e.company?.name || '—',
                    new Date(e.createdAt).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `employers_${new Date().toISOString().slice(0, 19)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success(`Exported ${employersData.length} employers (access logged)`);
        } catch (error: any) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleViewEmployer = (employer: Employer) => {
        router.push(`/employers/${employer._id}`);
    };

    const clearFilters = () => {
        setSearch('');
        setCountry('');
        setIncludeDeleted(false);
        setPage(1);
    };

    const getStatusConfig = (deleted: boolean): StatusConfig => {
        if (deleted) {
            return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
        }
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
    };

    // Calculate stats
    const activeCount = employers.filter(e => !e.deleted).length;
    const deletedCount = employers.filter(e => e.deleted).length;
    const uniqueCountries = [...new Set(employers.map(e => e.country).filter(Boolean))];
    const totalJobDemands = employers.reduce((sum, e) => sum + (e.stats?.jobDemands || 0), 0);
    const totalWorkers = employers.reduce((sum, e) => sum + (e.stats?.workers || 0), 0);
    const activeRate = totalEmployers > 0 ? Math.round((activeCount / totalEmployers) * 100) : 0;

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
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">EMPLOYER DATABASE</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                Employers
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Manage and monitor all employers across your organization
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
                            <FiBriefcase className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{activeRate}% active</span>
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalEmployers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Employers</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{activeCount}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserX className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{deletedCount}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Deleted</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiGlobe className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{uniqueCountries.length}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Countries</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUsers className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalWorkers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Workers</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by name, contact, or address..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchEmployers()}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <div className="relative">
                            <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Filter by country..."
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <label className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                                type="checkbox"
                                checked={includeDeleted}
                                onChange={(e) => setIncludeDeleted(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-200"
                            />
                            <span>Include deleted</span>
                        </label>
                        {(search || country || includeDeleted) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <button
                            onClick={fetchEmployers}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex-1 text-right text-xs text-gray-300">
                            {employers.length} of {totalEmployers} results
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
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Data Integrity</p>
                                <p className="text-xs text-gray-400 mt-1">All employer records are securely stored and audited.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiActivity className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Activity Tracking</p>
                                <p className="text-xs text-gray-400 mt-1">Job demands and worker assignments are monitored.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employers Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : employers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiBriefcase className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No employers found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6">
                            {employers.map((employer) => {
                                const statusConfig = getStatusConfig(employer.deleted);
                                const jobDemandsCount = employer.stats?.jobDemands || 0;
                                const workersCount = employer.stats?.workers || 0;

                                return (
                                    <div
                                        key={employer._id}
                                        onClick={() => handleViewEmployer(employer)}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                        <FiBriefcase className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                            {employer.employerName}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{employer._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                                                    {employer.deleted ? 'Deleted' : 'Active'}
                                                </div>
                                            </div>

                                            {/* Contact & Location */}
                                            <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400">📍 Country</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{employer.country || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">📞 Contact</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{employer.contact || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Address */}
                                            {employer.address && (
                                                <div className="mb-3 pb-3 border-b border-gray-50">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <FiMapPin className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">Address</span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 truncate">{employer.address}</p>
                                                </div>
                                            )}

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-50">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <FiFileText className="w-3 h-3 text-blue-500 mx-auto mb-1" />
                                                    <p className="text-lg font-semibold text-gray-800">{jobDemandsCount}</p>
                                                    <p className="text-xs text-gray-500">Job Demands</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <FiUsers className="w-3 h-3 text-emerald-500 mx-auto mb-1" />
                                                    <p className="text-lg font-semibold text-gray-800">{workersCount}</p>
                                                    <p className="text-xs text-gray-500">Workers</p>
                                                </div>
                                            </div>

                                            {/* Company */}
                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-1">
                                                    <FiBriefcase className="w-3 h-3 text-indigo-500" />
                                                    <span className="text-xs text-gray-500">Agency</span>
                                                </div>
                                                <span className="text-xs text-gray-600 truncate max-w-[180px]" title={employer.company?.name || '—'}>
                                                    {employer.company?.name || '—'}
                                                </span>
                                            </div>

                                            {/* Notes Indicator */}
                                            {employer.notes && (
                                                <div className="mt-2 pt-2 border-t border-gray-100">
                                                    <p className="text-xs text-gray-400 truncate">
                                                        📝 {employer.notes.length > 60 ? employer.notes.substring(0, 60) + '...' : employer.notes}
                                                    </p>
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