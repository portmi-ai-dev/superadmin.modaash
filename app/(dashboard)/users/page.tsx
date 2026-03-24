// app/(dashboard)/users/page.tsx

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
    FiLock,
    FiRefreshCw,
    FiSearch,
    FiShield,
    FiUnlock,
    FiUser,
    FiUserCheck,
    FiUserPlus,
    FiUsers,
    FiUserX
} from 'react-icons/fi';
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

interface StatusConfig {
    bg: string;
    text: string;
    dot: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [status, setStatus] = useState('all');
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
            params.append('limit', '12');
            if (search) params.append('search', search);
            if (role !== 'all') params.append('role', role);
            if (status !== 'all') params.append('isBlocked', status === 'blocked' ? 'true' : 'false');

            const response = await superAdminClient.get(`/users?${params}`);
            const responseData = response.data as UsersResponse;

            console.log('Users data:', responseData.data);

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

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting user data:\n' +
            'Examples:\n' +
            '- User audit report\n' +
            '- Role distribution analysis\n' +
            '- Security compliance check\n' +
            '- Monthly reporting'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const response = await superAdminClient.get(`/users?limit=10000`);
            const usersData = response.data.data as User[];

            const csvRows = [
                ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Company', 'Created'],
                ...usersData.map((u: User) => [
                    u._id.slice(-8),
                    u.fullName,
                    u.email || '—',
                    u.contactNumber || '—',
                    u.role,
                    u.isBlocked ? 'Blocked' : 'Active',
                    u.company?.name || '—',
                    new Date(u.createdAt).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `users_${new Date().toISOString().slice(0, 19)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success(`Exported ${usersData.length} users (access logged)`);
        } catch (error: any) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleViewUser = (user: User) => {
        router.push(`/users/${user._id}`);
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

    const clearFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        setPage(1);
    };

    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'admin', label: 'Admin' },
        { value: 'employee', label: 'Employee' },
    ];

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'blocked', label: 'Blocked' },
    ];

    const getRoleConfig = (role: string): StatusConfig => {
        switch (role) {
            case 'admin':
                return { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' };
            case 'employee':
                return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
        }
    };

    const getStatusConfig = (isBlocked: boolean): StatusConfig => {
        if (isBlocked) {
            return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
        }
        return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
    };

    const statusCounts = {
        active: users.filter(u => !u.isBlocked).length,
        blocked: users.filter(u => u.isBlocked).length,
        admin: users.filter(u => u.role === 'admin').length,
        employee: users.filter(u => u.role === 'employee').length,
    };

    const activeRate = totalUsers > 0 ? Math.round((statusCounts.active / totalUsers) * 100) : 0;

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
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">USER MANAGEMENT</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                User Registry
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Manage and monitor all users across your organization
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
                        <p className="text-3xl font-light text-gray-900">{totalUsers.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Users</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserCheck className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts.active}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserX className="w-5 h-5 text-rose-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts.blocked}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Blocked</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUser className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts.admin}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Admins</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUserPlus className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{statusCounts.employee}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Employees</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                            {roleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {(search || role !== 'all' || status !== 'all') && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <button
                            onClick={fetchUsers}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={loading}
                        >
                            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <div className="flex-1 text-right text-xs text-gray-300">
                            {users.length} of {totalUsers} results
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
                                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Access Control</p>
                                <p className="text-xs text-gray-400 mt-1">Role-based permissions with admin/employee separation.</p>
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
                                <p className="text-xs text-gray-400 mt-1">All user actions and status changes are logged.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiUsers className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No users found</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-6">
                            {users.map((user) => {
                                const roleConfig = getRoleConfig(user.role);
                                const statusConfig = getStatusConfig(user.isBlocked);

                                return (
                                    <div
                                        key={user._id}
                                        onClick={() => handleViewUser(user)}
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
                                                            {user.fullName}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{user._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleConfig.bg} ${roleConfig.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${roleConfig.dot} mr-1.5`} />
                                                    {user.role === 'admin' ? 'Admin' : 'Employee'}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="grid grid-cols-2 gap-3 mb-3 pb-3 border-b border-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400">📧 Email</p>
                                                    <p className="text-xs text-gray-700 mt-0.5 truncate">{user.email || '—'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-400">📞 Phone</p>
                                                    <p className="text-xs text-gray-700 mt-0.5">{user.contactNumber || '—'}</p>
                                                </div>
                                            </div>

                                            {/* Company */}
                                            <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                                <div className="flex items-center gap-1">
                                                    <FiBriefcase className="w-3 h-3 text-indigo-500" />
                                                    <span className="text-xs text-gray-500">Company</span>
                                                </div>
                                                <span className="text-xs text-gray-600 truncate max-w-[180px]" title={user.company?.name || '—'}>
                                                    {user.company?.name || '—'}
                                                </span>
                                            </div>

                                            {/* Status */}
                                            <div className="flex items-center justify-between py-2">
                                                <div className="flex items-center gap-1">
                                                    {user.isBlocked ? (
                                                        <FiLock className="w-3 h-3 text-rose-500" />
                                                    ) : (
                                                        <FiUnlock className="w-3 h-3 text-emerald-500" />
                                                    )}
                                                    <span className="text-xs text-gray-500">Status</span>
                                                </div>
                                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`} />
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </div>
                                            </div>

                                            {/* Action Button */}
                                            <div className="mt-3 pt-2 border-t border-gray-100">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleToggleBlock(user);
                                                    }}
                                                    className={`w-full py-2 text-xs font-medium rounded-lg transition-all ${user.isBlocked
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                        }`}
                                                >
                                                    {user.isBlocked ? 'Unblock User' : 'Block User'}
                                                </button>
                                            </div>
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