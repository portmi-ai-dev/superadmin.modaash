// app/(dashboard)/employers/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiBriefcase,
    FiGrid,
    FiList,
    FiMapPin,
    FiRefreshCw,
    FiSearch,
    FiX
} from 'react-icons/fi';
import EmployerCard from '../../components/employers/EmployerCard';
import EmployerTable from '../../components/employers/EmployerTable';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { Employer } from '../../types';

type ViewMode = 'grid' | 'table';

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

export default function EmployersPage() {
    const router = useRouter();
    const [employers, setEmployers] = useState<Employer[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
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

    const handleViewEmployer = (employer: Employer) => {
        router.push(`/employers/${employer._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchEmployers();
    };

    const clearFilters = () => {
        setSearch('');
        setCountry('');
        setIncludeDeleted(false);
        setPage(1);
    };

    // Calculate stats
    const activeCount = employers.filter(e => !e.deleted).length;
    const deletedCount = employers.filter(e => e.deleted).length;
    const uniqueCountries = [...new Set(employers.map(e => e.country).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employers</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all employers across all companies
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchEmployers}
                    isLoading={loading}
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <FiBriefcase className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalEmployers}</p>
                    <p className="text-sm text-gray-600">Total Employers</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-lg">{activeCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Active</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold text-lg">{deletedCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Deleted</p>
                </Card>
                <Card className="text-center">
                    <FiMapPin className="text-2xl text-purple-500 mx-auto mb-2" />
                    <p className="text-lg font-bold">{uniqueCountries.length}</p>
                    <p className="text-sm text-gray-600">Countries</p>
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
                                    placeholder="Search by name, contact, or address..."
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

                        {/* Country Filter */}
                        <div className="w-full md:w-48">
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
                        {(search || country || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Showing {employers.length} of {totalEmployers} employers
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
            {!loading && employers.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiBriefcase className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No employers found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || country || includeDeleted
                                ? 'Try adjusting your filters'
                                : 'No employers registered yet'}
                        </p>
                        {(search || country || includeDeleted) && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Grid View */}
            {!loading && employers.length > 0 && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {employers.map((employer) => (
                        <EmployerCard
                            key={employer._id}
                            employer={employer}
                            onClick={() => handleViewEmployer(employer)}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {!loading && employers.length > 0 && viewMode === 'table' && (
                <Card className="overflow-hidden">
                    <EmployerTable
                        employers={employers}
                        onView={handleViewEmployer}
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && employers.length > 0 && totalPages > 1 && (
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