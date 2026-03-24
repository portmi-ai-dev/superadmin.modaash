// app/components/audit/AuditLogDetailsModal.tsx

'use client';

import {
  FiClock,
  FiMail,
  FiMapPin,
  FiMonitor,
  FiUser
} from 'react-icons/fi';
import { formatDate } from '../../lib/utils';
import { AuditLog } from '../../types';
import Badge from '../ui/Badge';
import Modal from '../ui/Modal';

interface AuditLogDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

export default function AuditLogDetailsModal({ isOpen, onClose, log }: AuditLogDetailsModalProps) {
  if (!log) return null;

  const getActionBadgeVariant = (action: string): 'danger' | 'warning' | 'success' | 'info' | 'default' => {
    if (action.includes('view')) return 'info';
    if (action.includes('block')) return 'danger';
    if (action.includes('unblock')) return 'success';
    if (action.includes('delete')) return 'danger';
    if (action.includes('restore')) return 'success';
    if (action.includes('export')) return 'warning';
    return 'default';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Audit Log Details" size="lg">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <Badge variant={getActionBadgeVariant(log.action)}>
            {log.action.replace(/_/g, ' ')}
          </Badge>
          <span className="text-xs text-gray-400">Log ID: {log._id}</span>
        </div>

        {/* Admin Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Super Admin</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FiUser className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{log.superAdminId?.fullName || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-gray-600">{log.superAdminId?.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Action Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Action Type</p>
              <p className="text-sm font-medium text-gray-900 capitalize">{log.action}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Target Type</p>
              <p className="text-sm text-gray-600">{log.targetType || 'N/A'}</p>
            </div>
            {log.targetId && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Target ID</p>
                <p className="text-sm font-mono text-gray-600 break-all">{log.targetId}</p>
              </div>
            )}
            {log.reason && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500">Reason</p>
                <p className="text-sm text-gray-600">{log.reason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Request Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Request Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FiClock className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-sm text-gray-600">{formatDate(log.timestamp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FiMapPin className="text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">IP Address</p>
                <p className="text-sm font-mono text-gray-600">{log.ipAddress || 'N/A'}</p>
              </div>
            </div>
            {log.userAgent && (
              <div className="col-span-2 flex items-start gap-2">
                <FiMonitor className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">User Agent</p>
                  <p className="text-xs text-gray-600 break-all">{log.userAgent}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}