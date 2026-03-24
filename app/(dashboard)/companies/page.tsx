// app/(dashboard)/deleted/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertTriangle,
  FiArchive,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiDatabase,
  FiFileText,
  FiRefreshCw,
  FiRotateCcw,
  FiSearch,
  FiTrash2,
  FiUser,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';
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
  originalData?: any;
}

interface DeletedItemsResponse {
  success: boolean;
  data: {
    employers: DeletedItem[];
    jobDemands: DeletedItem[];
    workers: DeletedItem[];
    subAgents: DeletedItem[];
  };
  counts: {
    employers: number;
    jobDemands: number;
    workers: number;
    subAgents: number;
  };
}

type EntityType = 'all' | 'employer' | 'job-demand' | 'worker' | 'sub-agent';

// Color configuration for each entity type
const ENTITY_COLORS = {
  employer: {
    primary: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    light: 'from-orange-50 to-orange-100/50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    icon: 'text-orange-500',
    hover: 'hover:border-orange-300',
    button: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    ring: 'focus:ring-orange-500'
  },
  'job-demand': {
    primary: 'red',
    gradient: 'from-red-500 to-red-600',
    light: 'from-red-50 to-red-100/50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    icon: 'text-red-500',
    hover: 'hover:border-red-300',
    button: 'bg-red-50 text-red-600 hover:bg-red-100',
    ring: 'focus:ring-red-500'
  },
  worker: {
    primary: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    light: 'from-pink-50 to-pink-100/50',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-700',
    icon: 'text-pink-500',
    hover: 'hover:border-pink-300',
    button: 'bg-pink-50 text-pink-600 hover:bg-pink-100',
    ring: 'focus:ring-pink-500'
  },
  'sub-agent': {
    primary: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    light: 'from-indigo-50 to-indigo-100/50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    icon: 'text-indigo-500',
    hover: 'hover:border-indigo-300',
    button: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100',
    ring: 'focus:ring-indigo-500'
  }
};

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
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchDeletedItems();
  }, [page, entityType, search]);

  const fetchDeletedItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '12');
      if (entityType !== 'all') params.append('entityType', entityType);
      if (search) params.append('search', search);

      const response = await superAdminClient.get(`/deleted-items?${params}`);
      const responseData = response.data as DeletedItemsResponse;

      let allItems: DeletedItem[] = [];

      if (entityType === 'all' || entityType === 'employer') {
        const employersWithType = (responseData.data?.employers || []).map(item => ({
          ...item,
          entityType: 'employer'
        }));
        allItems = [...allItems, ...employersWithType];
      }

      if (entityType === 'all' || entityType === 'job-demand') {
        const jobDemandsWithType = (responseData.data?.jobDemands || []).map(item => ({
          ...item,
          entityType: 'job-demand'
        }));
        allItems = [...allItems, ...jobDemandsWithType];
      }

      if (entityType === 'all' || entityType === 'worker') {
        const workersWithType = (responseData.data?.workers || []).map(item => ({
          ...item,
          entityType: 'worker'
        }));
        allItems = [...allItems, ...workersWithType];
      }

      if (entityType === 'all' || entityType === 'sub-agent') {
        const subAgentsWithType = (responseData.data?.subAgents || []).map(item => ({
          ...item,
          entityType: 'sub-agent'
        }));
        allItems = [...allItems, ...subAgentsWithType];
      }

      if (search) {
        allItems = allItems.filter(item =>
          item.name?.toLowerCase().includes(search.toLowerCase())
        );
      }

      setItems(allItems);
      setTotalItems(allItems.length);
      setStats({
        employer: responseData.counts?.employers || 0,
        'job-demand': responseData.counts?.jobDemands || 0,
        worker: responseData.counts?.workers || 0,
        'sub-agent': responseData.counts?.subAgents || 0
      });
      setTotalPages(Math.ceil(allItems.length / 12));
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
    let path = '';
    switch (item.entityType) {
      case 'employer':
        path = `/employers/${item._id}`;
        break;
      case 'job-demand':
        path = `/job-demands/${item._id}`;
        break;
      case 'worker':
        path = `/workers/${item._id}`;
        break;
      case 'sub-agent':
        path = `/sub-agents/${item._id}`;
        break;
      default:
        path = `/`;
    }
    router.push(path);
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
    { value: 'employer', label: 'Employers', color: 'orange' },
    { value: 'job-demand', label: 'Job Demands', color: 'red' },
    { value: 'worker', label: 'Workers', color: 'pink' },
    { value: 'sub-agent', label: 'Sub Agents', color: 'indigo' },
  ];

  const getEntityIcon = (type: string) => {
    const colors = ENTITY_COLORS[type as keyof typeof ENTITY_COLORS] || ENTITY_COLORS['employer'];
    switch (type) {
      case 'employer':
        return <FiBriefcase className={`w-5 h-5 ${colors.icon}`} />;
      case 'job-demand':
        return <FiFileText className={`w-5 h-5 ${colors.icon}`} />;
      case 'worker':
        return <FiUser className={`w-5 h-5 ${colors.icon}`} />;
      case 'sub-agent':
        return <FiUserCheck className={`w-5 h-5 ${colors.icon}`} />;
      default:
        return <FiDatabase className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEntityColors = (type: string) => {
    return ENTITY_COLORS[type as keyof typeof ENTITY_COLORS] || ENTITY_COLORS['employer'];
  };

  const getEntityBadge = (type: string) => {
    const colors = getEntityColors(type);
    return `px-2.5 py-1 rounded-full text-xs font-medium ${colors.badge}`;
  };

  const totalDeleted = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">

        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-red-500 tracking-wider">RECYCLE BIN</span>
                </div>
              </div>
              <h1 className="text-4xl font-light tracking-tight text-gray-900">
                Deleted Items
              </h1>
              <p className="text-gray-400 mt-2 text-sm font-light">
                Manage and restore soft-deleted items across the system
              </p>
            </div>
            <button
              onClick={fetchDeletedItems}
              disabled={loading}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-red-300 hover:text-red-600 hover:shadow-md transition-all duration-300"
            >
              <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-gradient-to-r from-red-50 to-red-100/50 rounded-2xl p-6 mb-10 border border-red-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">⚠️ Deleted Items Management</h3>
              <p className="text-sm text-red-700 mt-1">
                These items have been soft-deleted. You can restore them or permanently delete them.
                <strong className="font-semibold"> Permanent deletion cannot be undone.</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards with Entity Colors */}
        <div className="grid grid-cols-5 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <FiTrash2 className="w-5 h-5 text-gray-500" />
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-light text-gray-900">{totalDeleted.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1 font-light">Deleted Items</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-orange-100">
            <div className="mb-4">
              <FiBriefcase className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-light text-gray-900">{stats['employer'] || 0}</p>
            <p className="text-xs text-orange-600 mt-1 font-light">Employers</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-red-100">
            <div className="mb-4">
              <FiFileText className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-light text-gray-900">{stats['job-demand'] || 0}</p>
            <p className="text-xs text-red-600 mt-1 font-light">Job Demands</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-pink-100">
            <div className="mb-4">
              <FiUser className="w-5 h-5 text-pink-500" />
            </div>
            <p className="text-3xl font-light text-gray-900">{stats['worker'] || 0}</p>
            <p className="text-xs text-pink-600 mt-1 font-light">Workers</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100">
            <div className="mb-4">
              <FiUserCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <p className="text-3xl font-light text-gray-900">{stats['sub-agent'] || 0}</p>
            <p className="text-xs text-indigo-600 mt-1 font-light">Sub Agents</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-10">
          <div className="relative max-w-md">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDeletedItems()}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100 transition-all"
            />
          </div>
          <div className="flex items-center gap-4 mt-4">
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value as EntityType)}
              className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full focus:outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
            >
              {entityTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {(search || entityType !== 'all') && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Clear filters
              </button>
            )}
            <div className="flex-1 text-right text-xs text-gray-300">
              {items.length} of {totalItems} results
            </div>
          </div>
        </div>

        {/* Security Cards */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                <FiArchive className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Soft Delete</p>
                <p className="text-xs text-gray-400 mt-1">Items are moved to recycle bin, not permanently removed.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
                <FiUserX className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">Audit Trail</p>
                <p className="text-xs text-gray-400 mt-1">All deletions and restores are logged with user details.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Deleted Items Grid - Color Coded Cards */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiTrash2 className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">No deleted items found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-6">
              {items.map((item) => {
                const colors = getEntityColors(item.entityType);
                return (
                  <div
                    key={`${item.entityType}-${item._id}`}
                    className={`group bg-gradient-to-br ${colors.light} rounded-2xl border ${colors.border} shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
                  >
                    <div className="p-5">
                      {/* Header with Entity Color */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                            {getEntityIcon(item.entityType)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm group-hover:text-${colors.primary}-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">#{item._id.slice(-6)}</p>
                          </div>
                        </div>
                        <span className={`${colors.badge} flex items-center gap-1`}>
                          <span className={`w-1.5 h-1.5 rounded-full bg-${colors.primary}-500`}></span>
                          Deleted
                        </span>
                      </div>

                      {/* Type Badge */}
                      <div className="mb-3 pb-3 border-b border-gray-200">
                        <span className={`text-xs font-medium ${colors.icon}`}>
                          {item.entityType === 'job-demand' ? 'Job Demand' :
                            item.entityType === 'sub-agent' ? 'Sub Agent' :
                              item.entityType.charAt(0).toUpperCase() + item.entityType.slice(1)}
                        </span>
                      </div>

                      {/* Deletion Details */}
                      <div className="space-y-2 mb-3">
                        {item.companyId && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">🏢 Company</span>
                            <span className="text-xs text-gray-600 truncate max-w-[180px]">{item.companyId.name}</span>
                          </div>
                        )}
                        {item.deletedBy && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">👤 Deleted by</span>
                            <span className="text-xs text-gray-600 truncate max-w-[180px]">{item.deletedBy.fullName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">⏱️ Deleted at</span>
                          <span className="text-xs text-gray-500">{formatDate(item.deletedAt)}</span>
                        </div>
                      </div>

                      {/* Additional Info with Entity Color */}
                      {item.entityType === 'employer' && item.originalData?.country && (
                        <div className={`mb-3 p-2 rounded-lg ${colors.badge.replace('text', 'bg')} bg-opacity-50`}>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">📍 Country:</span> {item.originalData.country}
                            {item.originalData.contact && <span className="ml-2">📞 {item.originalData.contact}</span>}
                          </p>
                        </div>
                      )}
                      {item.entityType === 'worker' && item.originalData?.status && (
                        <div className={`mb-3 p-2 rounded-lg ${colors.badge.replace('text', 'bg')} bg-opacity-50`}>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Status:</span> {item.originalData.status}
                            {item.originalData.contact && <span className="ml-2">📞 {item.originalData.contact}</span>}
                          </p>
                        </div>
                      )}
                      {item.entityType === 'job-demand' && item.originalData?.jobTitle && (
                        <div className={`mb-3 p-2 rounded-lg ${colors.badge.replace('text', 'bg')} bg-opacity-50`}>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Title:</span> {item.originalData.jobTitle}
                            {item.originalData.status && <span className="ml-2">📊 {item.originalData.status}</span>}
                          </p>
                        </div>
                      )}
                      {item.entityType === 'sub-agent' && item.originalData?.country && (
                        <div className={`mb-3 p-2 rounded-lg ${colors.badge.replace('text', 'bg')} bg-opacity-50`}>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">📍 Country:</span> {item.originalData.country}
                            {item.originalData.contact && <span className="ml-2">📞 {item.originalData.contact}</span>}
                          </p>
                        </div>
                      )}

                      {/* Action Buttons with Entity Colors */}
                      <div className="flex gap-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleViewOriginal(item)}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200`}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleRestore(item)}
                          disabled={actionLoading === item._id}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${colors.button} disabled:opacity-50 flex items-center justify-center gap-1`}
                        >
                          <FiRotateCcw className="w-3 h-3" />
                          Restore
                        </button>
                        <button
                          onClick={() => handlePermanentDelete(item)}
                          disabled={actionLoading === item._id}
                          className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 flex items-center justify-center gap-1`}
                        >
                          <FiTrash2 className="w-3 h-3" />
                          Permanent
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
                        ? 'bg-red-500 text-white shadow-md'
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