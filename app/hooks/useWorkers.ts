// app/hooks/useWorkers.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { superAdminClient } from '../lib/api';
import { Worker } from '../types';
import { useDebounce } from './useDebounce';

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

interface UseWorkersOptions {
    initialPage?: number;
    initialLimit?: number;
    autoFetch?: boolean;
    masked?: boolean;
}

export function useWorkers(options: UseWorkersOptions = {}) {
    const { initialPage = 1, initialLimit = 12, autoFetch = true, masked = true } = options;

    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalPages, setTotalPages] = useState(1);
    const [totalWorkers, setTotalWorkers] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [includeDeleted, setIncludeDeleted] = useState(false);

    const debouncedSearch = useDebounce(search, 500);

    const fetchWorkers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (status !== 'all') params.append('status', status);
            if (includeDeleted) params.append('includeDeleted', 'true');
            // Note: We never send unmask=true from frontend

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
    }, [page, limit, debouncedSearch, status, includeDeleted]);

    useEffect(() => {
        if (autoFetch) {
            fetchWorkers();
        }
    }, [fetchWorkers, autoFetch]);

    const refresh = () => {
        fetchWorkers();
    };

    const goToPage = (newPage: number) => {
        setPage(newPage);
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setIncludeDeleted(false);
        setPage(1);
    };

    return {
        workers,
        loading,
        page,
        totalPages,
        totalWorkers,
        search,
        setSearch,
        status,
        setStatus,
        includeDeleted,
        setIncludeDeleted,
        refresh,
        goToPage,
        resetFilters,
    };
}