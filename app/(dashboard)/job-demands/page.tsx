// app/(dashboard)/job-demands/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiFileText,
    FiGrid,
    FiList,
    FiRefreshCw,
    FiSearch,
    FiUsers,
    FiX
} from 'react-icons/fi';
import JobDemandCard from '../../components/job-demands/JobDemandCard';
import JobDemandTable from '../../components/job-demands/JobDemandTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { JobDemand } from '../../types';

type ViewMode = 'grid' | 'table';

interface JobDemandsResponse {
    success: boolean;
    data: JobDemand[];
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

export default function JobDemandsPage() {
    const router = useRouter();
    const [demands, setDemands] = useState<JobDemand[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDemands, setTotalDemands] = useState(0);

    useEffect(() => {
        fetchJobDemands();
    }, [page, search, status, includeDeleted]);

    const fetchJobDemands = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);
            if (status !== 'all') params.append('status', status);
            if (includeDeleted) params.append('includeDeleted', 'true');

            const response = await superAdminClient.get(`/job-demands?${params}`);
            const responseData = response.data as JobDemandsResponse;

            setDemands(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalDemands(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch job demands:', error);
            toast.error(error?.response?.data?.message || 'Failed to load job demands');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDemand = (demand: JobDemand) => {
        router.push(`/job-demands/${demand._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchJobDemands();
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setIncludeDeleted(false);
        setPage(1);
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'open', label: 'Open' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'closed', label: 'Closed' },
    ];

    // Calculate stats
    const openCount = demands.filter(d => d.status === 'open' && !d.deleted).length;
    const inProgressCount = demands.filter(d => d.status === 'in-progress' && !d.deleted).length;
    const closedCount = demands.filter(d => d.status === 'closed' && !d.deleted).length;
    const deletedCount = demands.filter(d => d.deleted).length;
    const totalPositions = demands.reduce((sum, d) => sum + d.requiredWorkers, 0);
    const totalAssigned = demands.reduce((sum, d) => sum + d.assignedCount, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Job Demands</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all job demands across all companies
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchJobDemands}
                    isLoading={loading}
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <FiFileText className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalDemands}</p>
                    <p className="text-sm text-gray-600">Total Demands</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-lg">{openCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Open</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-yellow-600 font-bold text-lg">{inProgressCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">In Progress</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-gray-600 font-bold text-lg">{closedCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Closed</p>
                </Card>
                <Card className="text-center">
                    <FiUsers className="text-2xl text-purple-500 mx-auto mb-2" />
                    <p className="text-lg font-bold">{totalAssigned} / {totalPositions}</p>
                    <p className="text-xs text-gray-500">Workers Assigned</p>
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
                                    placeholder="Search by job title, employer, or company..."
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
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FiGrid />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded transition-colors ${viewMode === 'table'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <FiList />
                            </button>
                        </div>

                        {/* Clear Filters */}
                        {(search || status !== 'all' || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Showing {demands.length} of {totalDemands} job demands
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
            {!loading && demands.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiFileText className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No job demands found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || status !== 'all' || includeDeleted
                                ? 'Try adjusting your filters'
                                : 'No job demands created yet'}
                        </p>
                        {(search || status !== 'all' || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Grid View */}
            {!loading && demands.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {demands.map((demand) => (
                        <JobDemandCard
                            key={demand._id}
                            demand={demand}
                            onClick={() => handleViewDemand(demand)}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {!loading && demands.length > 0 && viewMode === 'table' && (
                <Card className="overflow-hidden">
                    <JobDemandTable
                        demands={demands}
                        onView={handleViewDemand}
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && demands.length > 0 && totalPages > 1 && (
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