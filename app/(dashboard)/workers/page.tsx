// app/(dashboard)/workers/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiLock,
    FiSearch,
    FiShield,
    FiUsers,
    FiX
} from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import WorkerMaskedCard from '../../components/workers/WorkerMaskedCard';
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

export default function WorkersPage() {
    const router = useRouter();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
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
            // Note: No unmask param - always masked for human viewing

            const response = await superAdminClient.get(`/workers?${params}`);
            const responseData = response.data as WorkersResponse;

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

    const handleViewWorker = (worker: Worker) => {
        router.push(`/workers/${worker._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchWorkers();
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

    // Calculate stats
    const statusCounts = workers.reduce((acc, w) => {
        acc[w.status] = (acc[w.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header with Security Notice */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Workers</h1>
                <p className="text-gray-600 mt-1">
                    Manage workers across all companies
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Privacy Notice */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <FiShield className="text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-purple-800">Data Privacy</p>
                                <p className="text-xs text-purple-600">
                                    Personal data is masked for human viewing. Full access requires API authentication.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Access Notice */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <FiLock className="text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-blue-800">API Access</p>
                                <p className="text-xs text-blue-600">
                                    Full data export available via API with audit logging for R/LLM analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <FiUsers className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalWorkers}</p>
                    <p className="text-sm text-gray-600">Total Workers</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-yellow-600 font-bold text-lg">{statusCounts['pending'] || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Pending</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-blue-600 font-bold text-lg">{statusCounts['processing'] || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Processing</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-lg">{statusCounts['deployed'] || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Deployed</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold text-lg">{statusCounts['rejected'] || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Rejected</p>
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
                                    placeholder="Search by name..."
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
                        <div className="w-full md:w-48">
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                options={statusOptions}
                            />
                        </div>

                        {/* Include Deleted Toggle */}
                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={includeDeleted}
                                onChange={(e) => setIncludeDeleted(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700">Include Deleted</span>
                        </label>

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
                        Showing {workers.length} of {totalWorkers} workers
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
            {!loading && workers.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiUsers className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No workers found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || status !== 'all' || includeDeleted
                                ? 'Try adjusting your filters'
                                : 'No workers registered yet'}
                        </p>
                        {(search || status !== 'all' || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Workers Grid */}
            {!loading && workers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {workers.map((worker) => (
                        <WorkerMaskedCard
                            key={worker._id}
                            worker={worker}
                            onClick={() => handleViewWorker(worker)}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && workers.length > 0 && totalPages > 1 && (
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