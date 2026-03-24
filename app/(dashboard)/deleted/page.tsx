// app/(dashboard)/deleted/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiAlertTriangle,
    FiBriefcase,
    FiDatabase,
    FiFileText,
    FiRefreshCw,
    FiRotateCcw,
    FiSearch,
    FiTrash2,
    FiUser,
    FiUserCheck,
    FiX
} from 'react-icons/fi';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import { superAdminClient } from '../../lib/api';
import { formatDate } from '../../lib/utils';

interface DeletedItem {
    _id: string;
    entityType: string;
    name: string;
    deletedAt: string;
    deletedBy?: {
        _id: string;
        fullName: string;
    };
    companyId?: {
        _id: string;
        name: string;
    };
    originalData: any;
}

interface DeletedItemsResponse {
    success: boolean;
    data: DeletedItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

type EntityType = 'all' | 'employer' | 'job-demand' | 'worker' | 'sub-agent';

export default function DeletedItemsPage() {
    const router = useRouter();
    const [items, setItems] = useState<DeletedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [entityType, setEntityType] = useState<EntityType>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchDeletedItems();
    }, [page, entityType, search]);

    const fetchDeletedItems = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (entityType !== 'all') params.append('entityType', entityType);
            if (search) params.append('search', search);

            const response = await superAdminClient.get(`/deleted-items?${params}`);
            const responseData = response.data as DeletedItemsResponse;

            setItems(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalItems(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch deleted items:', error);
            toast.error(error?.response?.data?.message || 'Failed to load deleted items');
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (item: DeletedItem) => {
        const confirmed = confirm(`Are you sure you want to restore this ${item.entityType}?`);
        if (!confirmed) return;

        setActionLoading(item._id);
        try {
            const response = await superAdminClient.patch(`/${item.entityType}/${item._id}/restore`);
            if (response.data.success) {
                toast.success(`${item.entityType} restored successfully`);
                fetchDeletedItems();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to restore');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePermanentDelete = async (item: DeletedItem) => {
        const confirmed = confirm(
            `⚠️ WARNING: This will PERMANENTLY delete this ${item.entityType}. This action CANNOT be undone.\n\nAre you absolutely sure?`
        );
        if (!confirmed) return;

        setActionLoading(item._id);
        try {
            const response = await superAdminClient.delete(`/${item.entityType}/${item._id}/permanent`);
            if (response.data.success) {
                toast.success(`${item.entityType} permanently deleted`);
                fetchDeletedItems();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete permanently');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewOriginal = (item: DeletedItem) => {
        // Redirect to original entity details page
        router.push(`/${item.entityType === 'job-demand' ? 'job-demands' : item.entityType}s/${item._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchDeletedItems();
    };

    const clearFilters = () => {
        setSearch('');
        setEntityType('all');
        setPage(1);
    };

    const entityTypeOptions = [
        { value: 'all', label: 'All Types' },
        { value: 'employer', label: 'Employers' },
        { value: 'job-demand', label: 'Job Demands' },
        { value: 'worker', label: 'Workers' },
        { value: 'sub-agent', label: 'Sub Agents' },
    ];

    const getEntityIcon = (type: string) => {
        switch (type) {
            case 'employer':
                return <FiBriefcase className="text-orange-500" />;
            case 'job-demand':
                return <FiFileText className="text-red-500" />;
            case 'worker':
                return <FiUser className="text-pink-500" />;
            case 'sub-agent':
                return <FiUserCheck className="text-indigo-500" />;
            default:
                return <FiDatabase className="text-gray-500" />;
        }
    };

    const getEntityColor = (type: string) => {
        switch (type) {
            case 'employer':
                return 'border-orange-500 bg-orange-50';
            case 'job-demand':
                return 'border-red-500 bg-red-50';
            case 'worker':
                return 'border-pink-500 bg-pink-50';
            case 'sub-agent':
                return 'border-indigo-500 bg-indigo-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    // Calculate stats
    const stats = items.reduce((acc, item) => {
        acc[item.entityType] = (acc[item.entityType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Deleted Items</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all soft-deleted items across the system
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchDeletedItems}
                    isLoading={loading}
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Warning Banner */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FiAlertTriangle className="text-red-600 text-lg mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">⚠️ Deleted Items Management</p>
                        <p className="text-xs text-red-700 mt-1">
                            These items have been soft-deleted. You can restore them or permanently delete them.
                            <strong> Permanent deletion cannot be undone.</strong>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="text-center">
                    <FiTrash2 className="text-2xl text-red-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalItems}</p>
                    <p className="text-sm text-gray-600">Total Deleted</p>
                </Card>
                <Card className="text-center">
                    <FiBriefcase className="text-2xl text-orange-500 mx-auto mb-2" />
                    <p className="text-xl font-bold">{stats['employer'] || 0}</p>
                    <p className="text-xs text-gray-500">Employers</p>
                </Card>
                <Card className="text-center">
                    <FiFileText className="text-2xl text-red-500 mx-auto mb-2" />
                    <p className="text-xl font-bold">{stats['job-demand'] || 0}</p>
                    <p className="text-xs text-gray-500">Job Demands</p>
                </Card>
                <Card className="text-center">
                    <FiUser className="text-2xl text-pink-500 mx-auto mb-2" />
                    <p className="text-xl font-bold">{stats['worker'] || 0}</p>
                    <p className="text-xs text-gray-500">Workers</p>
                </Card>
                <Card className="text-center">
                    <FiUserCheck className="text-2xl text-indigo-500 mx-auto mb-2" />
                    <p className="text-xl font-bold">{stats['sub-agent'] || 0}</p>
                    <p className="text-xs text-gray-500">Sub Agents</p>
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

                        {/* Entity Type Filter */}
                        <div className="w-full md:w-48">
                            <Select
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value as EntityType)}
                                options={entityTypeOptions}
                            />
                        </div>

                        {/* Clear Filters */}
                        {(search || entityType !== 'all') && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Showing {items.length} of {totalItems} deleted items
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
            {!loading && items.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiTrash2 className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No deleted items found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || entityType !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No items have been deleted yet'}
                        </p>
                        {(search || entityType !== 'all') && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Items List */}
            {!loading && items.length > 0 && (
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={`${item.entityType}-${item._id}`}
                            className={`border-l-4 rounded-lg shadow-sm hover:shadow-md transition-all ${getEntityColor(item.entityType)}`}
                        >
                            <div className="bg-white rounded-r-lg p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1">
                                            {getEntityIcon(item.entityType)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {item.name}
                                                </h3>
                                                <Badge variant="danger">Deleted</Badge>
                                                <Badge variant="default">
                                                    {item.entityType === 'job-demand' ? 'Job Demand' :
                                                        item.entityType === 'sub-agent' ? 'Sub Agent' :
                                                            item.entityType.charAt(0).toUpperCase() + item.entityType.slice(1)}
                                                </Badge>
                                            </div>

                                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                {item.companyId && (
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">Company:</span> {item.companyId.name}
                                                    </div>
                                                )}
                                                {item.deletedBy && (
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">Deleted by:</span> {item.deletedBy.fullName}
                                                    </div>
                                                )}
                                                <div className="text-gray-600">
                                                    <span className="font-medium">Deleted at:</span> {formatDate(item.deletedAt)}
                                                </div>
                                            </div>

                                            {/* Additional info based on type */}
                                            {item.entityType === 'employer' && item.originalData?.country && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Country: {item.originalData.country} | Contact: {item.originalData.contact}
                                                </div>
                                            )}
                                            {item.entityType === 'worker' && item.originalData?.status && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Status: {item.originalData.status} | Contact: {item.originalData.contact}
                                                </div>
                                            )}
                                            {item.entityType === 'job-demand' && item.originalData?.jobTitle && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Title: {item.originalData.jobTitle} | Status: {item.originalData.status}
                                                </div>
                                            )}
                                            {item.entityType === 'sub-agent' && item.originalData?.country && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    Country: {item.originalData.country} | Contact: {item.originalData.contact}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleViewOriginal(item)}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => handleRestore(item)}
                                            isLoading={actionLoading === item._id}
                                            disabled={actionLoading !== null}
                                        >
                                            <FiRotateCcw className="mr-1" />
                                            Restore
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() => handlePermanentDelete(item)}
                                            isLoading={actionLoading === item._id}
                                            disabled={actionLoading !== null}
                                        >
                                            <FiTrash2 className="mr-1" />
                                            Permanent
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && items.length > 0 && totalPages > 1 && (
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