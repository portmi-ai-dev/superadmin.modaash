// app/(dashboard)/sub-agents/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiActivity,
    FiAward,
    FiBriefcase,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiMapPin,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiStar,
    FiTrendingUp,
    FiUser,
    FiUserCheck,
    FiUsers
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import { superAdminClient } from '../../lib/api';
import { SubAgent } from '../../types';

interface SubAgentsResponse {
    success: boolean;
    data: SubAgent[];
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

export default function SubAgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<SubAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [country, setCountry] = useState('');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalAgents, setTotalAgents] = useState(0);

    useEffect(() => {
        fetchSubAgents();
    }, [page, search, status, country, includeDeleted]);

    const fetchSubAgents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);
            if (status !== 'all') params.append('status', status);
            if (country) params.append('country', country);
            if (includeDeleted) params.append('includeDeleted', 'true');

            const response = await superAdminClient.get(`/sub-agents?${params}`);
            const responseData = response.data as SubAgentsResponse;

            console.log('Sub-agents data:', responseData.data);

            setAgents(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalAgents(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch sub-agents:', error);
            toast.error(error?.response?.data?.message || 'Failed to load sub-agents');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting sub-agent data:\n' +
            'Examples:\n' +
            '- Sub-agent performance analysis\n' +
            '- Network distribution report\n' +
            '- Commission calculation\n' +
            '- Monthly reporting'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const response = await superAdminClient.get(`/sub-agents?limit=10000`);
            const agentsData = response.data.data as SubAgent[];

            const csvRows = [
                ['ID', 'Name', 'Country', 'Contact', 'Status', 'Workers Brought', 'Company', 'Created'],
                ...agentsData.map((a: SubAgent) => [
                    a._id.slice(-8),
                    a.name,
                    a.country || '—',
                    a.contact || '—',
                    a.status,
                    a.workerCount || 0,
                    a.company?.name || '—',
                    new Date(a.createdAt).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `sub_agents_${new Date().toISOString().slice(0, 19)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success(`Exported ${agentsData.length} sub-agents (access logged)`);
        } catch (error: any) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleViewAgent = (agent: SubAgent) => {
        router.push(`/sub-agents/${agent._id}`);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setCountry('');
        setIncludeDeleted(false);
        setPage(1);
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
    ];

    const getStatusConfig = (status: string): StatusConfig => {
        switch (status) {
            case 'active':
                return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
            case 'inactive':
                return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    // Calculate stats
    const activeCount = agents.filter(a => a.status === 'active' && !a.deleted).length;
    const inactiveCount = agents.filter(a => a.status === 'inactive' && !a.deleted).length;
    const pendingCount = agents.filter(a => a.status === 'pending' && !a.deleted).length;
    const deletedCount = agents.filter(a => a.deleted).length;
    const totalWorkers = agents.reduce((sum, a) => sum + (a.workerCount || 0), 0);
    const topAgent = agents.reduce((best, a) => (a.workerCount > (best?.workerCount || 0) ? a : best), null as SubAgent | null);

    const activeRate = totalAgents > 0 ? Math.round((activeCount / totalAgents) * 100) : 0;

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
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">NETWORK PARTNERS</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                Sub-Agents
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Manage and monitor all sub-agents across your organization
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
                            <FiUserCheck className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">{activeRate}% active</span>
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalAgents.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Agents</p>
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
                            <FiUser className="w-5 h-5 text-gray-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{inactiveCount}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Inactive</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiTrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{pendingCount}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Pending</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUsers className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{totalWorkers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Workers Brought</p>
                    </div>
                </div>

                {/* Top Performer Banner */}
                {topAgent && topAgent.workerCount > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <FiAward className="text-white text-2xl" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Top Performer</p>
                                    <p className="text-xl font-semibold text-gray-900">{topAgent.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        <span className="font-semibold text-amber-600">{topAgent.workerCount}</span> workers brought
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handleViewAgent(topAgent)}
                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                            >
                                View Profile
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by name, contact, or country..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchSubAgents()}
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
                        {(search || status !== 'all' || country || includeDeleted) && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <button
                            onClick={fetchSubAgents}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex-1 text-right text-xs text-gray-300">
                            {agents.length} of {totalAgents} results
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
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Network Integrity</p>
                                <p className="text-xs text-gray-400 mt-1">All sub-agent activities are monitored and logged.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                                <FiActivity className="w-4 h-4 text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Performance Tracking</p>
                                <p className="text-xs text-gray-400 mt-1">Worker counts and performance metrics are tracked.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Agents Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : agents.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiUserCheck className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No sub-agents found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6">
                            {agents.map((agent) => {
                                const statusConfig = getStatusConfig(agent.status);
                                const isTopPerformer = topAgent?._id === agent._id && agent.workerCount > 0;

                                return (
                                    <div
                                        key={agent._id}
                                        onClick={() => handleViewAgent(agent)}
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
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                                {agent.name}
                                                            </h3>
                                                            {isTopPerformer && (
                                                                <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{agent._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                                                    {agent.status}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400">📞 Contact</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{agent.contact || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">📍 Country</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{agent.country || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Performance */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                <div className="flex items-center gap-1">
                                                    <FiUsers className="w-3 h-3 text-purple-500" />
                                                    <span className="text-xs text-gray-500">Workers Brought</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-lg font-semibold text-purple-600">{agent.workerCount || 0}</span>
                                                    <span className="text-xs text-gray-400">workers</span>
                                                </div>
                                            </div>

                                            {/* Company */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-1">
                                                    <FiBriefcase className="w-3 h-3 text-indigo-500" />
                                                    <span className="text-xs text-gray-500">Company</span>
                                                </div>
                                                <span className="text-xs text-gray-600 truncate max-w-[180px]" title={agent.company?.name || '—'}>
                                                    {agent.company?.name || '—'}
                                                </span>
                                            </div>

                                            {/* Performance Bar */}
                                            {agent.workerCount > 0 && (
                                                <div className="mt-3 pt-2">
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className="bg-indigo-500 h-1.5 rounded-full transition-all"
                                                            style={{ width: `${Math.min((agent.workerCount / 100) * 100, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1 text-right">
                                                        {agent.workerCount >= 50 ? '⭐ Top performer' : agent.workerCount >= 20 ? '📈 Growing' : '🔄 Building network'}
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