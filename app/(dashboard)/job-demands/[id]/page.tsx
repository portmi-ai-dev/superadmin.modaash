// app/(dashboard)/job-demands/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCheckCircle,
    FiFileText,
    FiRefreshCw,
    FiTrash2,
    FiUsers
} from 'react-icons/fi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import Table from '../../../components/ui/Table';
import { superAdminClient } from '../../../lib/api';
import { formatDate, getStatusBadgeVariant } from '../../../lib/utils';
import { JobDemand, Worker } from '../../../types';

interface JobDemandDetails extends JobDemand {
    workers?: Worker[];
    deletedAt?: string; // Add this field
}

interface JobDemandResponse {
    success: boolean;
    data: JobDemandDetails;
}

export default function JobDemandDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const demandId = params.id as string;

    const [demand, setDemand] = useState<JobDemandDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDemandDetails();
    }, [demandId]);

    const fetchDemandDetails = async () => {
        setLoading(true);
        try {
            const response = await superAdminClient.get(`/job-demands/${demandId}`);
            const responseData = response.data as JobDemandResponse;
            setDemand(responseData.data);
        } catch (error: any) {
            console.error('Failed to fetch job demand details:', error);
            toast.error(error?.response?.data?.message || 'Failed to load job demand details');
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

    if (!demand) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Job demand not found</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const statusVariant = getStatusBadgeVariant(demand.status);
    const isExpired = new Date(demand.deadline) < new Date();
    const isFull = demand.assignedCount >= demand.requiredWorkers;
    const percentFilled = (demand.assignedCount / demand.requiredWorkers) * 100;

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
            key: 'currentStage', header: 'Stage', render: (item: Worker) => (
                <span className="text-sm capitalize">{item.currentStage?.replace(/-/g, ' ') || 'N/A'}</span>
            )
        },
        { key: 'createdAt', header: 'Added', render: (item: Worker) => formatDate(item.createdAt) },
    ];

    // Document columns
    const documentColumns = [
        { key: 'name', header: 'Document Name' },
        { key: 'category', header: 'Category' },
        { key: 'uploadedAt', header: 'Uploaded', render: (item: any) => formatDate(item.uploadedAt) },
        {
            key: 'hasFile', header: 'Status', render: (item: any) => (
                <Badge variant={item.hasFile ? 'success' : 'default'}>
                    {item.hasFile ? 'Available' : 'Protected'}
                </Badge>
            )
        },
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
                        <h1 className="text-2xl font-bold text-gray-900">{demand.jobTitle}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={statusVariant}>{demand.status}</Badge>
                            {isExpired && demand.status !== 'closed' && (
                                <Badge variant="danger">Expired</Badge>
                            )}
                            {isFull && demand.status !== 'closed' && (
                                <Badge variant="success">Full</Badge>
                            )}
                            {demand.deleted && (
                                <Badge variant="danger">Deleted</Badge>
                            )}
                            <span className="text-xs text-gray-400">ID: {demand._id}</span>
                        </div>
                    </div>
                </div>
                <Button variant="outline" onClick={fetchDemandDetails}>
                    <FiRefreshCw className="mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details Card */}
                <Card title="Job Details" className="lg:col-span-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500">Employer</p>
                                <p className="text-gray-900 font-medium">{demand.employer?.employerName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Company</p>
                                <p className="text-gray-900">{demand.company?.name || 'N/A'}</p>
                            </div>
                            {demand.salary && (
                                <div>
                                    <p className="text-xs text-gray-500">Salary</p>
                                    <p className="text-gray-900">{demand.salary}</p>
                                </div>
                            )}
                            {demand.tenure && (
                                <div>
                                    <p className="text-xs text-gray-500">Tenure</p>
                                    <p className="text-gray-900">{demand.tenure}</p>
                                </div>
                            )}
                        </div>

                        {demand.description && (
                            <div className="pt-3 border-t">
                                <p className="text-xs text-gray-500 mb-2">Description</p>
                                <p className="text-sm text-gray-600">{demand.description}</p>
                            </div>
                        )}

                        {demand.skills && demand.skills.length > 0 && (
                            <div className="pt-3 border-t">
                                <p className="text-xs text-gray-500 mb-2">Skills Required</p>
                                <div className="flex flex-wrap gap-2">
                                    {demand.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="default">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Statistics Card */}
                <Card title="Statistics">
                    <div className="space-y-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600">{demand.requiredWorkers}</p>
                            <p className="text-sm text-gray-600">Total Positions</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Assigned Workers</span>
                                <span className="font-medium">{demand.assignedCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Remaining Positions</span>
                                <span className="font-medium text-orange-600">{demand.remainingPositions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Fill Rate</span>
                                <span className="font-medium">{Math.round(percentFilled)}%</span>
                            </div>
                        </div>

                        <div className="pt-3 border-t">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Deadline</span>
                                <span className={`${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                                    {formatDate(demand.deadline)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Created</span>
                                <span className="text-gray-500">{formatDate(demand.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress Bar */}
            <Card>
                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="font-medium">Fulfillment Progress</span>
                        <span>{demand.assignedCount} / {demand.requiredWorkers} workers</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all ${isFull ? 'bg-green-500' : 'bg-orange-500'
                                }`}
                            style={{ width: `${percentFilled}%` }}
                        />
                    </div>
                    {isFull && (
                        <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                            <FiCheckCircle />
                            <span>All positions filled!</span>
                        </div>
                    )}
                    {isExpired && !isFull && demand.status !== 'closed' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                            <FiAlertCircle />
                            <span>Deadline passed with {demand.remainingPositions} positions unfilled</span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Assigned Workers */}
            {demand.workers && demand.workers.length > 0 ? (
                <Card title={`Assigned Workers (${demand.workers.length})`}>
                    <Table
                        columns={workerColumns}
                        data={demand.workers}
                        onRowClick={(worker) => router.push(`/workers/${worker._id}`)}
                    />
                </Card>
            ) : (
                <Card title="Assigned Workers">
                    <div className="text-center py-8 text-gray-500">
                        <FiUsers className="text-2xl mx-auto mb-2" />
                        <p>No workers assigned to this demand yet</p>
                    </div>
                </Card>
            )}

            {/* Documents */}
            {demand.documents && demand.documents.length > 0 ? (
                <Card title="Documents">
                    <Table columns={documentColumns} data={demand.documents} />
                </Card>
            ) : (
                <Card title="Documents">
                    <div className="text-center py-8 text-gray-500">
                        <FiFileText className="text-2xl mx-auto mb-2" />
                        <p>No documents attached</p>
                    </div>
                </Card>
            )}

            {/* Delete Notice */}
            {demand.deleted && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FiTrash2 className="text-red-600 text-lg mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">This job demand has been deleted</p>
                            <p className="text-xs text-red-600 mt-1">
                                Deleted at: {demand.deletedAt ? formatDate(demand.deletedAt) : 'Unknown'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}