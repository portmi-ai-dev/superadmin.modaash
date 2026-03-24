// app/components/companies/CompanyCard.tsx

'use client';

import { Company } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { FiHome, FiMail, FiPhone, FiCalendar, FiUsers, FiBriefcase, FiUserCheck, FiFileText } from 'react-icons/fi';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';

interface CompanyCardProps {
  company: Company;
  onClick?: () => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const statusVariant = getStatusBadgeVariant(company.subscriptionStatus);
  
  const statusText = {
    active: 'Active',
    expired: 'Expired',
    cancelled: 'Cancelled',
    trial: 'Trial'
  }[company.subscriptionStatus] || company.subscriptionStatus;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {company.logo ? (
            <img 
              src={company.logo} 
              alt={company.name} 
              className="w-12 h-12 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FiHome className="text-white text-xl" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant}>{statusText}</Badge>
              {!company.isActive && (
                <Badge variant="danger">Blocked</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {company.contactEmail && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiMail className="text-gray-400" />
            <span>{company.contactEmail}</span>
          </div>
        )}
        {company.contactPhone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FiPhone className="text-gray-400" />
            <span>{company.contactPhone}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar className="text-gray-400" />
          <span>Created: {formatDate(company.createdAt)}</span>
        </div>
      </div>

      {company.stats && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Admins</p>
              <p className="text-sm font-semibold text-gray-700">{company.stats.admins}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employees</p>
              <p className="text-sm font-semibold text-gray-700">{company.stats.employees}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Employers</p>
              <p className="text-sm font-semibold text-gray-700">{company.stats.employers}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Workers</p>
              <p className="text-sm font-semibold text-gray-700">{company.stats.workers}</p>
            </div>
          </div>
        </div>
      )}

      {company.billing?.expiryDate && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500">Plan: {company.billing.plan}</span>
            <span className="text-gray-500">
              Expires: {formatDate(company.billing.expiryDate)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}