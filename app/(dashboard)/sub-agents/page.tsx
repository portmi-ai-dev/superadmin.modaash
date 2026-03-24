// app/(dashboard)/sub-agents/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiAward,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiSearch,
    FiUserCheck,
    FiUsers,
    FiX
} from 'react-icons/fi';
import SubAgentCard from '../../components/sub-agents/SubAgentCard';
import SubAgentTable from '../../components/sub-agents/SubAgentTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { SubAgent } from '../../types';

type ViewMode = 'grid' | 'table';

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

export default function SubAgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<SubAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
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

    const handleViewAgent = (agent: SubAgent) => {
        router.push(`/sub-agents/${agent._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchSubAgents();
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

    // Calculate stats
    const activeCount = agents.filter(a => a.status === 'active' && !a.deleted).length;
    const inactiveCount = agents.filter(a => a.status === 'inactive' && !a.deleted).length;
    const pendingCount = agents.filter(a => a.status === 'pending' && !a.deleted).length;
    const deletedCount = agents.filter(a => a.deleted).length;
    const totalWorkers = agents.reduce((sum, a) => sum + (a.workerCount || 0), 0);
    const topAgent = agents.reduce((best, a) => (a.workerCount > (best?.workerCount || 0) ? a : best), null as SubAgent | null);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sub Agents</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all sub-agents across all companies
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchSubAgents}
                    isLoading={loading}
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <FiUserCheck className="text-2xl text-indigo-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalAgents}</p>
                    <p className="text-sm text-gray-600">Total Agents</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-lg">{activeCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Active</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-gray-600 font-bold text-lg">{inactiveCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Inactive</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-yellow-600 font-bold text-lg">{pendingCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                </Card>
                <Card className="text-center">
                    <FiUsers className="text-2xl text-purple-500 mx-auto mb-2" />
                    <p className="text-xl font-bold">{totalWorkers}</p>
                    <p className="text-xs text-gray-500">Total Workers</p>
                </Card>
            </div>

            {/* Top Performer Card */}
            {topAgent && topAgent.workerCount > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                            <FiAward className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">Top Performer</p>
                            <p className="text-lg font-bold text-gray-900">{topAgent.name}</p>
                            <p className="text-sm text-gray-600">{topAgent.workerCount} workers brought</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAgent(topAgent)}
                        >
                            View Profile
                        </Button>
                    </div>
                </div>
            )}

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
                                    placeholder="Search by name, contact, or country..."
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

                        {/* Status Filter */}
                        <div className="w-full md:w-40">
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                options={statusOptions}
                            />
                        </div>

                        {/* Country Filter */}
                        <div className="w-full md:w-40">
                            <Input
                                type="text"
                                placeholder="Filter by country..."
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>

                        {/* Deleted Toggle */}
                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={includeDeleted}
                                onChange={(e) => setIncludeDeleted(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">Include Deleted</span>
                        </label>

                        {/* View Toggle */}
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FiGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded transition-colors ${viewMode === 'table'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FiList />
                            </button>
                        </div>

                        {/* Clear Filters */}
                        {(search || status !== 'all' || country || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Showing {agents.length} of {totalAgents} sub-agents
                        {includeDeleted && <span className="ml-2 text-yellow-600">(including deleted)</span>}
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
            {!loading && agents.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiUserCheck className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No sub-agents found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || status !== 'all' || country || includeDeleted
                                ? 'Try adjusting your filters'
                                : 'No sub-agents registered yet'}
                        </p>
                        {(search || status !== 'all' || country || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Grid View */}
            {!loading && agents.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {agents.map((agent) => (
                        <SubAgentCard
                            key={agent._id}
                            agent={agent}
                            onClick={() => handleViewAgent(agent)}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {!loading && agents.length > 0 && viewMode === 'table' && (
                <Card className="overflow-hidden">
                    <SubAgentTable
                        agents={agents}
                        onView={handleViewAgent}
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && agents.length > 0 && totalPages > 1 && (
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
        </div>
    );
}