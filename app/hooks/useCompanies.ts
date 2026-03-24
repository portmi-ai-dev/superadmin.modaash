// app/hooks/useCompanies.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { superAdminClient } from '../lib/api';
import { Company } from '../types';
import { useDebounce } from './useDebounce';

interface CompaniesResponse {
    success: boolean;
    data: Company[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

interface UseCompaniesOptions {
    initialPage?: number;
    initialLimit?: number;
    autoFetch?: boolean;
}

export function useCompanies(options: UseCompaniesOptions = {}) {
    const { initialPage = 1, initialLimit = 12, autoFetch = true } = options;

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(initialPage);
    const [limit] = useState(initialLimit);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');

    const debouncedSearch = useDebounce(search, 500);

    const fetchCompanies = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', limit.toString());
            if (debouncedSearch) params.append('search', debouncedSearch);
            if (status !== 'all') params.append('status', status);

            const response = await superAdminClient.get(`/companies?${params}`);
            const responseData = response.data as CompaniesResponse;

            setCompanies(responseData.data);
            setTotalPages(responseData.pagination.pages);
            setTotalCompanies(responseData.pagination.total);
        } catch (error: any) {
            console.error('Failed to fetch companies:', error);
            toast.error(error?.response?.data?.message || 'Failed to load companies');
        } finally {
            setLoading(false);
        }
    }, [page, limit, debouncedSearch, status]);

    useEffect(() => {
        if (autoFetch) {
            fetchCompanies();
        }
    }, [fetchCompanies, autoFetch]);

    const toggleBlock = async (companyId: string, currentStatus: boolean) => {
        try {
            const response = await superAdminClient.patch(`/companies/${companyId}/toggle-block`);
            if (response.data.success) {
                toast.success(`Company ${currentStatus ? 'blocked' : 'unblocked'} successfully`);
                fetchCompanies();
                return true;
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to toggle company status');
            return false;
        }
        return false;
    };

    const refresh = () => {
        fetchCompanies();
    };

    const goToPage = (newPage: number) => {
        setPage(newPage);
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        setPage(1);
    };

    return {
        companies,
        loading,
        page,
        totalPages,
        totalCompanies,
        search,
        setSearch,
        status,
        setStatus,
        toggleBlock,
        refresh,
        goToPage,
        resetFilters,
    };
}