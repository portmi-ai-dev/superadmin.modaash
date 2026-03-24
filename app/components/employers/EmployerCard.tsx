// app/components/employers/EmployerCard.tsx

'use client';

import { Employer } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  FiBriefcase, 
  FiMapPin, 
  FiPhone, 
  FiFileText,
  FiUsers,
  FiCalendar
} from 'react-icons/fi';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';

interface EmployerCardProps {
  employer: Employer;
  onClick?: () => void;
}

export default function EmployerCard({ employer, onClick }: EmployerCardProps) {
  const statusVariant = getStatusBadgeVariant(employer.status);

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <FiBriefcase className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{employer.employerName}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant}>{employer.status}</Badge>
              {employer.deleted && (
                <Badge variant="danger">Deleted</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Location & Contact */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiMapPin className="text-gray-400" />
          <span>{employer.country || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiPhone className="text-gray-400" />
          <span>{employer.contact || 'N/A'}</span>
        </div>
        {employer.address && (
          <div className="text-sm text-gray-500 truncate">
            {employer.address}
          </div>
        )}
      </div>

      {/* Stats */}
      {employer.stats && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <FiFileText className="text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-700">{employer.stats.jobDemands || 0}</p>
              <p className="text-xs text-gray-500">Job Demands</p>
            </div>
            <div className="text-center">
              <FiUsers className="text-gray-400 mx-auto mb-1" />
              <p className="text-sm font-semibold text-gray-700">{employer.stats.workers || 0}</p>
              <p className="text-xs text-gray-500">Workers</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <FiCalendar className="text-xs" />
          <span>{formatDate(employer.createdAt)}</span>
        </div>
        {employer.company && (
          <span className="text-xs text-gray-500 truncate max-w-[120px]">
            {employer.company.name}
          </span>
        )}
      </div>
    </Card>
  );
}