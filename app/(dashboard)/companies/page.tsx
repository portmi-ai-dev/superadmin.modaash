// app/(dashboard)/companies/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { superAdminClient } from '../../lib/api';
import { Company } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import CompanyCard from '../../components/companies/CompanyCard';
import CompanyTable from '../../components/companies/CompanyTable';
import { 
    FiGrid, 
    FiList, 
    FiSearch, 
    FiRefreshCw, 
    FiX,
    FiBriefcase,
    FiTrendingUp,
    FiUsers,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'table';

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

export default function CompaniesPage() {
    const router = useRouter();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [exporting, setExporting] = useState(false);
    
    // Stats for all companies (from API response)
    const [globalStats, setGlobalStats] = useState({
        totalCompanies: 0,
        activeCount: 0,
        trialCount: 0,
        expiredCount: 0,
        totalEmployers: 0,
        totalWorkers: 0
    });

    useEffect(() => {
        fetchCompanies();
        fetchGlobalStats();
    }, [page, search, status]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '12');
            if (search) params.append('search', search);
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
    };

    const fetchGlobalStats = async () => {
        try {
            // Fetch all companies without pagination to get accurate global stats
            const response = await superAdminClient.get(`/companies?limit=10000`);
            const allCompanies = response.data.data as Company[];
            
            // Calculate global stats from all companies
            const active = allCompanies.filter(c => c.subscriptionStatus === 'active' && c.isActive).length;
            const trial = allCompanies.filter(c => c.subscriptionStatus === 'trial').length;
            const expired = allCompanies.filter(c => c.subscriptionStatus === 'expired').length;
            const totalEmployers = allCompanies.reduce((sum, c) => sum + (c.stats?.employers || 0), 0);
            const totalWorkers = allCompanies.reduce((sum, c) => sum + (c.stats?.workers || 0), 0);
            
            setGlobalStats({
                totalCompanies: allCompanies.length,
                activeCount: active,
                trialCount: trial,
                expiredCount: expired,
                totalEmployers,
                totalWorkers
            });
        } catch (error) {
            console.error('Failed to fetch global stats:', error);
        }
    };

    const handleExport = async () => {
        const reason = prompt(
            '📋 Export Reason Required\n\n' +
            'Please provide a reason for exporting company data:\n' +
            'Examples:\n' +
            '- Company audit report\n' +
            '- Market analysis\n' +
            '- Subscription review\n' +
            '- Monthly reporting'
        );

        if (!reason) return;
        if (reason.trim().length < 10) {
            toast.error('Please provide a more detailed reason (minimum 10 characters)');
            return;
        }

        setExporting(true);
        try {
            const response = await superAdminClient.get(`/companies?limit=10000`);
            const companiesData = response.data.data as Company[];

            const csvRows = [
                ['ID', 'Company Name', 'Email', 'Phone', 'Status', 'Plan', 'Expiry Date', 'Admins', 'Employees', 'Employers', 'Workers', 'Created'],
                ...companiesData.map((c: Company) => [
                    c._id.slice(-8),
                    c.name,
                    c.contactEmail || '—',
                    c.contactPhone || '—',
                    c.subscriptionStatus,
                    c.billing?.plan || '—',
                    c.billing?.expiryDate ? new Date(c.billing.expiryDate).toLocaleDateString() : '—',
                    c.stats?.admins || 0,
                    c.stats?.employees || 0,
                    c.stats?.employers || 0,
                    c.stats?.workers || 0,
                    new Date(c.createdAt).toLocaleDateString()
                ])
            ];

            const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `companies_${new Date().toISOString().slice(0, 19)}.csv`;
            link.click();
            URL.revokeObjectURL(link.href);

            toast.success(`Exported ${companiesData.length} companies (access logged)`);
        } catch (error: any) {
            toast.error('Export failed');
        } finally {
            setExporting(false);
        }
    };

    const handleToggleBlock = async (company: Company) => {
        const action = company.isActive ? 'block' : 'unblock';
        const confirmed = confirm(`Are you sure you want to ${action} ${company.name}?`);
        
        if (!confirmed) return;

        try {
            const response = await superAdminClient.patch(`/companies/${company._id}/toggle-block`);
            if (response.data.success) {
                toast.success(`Company ${action}ed successfully`);
                fetchCompanies();
                fetchGlobalStats(); // Refresh global stats
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} company`);
        }
    };

    const handleViewCompany = (company: Company) => {
        router.push(`/companies/${company._id}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCompanies();
    };

    const clearSearch = () => {
        setSearch('');
        setPage(1);
    };

    const statusOptions = [
        { value: 'all', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'trial', label: 'Trial' },
        { value: 'expired', label: 'Expired' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

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
                                    <span className="text-xs font-mono text-indigo-500 tracking-wider">COMPANY MANAGEMENT</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-light tracking-tight text-gray-900">
                                Companies
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm font-light">
                                Manage and monitor all registered companies
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchCompanies}
                                disabled={loading}
                                className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all duration-300"
                            >
                                <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
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
                                <span>{exporting ? 'Exporting...' : 'Export'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards - Using GLOBAL stats (not page stats) */}
                <div className="grid grid-cols-5 gap-5 mb-10">
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <FiBriefcase className="w-5 h-5 text-indigo-500" />
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Total</span>
                        </div>
                        <p className="text-3xl font-light text-gray-900">{globalStats.totalCompanies.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 font-light">Total Companies</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiTrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{globalStats.activeCount}</p>
                        <p className="text-xs text-emerald-600 mt-1 font-light">Active</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiTrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{globalStats.trialCount}</p>
                        <p className="text-xs text-amber-600 mt-1 font-light">Trial</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUsers className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{globalStats.totalEmployers.toLocaleString()}</p>
                        <p className="text-xs text-purple-600 mt-1 font-light">Total Employers</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                        <div className="mb-4">
                            <FiUsers className="w-5 h-5 text-pink-500" />
                        </div>
                        <p className="text-3xl font-light text-gray-900">{globalStats.totalWorkers.toLocaleString()}</p>
                        <p className="text-xs text-pink-600 mt-1 font-light">Total Workers</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-10">
                    <div className="relative max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by company name, email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchCompanies()}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="flex gap-1 p-1 bg-gray-100 rounded-full">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'grid'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FiGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-full transition-all ${viewMode === 'table'
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FiList className="w-4 h-4" />
                            </button>
                        </div>
                        {(search || status !== 'all') && (
                            <button
                                onClick={clearSearch}
                                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                        <div className="flex-1 text-right text-xs text-gray-300">
                            Showing {companies.length} of {totalCompanies} companies
                        </div>
                    </div>
                </div>

                {/* Companies Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : companies.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiBriefcase className="w-6 h-6 text-gray-300" />
                        </div>
                        <p className="text-sm text-gray-400">No companies found</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-3 gap-6">
                                {companies.map((company) => (
                                    <div
                                        key={company._id}
                                        onClick={() => handleViewCompany(company)}
                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                                    >
                                        <div className="p-5">
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                                        <FiBriefcase className="w-4 h-4 text-gray-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm group-hover:text-indigo-600 transition-colors">
                                                            {company.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">#{company._id.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    company.subscriptionStatus === 'active' ? 'bg-emerald-50 text-emerald-600' :
                                                    company.subscriptionStatus === 'trial' ? 'bg-amber-50 text-amber-600' :
                                                    company.subscriptionStatus === 'expired' ? 'bg-rose-50 text-rose-600' :
                                                    'bg-gray-50 text-gray-600'
                                                }`}>
                                                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                        company.subscriptionStatus === 'active' ? 'bg-emerald-500' :
                                                        company.subscriptionStatus === 'trial' ? 'bg-amber-500' :
                                                        company.subscriptionStatus === 'expired' ? 'bg-rose-500' :
                                                        'bg-gray-500'
                                                    }`} />
                                                    {company.subscriptionStatus}
                                                </div>
                                            </div>

                                            {/* Contact Info */}
                                            <div className="space-y-2 mb-3 pb-3 border-b border-gray-50">
                                                {company.contactEmail && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">Email</span>
                                                        <span className="text-xs text-gray-600 truncate max-w-[180px]">{company.contactEmail}</span>
                                                    </div>
                                                )}
                                                {company.contactPhone && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">Phone</span>
                                                        <span className="text-xs text-gray-600">{company.contactPhone}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-lg font-semibold text-gray-800">{company.stats?.admins || 0}</p>
                                                    <p className="text-xs text-gray-500">Admins</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-lg font-semibold text-gray-800">{company.stats?.employees || 0}</p>
                                                    <p className="text-xs text-gray-500">Employees</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-lg font-semibold text-gray-800">{company.stats?.employers || 0}</p>
                                                    <p className="text-xs text-gray-500">Employers</p>
                                                </div>
                                                <div className="text-center p-2 bg-gray-50 rounded-lg">
                                                    <p className="text-lg font-semibold text-gray-800">{company.stats?.workers || 0}</p>
                                                    <p className="text-xs text-gray-500">Workers</p>
                                                </div>
                                            </div>

                                            {/* Billing Info */}
                                            {company.billing?.expiryDate && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-gray-400">Expires</span>
                                                        <span className="text-gray-600">{new Date(company.billing.expiryDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                             </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {companies.map((company) => (
                                                <tr
                                                    key={company._id}
                                                    onClick={() => handleViewCompany(company)}
                                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <FiBriefcase className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">{company.name}</div>
                                                                <div className="text-xs text-gray-400">ID: {company._id.slice(-8)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">{company.contactEmail || '—'}</div>
                                                        <div className="text-xs text-gray-400">{company.contactPhone || '—'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                            company.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                                            company.subscriptionStatus === 'trial' ? 'bg-amber-100 text-amber-800' :
                                                            company.subscriptionStatus === 'expired' ? 'bg-rose-100 text-rose-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {company.subscriptionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-600">
                                                            👥 {company.stats?.admins || 0} Admins • {company.stats?.employees || 0} Employees
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            🏢 {company.stats?.employers || 0} Employers • 👷 {company.stats?.workers || 0} Workers
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-sm text-gray-600">
                                                            {company.billing?.expiryDate ? new Date(company.billing.expiryDate).toLocaleDateString() : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleBlock(company);
                                                            }}
                                                            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                                                                company.isActive
                                                                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            }`}
                                                        >
                                                            {company.isActive ? 'Block' : 'Unblock'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

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