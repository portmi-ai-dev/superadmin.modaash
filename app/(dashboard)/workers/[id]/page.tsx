// app/(dashboard)/workers/[id]/page.tsx

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    FiArrowLeft,
    FiBriefcase,
    FiCalendar,
    FiClock,
    FiFileText,
    FiFlag,
    FiGlobe,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiShield,
    FiTag,
    FiUser,
    FiUserPlus,
    FiUsers
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
            console.log('=== WORKER DETAILS DEBUG ===');
            console.log('Worker details:', responseData.data);
            console.log('Company:', responseData.data.company);
            console.log('Employer:', responseData.data.employer);
            console.log('Job Demand:', responseData.data.jobDemand);
            console.log('Sub Agent:', responseData.data.subAgent);
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

    // Helper functions with better fallbacks
    const getCompanyName = () => {
        if (worker.company?.name) return worker.company.name;
        if (worker.companyId && typeof worker.companyId === 'object' && 'name' in worker.companyId) {
            return (worker.companyId as any).name;
        }
        return 'Not Assigned';
    };

    const getEmployerName = () => {
        if (worker.employer?.employerName) return worker.employer.employerName;
        if (worker.employerId && typeof worker.employerId === 'object' && 'employerName' in worker.employerId) {
            return (worker.employerId as any).employerName;
        }
        return 'Not Assigned';
    };

    const getEmployerCountry = () => {
        if (worker.employer?.country) return worker.employer.country;
        if (worker.employerId && typeof worker.employerId === 'object' && 'country' in worker.employerId) {
            return (worker.employerId as any).country;
        }
        return 'Not Specified';
    };

    const getJobDemandTitle = () => {
        if (worker.jobDemand?.jobTitle) return worker.jobDemand.jobTitle;
        if (worker.jobDemandId && typeof worker.jobDemandId === 'object' && 'jobTitle' in worker.jobDemandId) {
            return (worker.jobDemandId as any).jobTitle;
        }
        return 'Not Assigned';
    };

    const getSubAgentName = () => {
        if (worker.subAgent?.name) return worker.subAgent.name;
        if (worker.subAgentId && typeof worker.subAgentId === 'object' && 'name' in worker.subAgentId) {
            return (worker.subAgentId as any).name;
        }
        return 'Not Assigned';
    };

    // Destination: Where the worker is going (employer's location)
    const getDestination = () => {
        const country = getEmployerCountry();
        if (country !== 'Not Specified') {
            return country;
        }
        return 'Not Specified';
    };

    // Origin: Where the worker is coming from
    const getOrigin = () => {
        if (worker.country) return worker.country;
        return 'Nepal';
    };

    // Check if any data is available
    const hasEmployerData = getEmployerName() !== 'Not Assigned';
    const hasJobDemandData = getJobDemandTitle() !== 'Not Assigned';
    const hasSubAgentData = getSubAgentName() !== 'Not Assigned';

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

                        {/* Origin & Destination */}
                        <div className="pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiFlag className="text-blue-500 text-sm" />
                                        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Origin</p>
                                    </div>
                                    <p className="text-gray-800 font-medium">{getOrigin()}</p>
                                    <p className="text-xs text-blue-600 mt-1">Country of origin</p>
                                </div>
                                <div className="p-3 bg-emerald-50 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiGlobe className="text-emerald-500 text-sm" />
                                        <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Destination</p>
                                    </div>
                                    <p className="text-gray-800 font-medium">{getDestination()}</p>
                                    <p className="text-xs text-emerald-600 mt-1">Where the worker is going</p>
                                </div>
                            </div>
                        </div>

                        {/* Sensitive Information Section */}
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

                {/* Assignment & Deployment Details */}
                <Card title="Assignment & Deployment">
                    <div className="space-y-4">
                        {/* Agency */}
                        <div className="pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <FiBriefcase className="w-3 h-3 text-indigo-600" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Manpower Agency</p>
                            </div>
                            <p className="text-gray-900 font-medium">{getCompanyName()}</p>
                            <p className="text-xs text-gray-400 mt-1">The agency managing this worker</p>
                        </div>

                        {/* Employer */}
                        <div className="pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <FiUserPlus className="w-3 h-3 text-emerald-600" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employer</p>
                            </div>
                            <p className="text-gray-900 font-medium">{getEmployerName()}</p>
                            {getEmployerCountry() !== 'Not Specified' && (
                                <div className="flex items-center gap-1 mt-1">
                                    <FiMapPin className="w-3 h-3 text-gray-400" />
                                    <p className="text-xs text-gray-500">{getEmployerCountry()}</p>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-1">The foreign company hiring this worker</p>
                        </div>

                        {/* Job Demand */}
                        <div className="pb-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <FiTag className="w-3 h-3 text-amber-600" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Job Position</p>
                            </div>
                            <p className="text-gray-900 font-medium">{getJobDemandTitle()}</p>
                            <p className="text-xs text-gray-400 mt-1">The role the worker will perform</p>
                        </div>

                        {/* Sub Agent - Only show if exists */}
                        {hasSubAgentData && (
                            <div className="pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FiUsers className="w-3 h-3 text-purple-600" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sub Agent</p>
                                </div>
                                <p className="text-gray-900 font-medium">{getSubAgentName()}</p>
                                <p className="text-xs text-gray-400 mt-1">The local agent facilitating recruitment</p>
                            </div>
                        )}

                        {/* Current Stage */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FiClock className="w-3 h-3 text-gray-500" />
                                </div>
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current Stage</p>
                            </div>
                            <p className="text-gray-900 capitalize font-medium">{worker.currentStage?.replace(/-/g, ' ') || 'Not Started'}</p>
                            <p className="text-xs text-gray-400 mt-1">Progress in deployment process</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Deployment Journey */}
            <Card title="Deployment Journey">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FiFlag className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-xs text-gray-500">Origin</p>
                        <p className="text-sm font-semibold text-gray-800">{getOrigin()}</p>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FiBriefcase className="w-5 h-5 text-indigo-600" />
                        </div>
                        <p className="text-xs text-gray-500">Via Agency</p>
                        <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{getCompanyName()}</p>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <FiGlobe className="w-5 h-5 text-emerald-600" />
                        </div>
                        <p className="text-xs text-gray-500">Destination</p>
                        <p className="text-sm font-semibold text-gray-800">{getDestination()}</p>
                    </div>
                </div>
            </Card>

            {/* Stage Timeline */}
            {worker.stageTimeline && worker.stageTimeline.length > 0 && (
                <Card title="Stage Timeline">
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

            {/* Documents Section */}
            {worker.documents && worker.documents.length > 0 && (
                <Card title="Documents">
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
    );
}