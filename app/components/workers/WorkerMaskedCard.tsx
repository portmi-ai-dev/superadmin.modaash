// app/components/workers/WorkerMaskedCard.tsx

'use client';

import {
    FiFileText,
    FiPhone,
    FiShield,
    FiUser
} from 'react-icons/fi';
import { getStatusBadgeVariant } from '../../lib/utils';
import { Worker } from '../../types';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

interface WorkerMaskedCardProps {
    worker: Worker;
    onClick?: () => void;
}

export default function WorkerMaskedCard({ worker, onClick }: WorkerMaskedCardProps) {
    const statusVariant = getStatusBadgeVariant(worker.status);

    const statusText = {
        pending: 'Pending',
        processing: 'Processing',
        deployed: 'Deployed',
        rejected: 'Rejected'
    }[worker.status] || worker.status;

    return (
        <Card
            className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-pink-500"
            onClick={onClick}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FiUser className="text-white text-lg" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant={statusVariant}>{statusText}</Badge>
                            <Badge variant="info">{worker.currentStage?.replace(/-/g, ' ') || 'N/A'}</Badge>
                        </div>
                    </div>
                </div>
                {/* No unmask button - data always masked for human */}
            </div>

            {/* Contact Info */}
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="text-gray-400" />
                    <span>{worker.contact || 'N/A'}</span>
                </div>

                {/* Masked PII - Always masked */}
                <div className="flex items-center gap-2 text-sm">
                    <FiFileText className="text-gray-400" />
                    {worker.passportNumber ? (
                        <span className="font-mono text-gray-600">
                            Passport: {worker.passportNumber}
                        </span>
                    ) : (
                        <span className="text-gray-400">No passport</span>
                    )}
                </div>

                {worker.citizenshipNumber && (
                    <div className="flex items-center gap-2 text-sm">
                        <FiFileText className="text-gray-400" />
                        <span className="font-mono text-gray-600">
                            Citizenship: {worker.citizenshipNumber}
                        </span>
                    </div>
                )}
            </div>

            {/* Company & Employer Info */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Company</span>
                    <span className="font-medium text-gray-700">{worker.company?.name || 'N/A'}</span>
                </div>
                {worker.employer && (
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">Employer</span>
                        <span className="text-gray-600">{worker.employer.employerName}</span>
                    </div>
                )}
                {worker.jobDemand && (
                    <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">Job Demand</span>
                        <span className="text-gray-600">{worker.jobDemand.jobTitle}</span>
                    </div>
                )}
            </div>

            {/* Documents Indicator */}
            {worker.documents && worker.documents.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <FiFileText className="text-xs text-gray-400" />
                    <span className="text-xs text-gray-500">
                        {worker.documents.length} document(s) attached
                    </span>
                    <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <FiShield className="text-xs" />
                        Protected
                    </span>
                </div>
            )}

            {/* Privacy Notice */}
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-2">
                    <FiShield className="text-gray-400 text-sm mt-0.5" />
                    <p className="text-xs text-gray-500">
                        Personal data protected. Full access only via API for authorized analysis.
                    </p>
                </div>
            </div>
        </Card>
    );
}