// app/components/companies/CompanyTable.tsx

'use client';

import { Company } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';
import { FiEye, FiLock, FiUnlock } from 'react-icons/fi';

interface CompanyTableProps {
  companies: Company[];
  onView: (company: Company) => void;
  onToggleBlock: (company: Company) => void;
}

export default function CompanyTable({ companies, onView, onToggleBlock }: CompanyTableProps) {
  const columns = [
    {
      key: 'name',
      header: 'Company Name',
      render: (company: Company) => (
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img src={company.logo} alt={company.name} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500">No logo</span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">{company.name}</p>
            <p className="text-xs text-gray-500">{company.contactEmail || 'No email'}</p>
          </div>
        </div>
      )
    },
    {
      key: 'contactPhone',
      header: 'Contact',
      render: (company: Company) => (
        <div>
          <p className="text-sm text-gray-600">{company.contactPhone || 'N/A'}</p>
          <p className="text-xs text-gray-400">{company.address?.country || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'subscriptionStatus',
      header: 'Status',
      render: (company: Company) => (
        <Badge variant={getStatusBadgeVariant(company.subscriptionStatus)}>
          {company.subscriptionStatus}
        </Badge>
      )
    },
    {
      key: 'isActive',
      header: 'Blocked',
      render: (company: Company) => (
        <Badge variant={company.isActive ? 'success' : 'danger'}>
          {company.isActive ? 'Active' : 'Blocked'}
        </Badge>
      )
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (company: Company) => (
        <div className="text-xs text-gray-500 space-y-0.5">
          <div>👥 {company.stats?.admins || 0} Admins</div>
          <div>👤 {company.stats?.employees || 0} Employees</div>
          <div>🏢 {company.stats?.employers || 0} Employers</div>
          <div>👷 {company.stats?.workers || 0} Workers</div>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (company: Company) => (
        <span className="text-sm text-gray-500">{formatDate(company.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (company: Company) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView(company);
            }}
          >
            <FiEye className="text-sm" />
          </Button>
          <Button
            size="sm"
            variant={company.isActive ? 'danger' : 'secondary'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBlock(company);
            }}
          >
            {company.isActive ? <FiLock className="text-sm" /> : <FiUnlock className="text-sm" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={companies}
      onRowClick={onView}
    />
  );
}