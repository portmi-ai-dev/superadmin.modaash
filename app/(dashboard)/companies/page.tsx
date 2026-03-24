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
import { FiGrid, FiList, FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';
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

  useEffect(() => {
    fetchCompanies();
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

  const handleToggleBlock = async (company: Company) => {
    const action = company.isActive ? 'block' : 'unblock';
    const confirmed = confirm(`Are you sure you want to ${action} ${company.name}?`);
    
    if (!confirmed) return;

    try {
      const response = await superAdminClient.patch(`/companies/${company._id}/toggle-block`);
      if (response.data.success) {
        toast.success(`Company ${action}ed successfully`);
        fetchCompanies();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor all registered companies
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchCompanies}
          isLoading={loading}
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by company name, email or phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </form>

            {/* Status Filter */}
            <div className="w-full sm:w-48">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={statusOptions}
              />
            </div>

            {/* View Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FiList />
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-gray-500">
            Showing {companies.length} of {totalCompanies} companies
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
      {!loading && companies.length === 0 && (
        <Card className="text-center py-12">
          <div className="flex flex-col items-center">
            <FiSearch className="text-4xl text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-500 mt-1">
              {search ? 'Try adjusting your search criteria' : 'No companies registered yet'}
            </p>
            {search && (
              <Button variant="outline" onClick={clearSearch} className="mt-4">
                Clear Search
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Grid View */}
      {!loading && companies.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {companies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              onClick={() => handleViewCompany(company)}
            />
          ))}
        </div>
      )}

      {/* Table View */}
      {!loading && companies.length > 0 && viewMode === 'table' && (
        <Card className="overflow-hidden">
          <CompanyTable
            companies={companies}
            onView={handleViewCompany}
            onToggleBlock={handleToggleBlock}
          />
        </Card>
      )}

      {/* Pagination */}
      {!loading && companies.length > 0 && totalPages > 1 && (
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