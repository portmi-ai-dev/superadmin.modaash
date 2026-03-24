// app/components/job-demands/JobDemandTable.tsx

'use client';

import { JobDemand } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';
import { FiEye } from 'react-icons/fi';

interface JobDemandTableProps {
  demands: JobDemand[];
  onView: (demand: JobDemand) => void;
}

export default function JobDemandTable({ demands, onView }: JobDemandTableProps) {
  const columns = [
    {
      key: 'jobTitle',
      header: 'Job Title',
      render: (demand: JobDemand) => (
        <div>
          <p className="font-medium text-gray-900">{demand.jobTitle}</p>
          <p className="text-xs text-gray-500">ID: {demand._id.slice(-6)}</p>
        </div>
      )
    },
    {
      key: 'employer',
      header: 'Employer',
      render: (demand: JobDemand) => (
        <span className="text-sm text-gray-600">{demand.employer?.employerName || 'N/A'}</span>
      )
    },
    {
      key: 'requiredWorkers',
      header: 'Workers',
      render: (demand: JobDemand) => (
        <div className="text-sm">
          <span className="font-medium">{demand.assignedCount}</span>
          <span className="text-gray-500"> / {demand.requiredWorkers}</span>
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (demand: JobDemand) => {
        const percent = (demand.assignedCount / demand.requiredWorkers) * 100;
        return (
          <div className="w-24">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${percent >= 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                style={{ width: `${Math.min(percent, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">{Math.round(percent)}%</span>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (demand: JobDemand) => (
        <div className="space-y-1">
          <Badge variant={getStatusBadgeVariant(demand.status)}>{demand.status}</Badge>
          {demand.deleted && <Badge variant="danger">Deleted</Badge>}
        </div>
      )
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (demand: JobDemand) => (
        <span className={`text-sm ${new Date(demand.deadline) < new Date() ? 'text-red-500' : 'text-gray-600'}`}>
          {formatDate(demand.deadline)}
        </span>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (demand: JobDemand) => (
        <span className="text-sm text-gray-600 truncate block max-w-[150px]">
          {demand.company?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (demand: JobDemand) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView(demand);
          }}
        >
          <FiEye className="text-sm" />
        </Button>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={demands}
      onRowClick={onView}
    />
  );
}