// app/components/job-demands/JobDemandCard.tsx

'use client';

import { JobDemand } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  FiBriefcase, 
  FiUsers, 
  FiCalendar, 
  FiClock,
  FiFileText,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';

interface JobDemandCardProps {
  demand: JobDemand;
  onClick?: () => void;
}

export default function JobDemandCard({ demand, onClick }: JobDemandCardProps) {
  const statusVariant = getStatusBadgeVariant(demand.status);
  const isExpired = new Date(demand.deadline) < new Date();
  const isFull = demand.assignedCount >= demand.requiredWorkers;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-orange-500"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <FiBriefcase className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{demand.jobTitle}</h3>
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
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{demand.assignedCount} / {demand.requiredWorkers} workers</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isFull ? 'bg-green-500' : 'bg-orange-500'
            }`}
            style={{ width: `${(demand.assignedCount / demand.requiredWorkers) * 100}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        {demand.employer && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiBriefcase className="text-gray-400" />
            <span>{demand.employer.employerName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar className="text-gray-400" />
          <span>Deadline: {formatDate(demand.deadline)}</span>
          {isExpired && !demand.deleted && (
            <FiAlertCircle className="text-red-500 text-xs" />
          )}
        </div>
        {demand.salary && (
          <div className="text-sm text-gray-600">
            💰 Salary: {demand.salary}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <FiUsers className="text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-700">{demand.assignedCount}</p>
            <p className="text-xs text-gray-500">Assigned</p>
          </div>
          <div className="text-center">
            <FiClock className="text-gray-400 mx-auto mb-1" />
            <p className="text-sm font-semibold text-gray-700">{demand.remainingPositions}</p>
            <p className="text-xs text-gray-500">Remaining</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <span>Created: {formatDate(demand.createdAt)}</span>
        {demand.company && (
          <span className="truncate max-w-[120px]">{demand.company.name}</span>
        )}
      </div>
    </Card>
  );
}