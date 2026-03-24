// app/(dashboard)/users/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiRefreshCw, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import UserTable from '../../components/users/UserTable';
import { superAdminClient } from '../../lib/api';
import { User } from '../../types';

interface UsersResponse {
    success: boolean;
    data: User[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
    const [companyId, setCompanyId] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);

    useEffect(() => {
        fetchUsers();
    }, [page, search, role, status]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (search) params.append('search', search);
            if (role !== 'all') params.append('role', role);
            if (status !== 'all') params.append('isBlocked', status === 'blocked' ? 'true' : 'false');
            if (companyId) params.append('companyId', companyId);

            const response = await superAdminClient.get(`/users?${params}`);
            const responseData = response.data as UsersResponse;

            setUsers(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalUsers(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch users:', error);
            toast.error(error?.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user: User) => {
        const action = user.isBlocked ? 'unblock' : 'block';
        const confirmed = confirm(`Are you sure you want to ${action} ${user.fullName}?`);

        if (!confirmed) return;

        try {
            const response = await superAdminClient.patch(`/users/${user._id}/toggle-block`);
            if (response.data.success) {
                toast.success(`User ${action}ed successfully`);
                fetchUsers();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} user`);
        }
    };

    const handleViewUser = (user: User) => {
        router.push(`/users/${user._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUsers();
    };

    const clearFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        setCompanyId('');
        setPage(1);
    };

    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admins' },
        { value: 'employee', label: 'Employees' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'blocked', label: 'Blocked' },
    ];

    // Calculate stats
    const activeCount = users.filter(u => !u.isBlocked).length;
    const blockedCount = users.filter(u => u.isBlocked).length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const employeeCount = users.filter(u => u.role === 'employee').length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">
                        Manage all users across all companies
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={fetchUsers}
                    isLoading={loading}
                >
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                    <FiUsers className="text-2xl text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-green-600 font-bold text-lg">{activeCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Active</p>
                </Card>
                <Card className="text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold text-lg">{blockedCount}</span>
                    </div>
                    <p className="text-sm text-gray-600">Blocked</p>
                </Card>
                <Card className="text-center">
                    <div className="flex justify-center gap-3">
                        <div>
                            <p className="text-xl font-bold text-purple-600">{adminCount}</p>
                            <p className="text-xs text-gray-500">Admins</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-gray-600">{employeeCount}</p>
                            <p className="text-xs text-gray-500">Employees</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">By Role</p>
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
                                    placeholder="Search by name, email or phone..."
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

                        {/* Role Filter */}
                        <div className="w-full md:w-40">
                            <Select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                options={roleOptions}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="w-full md:w-40">
                            <Select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                options={statusOptions}
                            />
                        </div>

                        {/* Clear Filters Button */}
                        {(search || role !== 'all' || status !== 'all') && (
                            <Button variant="outline" onClick={clearFilters}>
                                <FiX className="mr-2" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Showing {users.length} of {totalUsers} users
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
            {!loading && users.length === 0 && (
                <Card className="text-center py-12">
                    <div className="flex flex-col items-center">
                        <FiUsers className="text-4xl text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                        <p className="text-gray-500 mt-1">
                            {search || role !== 'all' || status !== 'all'
                                ? 'Try adjusting your filters'
                                : 'No users registered yet'}
                        </p>
                        {(search || role !== 'all' || status !== 'all') && (
                            <Button variant="outline" onClick={clearFilters} className="mt-4">
                                Clear Filters
                            </Button>
                        )}
                    </div>
                </Card>
            )}

            {/* Users Table */}
            {!loading && users.length > 0 && (
                <Card className="overflow-hidden">
                    <UserTable
                        users={users}
                        onView={handleViewUser}
                        onToggleBlock={handleToggleBlock}
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && users.length > 0 && totalPages > 1 && (
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