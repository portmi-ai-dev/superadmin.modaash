// app/(dashboard)/companies/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiArrowLeft,
    FiBriefcase,
    FiCalendar,
    FiFileText,
    FiHome,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiUnlock,
    FiUserCheck,
    FiUserPlus,
    FiUsers
} from 'react-icons/fi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { superAdminClient } from '../../../lib/api';
import { formatDate, getStatusBadgeVariant } from '../../../lib/utils';
import { Company, Employer, JobDemand, SubAgent, User, Worker } from '../../../types';

interface CompanyDetails {
    company: Company;
    users: User[];
    employers: Employer[];
    jobDemands: JobDemand[];
    workers: Worker[];
    subAgents: SubAgent[];
    stats: any;
}

interface CompanyDetailsResponse {
    success: boolean;
    data: CompanyDetails;
}

type TabType = 'overview' | 'users' | 'employers' | 'demands' | 'workers' | 'agents';

export default function CompanyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const companyId = params.id as string;

    const [data, setData] = useState<CompanyDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    useEffect(() => {
        fetchCompanyDetails();
    }, [companyId]);

    const fetchCompanyDetails = async () => {
        setLoading(true);
        try {
            const response = await superAdminClient.get(`/companies/${companyId}`);
            // The API returns { success: true, data: {...} }
            const responseData = response.data as CompanyDetailsResponse;
            setData(responseData.data);
        } catch (error: any) {
            console.error('Failed to fetch company details:', error);
            toast.error(error?.response?.data?.message || 'Failed to load company details');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async () => {
        if (!data?.company) return;

        const action = data.company.isActive ? 'block' : 'unblock';
        const confirmed = confirm(`Are you sure you want to ${action} ${data.company.name}?`);

        if (!confirmed) return;

        try {
            const response = await superAdminClient.patch(`/companies/${companyId}/toggle-block`);
            if (response.data.success) {
                toast.success(`Company ${action}ed successfully`);
                fetchCompanyDetails();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} company`);
        }
    };

    const handleToggleUserBlock = async (userId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'unblock' : 'block';
        const confirmed = confirm(`Are you sure you want to ${action} this user?`);

        if (!confirmed) return;

        try {
            const response = await superAdminClient.patch(`/users/${userId}/toggle-block`);
            if (response.data.success) {
                toast.success(`User ${action}ed successfully`);
                fetchCompanyDetails();
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || `Failed to ${action} user`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!data?.company) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Company not found</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const { company, users = [], employers = [], jobDemands = [], workers = [], subAgents = [], stats = {} } = data;

    // Safely get stats with fallbacks
    const safeStats = {
        users: { total: stats?.users?.total ?? 0, admins: stats?.users?.admins ?? 0, employees: stats?.users?.employees ?? 0 },
        employers: { active: stats?.employers?.active ?? 0, deleted: stats?.employers?.deleted ?? 0 },
        jobDemands: { active: stats?.jobDemands?.active ?? 0, deleted: stats?.jobDemands?.deleted ?? 0 },
        workers: { active: stats?.workers?.active ?? 0, deleted: stats?.workers?.deleted ?? 0 },
        subAgents: { active: stats?.subAgents?.active ?? 0, deleted: stats?.subAgents?.deleted ?? 0 }
    };

    const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
        { id: 'overview', label: 'Overview', icon: FiHome },
        { id: 'users', label: `Users (${safeStats.users.total})`, icon: FiUsers },
        { id: 'employers', label: `Employers (${safeStats.employers.active})`, icon: FiBriefcase },
        { id: 'demands', label: `Job Demands (${safeStats.jobDemands.active})`, icon: FiFileText },
        { id: 'workers', label: `Workers (${safeStats.workers.active})`, icon: FiUserPlus },
        { id: 'agents', label: `Sub Agents (${safeStats.subAgents.active})`, icon: FiUserCheck },
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
                        <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusBadgeVariant(company.subscriptionStatus)}>
                                {company.subscriptionStatus}
                            </Badge>
                            {!company.isActive && (
                                <Badge variant="danger">Blocked</Badge>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant={company.isActive ? 'danger' : 'secondary'}
                    onClick={handleToggleBlock}
                >
                    {company.isActive ? (
                        <>
                            <FiLock className="mr-2" />
                            Block Company
                        </>
                    ) : (
                        <>
                            <FiUnlock className="mr-2" />
                            Unblock Company
                        </>
                    )}
                </Button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors whitespace-nowrap ${isActive
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <Icon className="text-lg" />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Company Info */}
                        <Card title="Company Information" className="lg:col-span-2">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    {company.logo ? (
                                        <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <FiHome className="text-2xl text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                        <p className="text-sm text-gray-500">ID: {company._id}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                    {company.contactEmail && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FiMail className="text-gray-400" />
                                            <span className="text-gray-600">{company.contactEmail}</span>
                                        </div>
                                    )}
                                    {company.contactPhone && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FiPhone className="text-gray-400" />
                                            <span className="text-gray-600">{company.contactPhone}</span>
                                        </div>
                                    )}
                                    {company.address?.country && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <FiMapPin className="text-gray-400" />
                                            <span className="text-gray-600">
                                                {[company.address.city, company.address.state, company.address.country]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm">
                                        <FiCalendar className="text-gray-400" />
                                        <span className="text-gray-600">Created: {formatDate(company.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Subscription Info */}
                        <Card title="Subscription">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Plan</span>
                                    <span className="font-medium capitalize">{company.billing?.plan || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <Badge variant={getStatusBadgeVariant(company.subscriptionStatus)}>
                                        {company.subscriptionStatus}
                                    </Badge>
                                </div>
                                {company.billing?.startDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Start Date</span>
                                        <span className="text-sm">{formatDate(company.billing.startDate)}</span>
                                    </div>
                                )}
                                {company.billing?.expiryDate && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Expiry Date</span>
                                        <span className="text-sm">{formatDate(company.billing.expiryDate)}</span>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Stats Cards */}
                        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card className="text-center">
                                <FiUsers className="text-2xl text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{safeStats.users.total}</p>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-xs text-gray-400">{safeStats.users.admins} Admins, {safeStats.users.employees} Employees</p>
                            </Card>
                            <Card className="text-center">
                                <FiBriefcase className="text-2xl text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{safeStats.employers.active}</p>
                                <p className="text-sm text-gray-600">Active Employers</p>
                                {safeStats.employers.deleted > 0 && (
                                    <p className="text-xs text-red-500">{safeStats.employers.deleted} Deleted</p>
                                )}
                            </Card>
                            <Card className="text-center">
                                <FiFileText className="text-2xl text-orange-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{safeStats.jobDemands.active}</p>
                                <p className="text-sm text-gray-600">Active Job Demands</p>
                                {safeStats.jobDemands.deleted > 0 && (
                                    <p className="text-xs text-red-500">{safeStats.jobDemands.deleted} Deleted</p>
                                )}
                            </Card>
                            <Card className="text-center">
                                <FiUserPlus className="text-2xl text-purple-500 mx-auto mb-2" />
                                <p className="text-2xl font-bold">{safeStats.workers.active}</p>
                                <p className="text-sm text-gray-600">Active Workers</p>
                                {safeStats.workers.deleted > 0 && (
                                    <p className="text-xs text-red-500">{safeStats.workers.deleted} Deleted</p>
                                )}
                            </Card>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email/Phone</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.fullName}</p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{user.email}</div>
                                                <div className="text-xs text-gray-500">{user.contactNumber}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                                                    {user.role}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.isBlocked ? 'danger' : 'success'}>
                                                    {user.isBlocked ? 'Blocked' : 'Active'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Button
                                                    size="sm"
                                                    variant={user.isBlocked ? 'secondary' : 'danger'}
                                                    onClick={() => handleToggleUserBlock(user._id, user.isBlocked)}
                                                >
                                                    {user.isBlocked ? 'Unblock' : 'Block'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No users found</div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Employers Tab */}
                {activeTab === 'employers' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {employers.map((employer) => (
                                        <tr key={employer._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{employer.employerName}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{employer.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{employer.contact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={employer.deleted ? 'danger' : 'success'}>
                                                    {employer.deleted ? 'Deleted' : 'Active'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {employers.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No employers found</div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Demands Tab */}
                {activeTab === 'demands' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Job Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {jobDemands.map((demand) => (
                                        <tr key={demand._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{demand.jobTitle}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{demand.requiredWorkers}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{demand.assignedCount || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusBadgeVariant(demand.status)}>{demand.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{formatDate(demand.deadline)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {jobDemands.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No job demands found</div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Workers Tab */}
                {activeTab === 'workers' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {workers.map((worker) => (
                                        <tr key={worker._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{worker.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusBadgeVariant(worker.status)}>{worker.status}</Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{worker.contact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600 capitalize">
                                                {worker.currentStage?.replace(/-/g, ' ') || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {workers.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No workers found</div>
                            )}
                        </div>
                    </Card>
                )}

                {/* Agents Tab */}
                {activeTab === 'agents' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {subAgents.map((agent) => (
                                        <tr key={agent._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-medium text-gray-900">{agent.name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{agent.country}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{agent.contact}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={getStatusBadgeVariant(agent.status)}>{agent.status}</Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {subAgents.length === 0 && (
                                <div className="text-center py-8 text-gray-500">No sub-agents found</div>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}