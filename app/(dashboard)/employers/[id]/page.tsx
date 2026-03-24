// app/(dashboard)/employers/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superAdminClient } from '../../../lib/api';
import { Employer, JobDemand, Worker } from '../../../types';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import Table from '../../../components/ui/Table';
import { 
  FiArrowLeft, 
  FiBriefcase, 
  FiMapPin, 
  FiPhone, 
  FiMail,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiTrash2,
  FiRefreshCw
} from 'react-icons/fi';
import { formatDate, getStatusBadgeVariant } from '../../../lib/utils';
import toast from 'react-hot-toast';

interface EmployerDetails extends Employer {
  demands?: JobDemand[];
  workers?: Worker[];
  deletedAt?: string; // Add this field
}

interface EmployerResponse {
  success: boolean;
  data: EmployerDetails;
}

export default function EmployerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const employerId = params.id as string;
  
  const [employer, setEmployer] = useState<EmployerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'demands' | 'workers'>('overview');

  useEffect(() => {
    fetchEmployerDetails();
  }, [employerId]);

  const fetchEmployerDetails = async () => {
    setLoading(true);
    try {
      const response = await superAdminClient.get(`/employers/${employerId}`);
      const responseData = response.data as EmployerResponse;
      setEmployer(responseData.data);
    } catch (error: any) {
      console.error('Failed to fetch employer details:', error);
      toast.error(error?.response?.data?.message || 'Failed to load employer details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Employer not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const statusVariant = getStatusBadgeVariant(employer.status);

  // Demand columns
  const demandColumns = [
    { key: 'jobTitle', header: 'Job Title' },
    { key: 'requiredWorkers', header: 'Required' },
    { key: 'status', header: 'Status', render: (item: JobDemand) => (
      <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
    ) },
    { key: 'deadline', header: 'Deadline', render: (item: JobDemand) => formatDate(item.deadline) },
  ];

  // Worker columns
  const workerColumns = [
    { key: 'name', header: 'Name' },
    { key: 'status', header: 'Status', render: (item: Worker) => (
      <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
    ) },
    { key: 'contact', header: 'Contact' },
    { key: 'createdAt', header: 'Added', render: (item: Worker) => formatDate(item.createdAt) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employer.employerName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant}>{employer.status}</Badge>
              {employer.deleted && (
                <Badge variant="danger">Deleted</Badge>
              )}
              <span className="text-xs text-gray-400">ID: {employer._id}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={fetchEmployerDetails}>
          <FiRefreshCw className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information Card */}
        <Card title="Contact Information">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <FiMapPin className="text-gray-400" />
              <span className="text-gray-600">{employer.country || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FiPhone className="text-gray-400" />
              <span className="text-gray-600">{employer.contact || 'N/A'}</span>
            </div>
            {employer.address && (
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-500 mb-1">Address</p>
                <p>{employer.address}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Statistics Card */}
        <Card title="Statistics">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Job Demands</span>
              <span className="text-2xl font-bold text-blue-600">{employer.stats?.jobDemands || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Workers</span>
              <span className="text-2xl font-bold text-green-600">{employer.stats?.workers || 0}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600">Created</span>
              <span className="text-sm text-gray-500">{formatDate(employer.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Company Information Card */}
        <Card title="Company">
          {employer.company ? (
            <div>
              <p className="font-medium text-gray-900">{employer.company.name}</p>
              <p className="text-xs text-gray-500 mt-1">ID: {employer.company._id}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push(`/companies/${employer.company?._id}`)}
              >
                View Company
              </Button>
            </div>
          ) : (
            <p className="text-gray-500">No company associated</p>
          )}
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiBriefcase className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('demands')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'demands'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiFileText className="inline mr-2" />
            Job Demands ({employer.demands?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('workers')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'workers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FiUsers className="inline mr-2" />
            Workers ({employer.workers?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card>
          {employer.notes ? (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Notes</h3>
              <p className="text-gray-600">{employer.notes}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No additional notes</p>
          )}
        </Card>
      )}

      {activeTab === 'demands' && (
        <Card>
          {employer.demands && employer.demands.length > 0 ? (
            <Table
              columns={demandColumns}
              data={employer.demands}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiFileText className="text-2xl mx-auto mb-2" />
              <p>No job demands for this employer</p>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'workers' && (
        <Card>
          {employer.workers && employer.workers.length > 0 ? (
            <Table
              columns={workerColumns}
              data={employer.workers}
              onRowClick={(worker) => router.push(`/workers/${worker._id}`)}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiUsers className="text-2xl mx-auto mb-2" />
              <p>No workers assigned to this employer</p>
            </div>
          )}
        </Card>
      )}

      {/* Delete Notice if deleted */}
      {employer.deleted && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FiTrash2 className="text-red-600 text-lg mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">This employer has been deleted</p>
              <p className="text-xs text-red-600 mt-1">
                Deleted at: {employer.deletedAt ? formatDate(employer.deletedAt) : 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}