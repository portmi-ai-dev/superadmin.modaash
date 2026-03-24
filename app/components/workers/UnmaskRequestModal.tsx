// app/components/workers/UnmaskRequestModal.tsx

'use client';

import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { FiAlertTriangle, FiLock, FiUnlock } from 'react-icons/fi';

interface UnmaskRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  workerName: string;
  isLoading?: boolean;
}

export default function UnmaskRequestModal({
  isOpen,
  onClose,
  onConfirm,
  workerName,
  isLoading = false
}: UnmaskRequestModalProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Please provide a reason for accessing sensitive data');
      return;
    }
    if (reason.trim().length < 10) {
      setError('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }
    onConfirm(reason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Access to Sensitive Data"
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="text-yellow-600 text-lg mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Security Notice</p>
              <p className="text-xs text-yellow-700 mt-1">
                You are requesting to view sensitive personal information for <strong>{workerName}</strong>.
                This includes passport numbers, citizenship numbers, and document images.
              </p>
              <p className="text-xs text-yellow-700 mt-2">
                All access will be logged and audited. Provide a valid reason below.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Access *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Investigating a compliance issue, Legal request, etc."
            disabled={isLoading}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            <strong>Legal Note:</strong> Unauthorized access to personal data may violate privacy laws.
            All access is monitored and logged.
          </p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            <FiUnlock className="mr-2" />
            Request Access
          </Button>
        </div>
      </div>
    </Modal>
  );
}