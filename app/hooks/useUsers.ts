// app/hooks/useUsers.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { superAdminClient } from '../lib/api';
import { User } from '../types';
import { useDebounce } from './useDebounce';

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

interface UseUsersOptions {
    initialPage?: number;
    initialLimit?: number;
    autoFetch?: boolean;
}

export function useUsers(options: UseUsersOptions = {}) {
    const { initialPage = 1, initialLimit = 20, autoFetch = true } = options;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('all');
    const [isBlocked, setIsBlocked] = useState<string>('all');

    const debouncedSearch = useDebounce(search, 500);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (role !== 'all') params.append('role', role);
            if (isBlocked !== 'all') params.append('isBlocked', isBlocked === 'blocked' ? 'true' : 'false');

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
    }, [page, limit, debouncedSearch, role, isBlocked]);

    useEffect(() => {
        if (autoFetch) {
            fetchUsers();
        }
    }, [fetchUsers, autoFetch]);

    const toggleBlock = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await superAdminClient.patch(`/users/${userId}/toggle-block`);
            if (response.data.success) {
                toast.success(`User ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
                fetchUsers();
                return true;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to toggle user status');
            return false;
        }
        return false;
    };

    const refresh = () => {
        fetchUsers();
    };

    const goToPage = (newPage: number) => {
        setPage(newPage);
    };

    const resetFilters = () => {
        setSearch('');
        setRole('all');
        setIsBlocked('all');
        setPage(1);
    };

    return {
        users,
        loading,
        page,
        totalPages,
        totalUsers,
        search,
        setSearch,
        role,
        setRole,
        isBlocked,
        setIsBlocked,
        toggleBlock,
        refresh,
        goToPage,
        resetFilters,
    };
}