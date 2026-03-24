// app/(dashboard)/workers/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiArrowLeft,
    FiFileText,
    FiLock,
    FiShield,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiCalendar,
    FiBriefcase,
    FiClock
} from 'react-icons/fi';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import { superAdminClient } from '../../../lib/api';
import { formatDate, getStatusBadgeVariant } from '../../../lib/utils';
import { Worker } from '../../../types';

interface WorkerDetails extends Worker {
    dob?: string;
}

interface WorkerResponse {
    success: boolean;
    data: WorkerDetails;
}

export default function WorkerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const workerId = params.id as string;

    const [worker, setWorker] = useState<WorkerDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWorkerDetails();
    }, [workerId]);

    const fetchWorkerDetails = async () => {
        setLoading(true);
        try {
            const response = await superAdminClient.get(`/workers/${workerId}`);
            const responseData = response.data as WorkerResponse;
            setWorker(responseData.data);
        } catch (error: any) {
            console.error('Failed to fetch worker details:', error);
            toast.error(error?.response?.data?.message || 'Failed to load worker details');
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

    if (!worker) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Worker not found</p>
                <Button variant="outline" onClick={() => router.back()} className="mt-4">
                    Go Back
                </Button>
            </div>
        );
    }

    const statusVariant = getStatusBadgeVariant(worker.status);

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
                        <h1 className="text-2xl font-bold text-gray-900">{worker.name}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={statusVariant}>{worker.status}</Badge>
                            <Badge variant="info">{worker.currentStage?.replace(/-/g, ' ') || 'N/A'}</Badge>
                            <Badge variant="default">
                                <FiLock className="inline mr-1 text-xs" />
                                Masked View
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* Privacy Notice */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-start gap-3">
                    <FiShield className="text-purple-600 text-lg mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-purple-800">Data Privacy Protection</p>
                        <p className="text-xs text-purple-700">
                            Personal identification data is masked for security. Full access to sensitive data is available
                            only through the API with proper authentication and audit logging for analysis purposes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information Card */}
                <Card title="Personal Information" className="lg:col-span-2">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <FiUser className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Full Name</p>
                                    <p className="text-gray-900 font-medium">{worker.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FiPhone className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Contact Number</p>
                                    <p className="text-gray-900">{worker.contact || 'N/A'}</p>
                                </div>
                            </div>
                            {worker.email && (
                                <div className="flex items-start gap-2">
                                    <FiMail className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-gray-900">{worker.email}</p>
                                    </div>
                                </div>
                            )}
                            {worker.address && (
                                <div className="flex items-start gap-2">
                                    <FiMapPin className="text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-xs text-gray-500">Address</p>
                                        <p className="text-gray-900">{worker.address}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sensitive Information Section - ALWAYS MASKED */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-3">
                                <FiLock className="text-gray-400 text-sm" />
                                <p className="text-sm font-medium text-gray-700">Identification Documents (Masked)</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Passport Number</p>
                                    <p className="font-mono text-gray-600">
                                        {worker.passportNumber || 'N/A'}
                                    </p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500">Citizenship Number</p>
                                    <p className="font-mono text-gray-600">
                                        {worker.citizenshipNumber || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                <FiShield className="text-xs" />
                                Full data available via API only
                            </p>
                        </div>

                        {/* Dates */}
                        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <FiCalendar className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Date of Birth</p>
                                    <p className="text-gray-900">{worker.dob ? formatDate(worker.dob) : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <FiClock className="text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Created Date</p>
                                    <p className="text-gray-900">{formatDate(worker.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Assignment Information */}
                <Card title="Assignment">
                    <div className="space-y-3">
                        <div>
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="text-gray-900 font-medium">{worker.company?.name || 'N/A'}</p>
                        </div>
                        {worker.employer && (
                            <div>
                                <p className="text-xs text-gray-500">Employer</p>
                                <p className="text-gray-900">{worker.employer.employerName}</p>
                                {worker.employer.country && (
                                    <p className="text-xs text-gray-500 mt-1">{worker.employer.country}</p>
                                )}
                            </div>
                        )}
                        {worker.jobDemand && (
                            <div>
                                <p className="text-xs text-gray-500">Job Demand</p>
                                <p className="text-gray-900">{worker.jobDemand.jobTitle}</p>
                            </div>
                        )}
                        {worker.subAgent && (
                            <div>
                                <p className="text-xs text-gray-500">Sub Agent</p>
                                <p className="text-gray-900">{worker.subAgent.name}</p>
                            </div>
                        )}
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Current Stage</p>
                            <p className="text-gray-900 capitalize">{worker.currentStage?.replace(/-/g, ' ') || 'N/A'}</p>
                        </div>
                    </div>
                </Card>

                {/* Stage Timeline */}
                {worker.stageTimeline && worker.stageTimeline.length > 0 && (
                    <Card title="Stage Timeline" className="lg:col-span-3">
                        <div className="space-y-3">
                            {worker.stageTimeline.map((stage, index) => (
                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-blue-600">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900 capitalize">
                                                {stage.stage.replace(/-/g, ' ')}
                                            </p>
                                            <Badge variant={getStatusBadgeVariant(stage.status)}>
                                                {stage.status}
                                            </Badge>
                                        </div>
                                        {stage.date && (
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(stage.date)}</p>
                                        )}
                                        {stage.notes && (
                                            <p className="text-sm text-gray-600 mt-1">{stage.notes}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Documents Section - Always Locked */}
                {worker.documents && worker.documents.length > 0 && (
                    <Card title="Documents" className="lg:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {worker.documents.map((doc, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                    <FiFileText className="text-gray-400 text-xl" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {doc.category} • {doc.fileSize}
                                        </p>
                                    </div>
                                    <FiLock className="text-gray-400" />
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                            <p className="text-xs text-gray-600">
                                <FiLock className="inline mr-1" />
                                Documents are protected. Full access available via API only.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}