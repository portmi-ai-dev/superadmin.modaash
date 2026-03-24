// app/(dashboard)/sub-agents/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiArrowLeft,
    FiCalendar,
    FiMapPin,
    FiPhone,
    FiRefreshCw,
    FiStar,
    FiTrash2,
    FiUser,
    FiUsers
} from 'react-icons/fi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import Table from '../../../components/ui/Table';
import { superAdminClient } from '../../../lib/api';
import { formatDate, getStatusBadgeVariant } from '../../../lib/utils';
import { SubAgent, Worker } from '../../../types';

interface SubAgentDetails extends SubAgent {
    workers?: Worker[];
    deletedAt?: string; // Add this field
}

interface SubAgentResponse {
    success: boolean;
    data: SubAgentDetails;
}

export default function SubAgentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const agentId = params.id as string;

    const [agent, setAgent] = useState<SubAgentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'workers'>('overview');

    useEffect(() => {
        fetchAgentDetails();
    }, [agentId]);

    const fetchAgentDetails = async () => {
        setLoading(true);
        try {
            const response = await superAdminClient.get(`/sub-agents/${agentId}`);
            const responseData = response.data as SubAgentResponse;
            setAgent(responseData.data);
        } catch (error: any) {
            console.error('Failed to fetch sub-agent details:', error);
            toast.error(error?.response?.data?.message || 'Failed to load sub-agent details');
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

    if (!agent) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Sub-agent not found</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const statusVariant = getStatusBadgeVariant(agent.status);

    // Worker columns
    const workerColumns = [
        { key: 'name', header: 'Worker Name' },
        {
            key: 'status', header: 'Status', render: (item: Worker) => (
                <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
            )
        },
        { key: 'contact', header: 'Contact' },
        {
            key: 'employer', header: 'Employer', render: (item: Worker) => (
                <span className="text-sm">{item.employer?.employerName || 'N/A'}</span>
            )
        },
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
                        <h1 className="text-2xl font-bold text-gray-900">{agent.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={statusVariant}>{agent.status}</Badge>
                            {agent.deleted && (
                                <Badge variant="danger">Deleted</Badge>
                            )}
                            <span className="text-xs text-gray-400">ID: {agent._id}</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchAgentDetails}>
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
                            <span className="text-gray-600">{agent.country || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <FiPhone className="text-gray-400" />
                            <span className="text-gray-600">{agent.contact || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm pt-2 border-t">
                            <FiCalendar className="text-gray-400" />
                            <span className="text-gray-500">Joined: {formatDate(agent.createdAt)}</span>
                        </div>
                    </div>
                </Card>

                {/* Statistics Card */}
                <Card title="Performance">
                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <FiUsers className="text-indigo-500 text-xl" />
                                <FiStar className="text-yellow-500" />
                            </div>
                            <p className="text-3xl font-bold text-indigo-600">{agent.workerCount || 0}</p>
                            <p className="text-sm text-gray-600">Workers Brought</p>
                        </div>

                        {agent.workerCount > 0 && (
                            <div className="pt-3 border-t">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Performance Rating</span>
                                    <span className="font-medium">
                                        {agent.workerCount >= 50 ? 'Excellent' : agent.workerCount >= 20 ? 'Good' : 'Average'}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min((agent.workerCount / 100) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Company Information Card */}
                <Card title="Company">
                    {agent.company ? (
                        <div>
                            <p className="font-medium text-gray-900">{agent.company.name}</p>
                            <p className="text-xs text-gray-500 mt-1">ID: {agent.company._id}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={() => router.push(`/companies/${agent.company?._id}`)}
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
                        className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'overview'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FiUser className="inline mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('workers')}
                        className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'workers'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FiUsers className="inline mr-2" />
                        Workers ({agent.workers?.length || 0})
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <Card>
                    {agent.status === 'active' && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                                This sub-agent is actively bringing workers to the system.
                            </p>
                        </div>
                    )}
                    {agent.status === 'inactive' && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">
                                This sub-agent is currently inactive.
                            </p>
                        </div>
                    )}
                    {agent.status === 'pending' && (
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                This sub-agent is pending approval or verification.
                            </p>
                        </div>
                    )}

                    <div className="text-center py-4">
                        <p className="text-gray-500">No additional information available</p>
                    </div>
                </Card>
            )}

            {activeTab === 'workers' && (
                <Card>
                    {agent.workers && agent.workers.length > 0 ? (
                        <Table
                            columns={workerColumns}
                            data={agent.workers}
                            onRowClick={(worker) => router.push(`/workers/${worker._id}`)}
                        />
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FiUsers className="text-2xl mx-auto mb-2" />
                            <p>No workers brought by this sub-agent yet</p>
                        </div>
                    )}
                </Card>
            )}

            {/* Delete Notice */}
            {agent.deleted && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FiTrash2 className="text-red-600 text-lg mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">This sub-agent has been deleted</p>
                            <p className="text-xs text-red-600 mt-1">
                                Deleted at: {agent.deletedAt ? formatDate(agent.deletedAt) : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}