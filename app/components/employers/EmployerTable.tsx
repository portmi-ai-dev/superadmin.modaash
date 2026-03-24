// app/components/employers/EmployerTable.tsx

'use client';

import { Employer } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';
import { FiEye } from 'react-icons/fi';

interface EmployerTableProps {
  employers: Employer[];
  onView: (employer: Employer) => void;
}

export default function EmployerTable({ employers, onView }: EmployerTableProps) {
  const columns = [
    {
      key: 'employerName',
      header: 'Employer Name',
      render: (employer: Employer) => (
        <div>
          <p className="font-medium text-gray-900">{employer.employerName}</p>
          <p className="text-xs text-gray-500">ID: {employer._id.slice(-6)}</p>
        </div>
      )
    },
    {
      key: 'country',
      header: 'Country',
      render: (employer: Employer) => (
        <span className="text-sm text-gray-600">{employer.country}</span>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (employer: Employer) => (
        <div>
          <p className="text-sm text-gray-600">{employer.contact}</p>
          {employer.address && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{employer.address}</p>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (employer: Employer) => (
        <div className="space-y-1">
          <Badge variant={getStatusBadgeVariant(employer.status)}>
            {employer.status}
          </Badge>
          {employer.deleted && (
            <Badge variant="danger">Deleted</Badge>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (employer: Employer) => (
        <div className="text-xs text-gray-500">
          <div>📋 {employer.stats?.jobDemands || 0} Demands</div>
          <div>👥 {employer.stats?.workers || 0} Workers</div>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (employer: Employer) => (
        <span className="text-sm text-gray-600 truncate block max-w-[150px]">
          {employer.company?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (employer: Employer) => (
        <span className="text-sm text-gray-500">{formatDate(employer.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (employer: Employer) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView(employer);
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
      data={employers}
      onRowClick={onView}
    />
  );
}