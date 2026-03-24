// app/components/sub-agents/SubAgentTable.tsx

'use client';

import { SubAgent } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';
import { FiEye } from 'react-icons/fi';

interface SubAgentTableProps {
  agents: SubAgent[];
  onView: (agent: SubAgent) => void;
}

export default function SubAgentTable({ agents, onView }: SubAgentTableProps) {
  const columns = [
    {
      key: 'name',
      header: 'Agent Name',
      render: (agent: SubAgent) => (
        <div>
          <p className="font-medium text-gray-900">{agent.name}</p>
          <p className="text-xs text-gray-500">ID: {agent._id.slice(-6)}</p>
        </div>
      )
    },
    {
      key: 'country',
      header: 'Country',
      render: (agent: SubAgent) => (
        <span className="text-sm text-gray-600">{agent.country}</span>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (agent: SubAgent) => (
        <span className="text-sm text-gray-600">{agent.contact}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (agent: SubAgent) => (
        <div className="space-y-1">
          <Badge variant={getStatusBadgeVariant(agent.status)}>{agent.status}</Badge>
          {agent.deleted && <Badge variant="danger">Deleted</Badge>}
        </div>
      )
    },
    {
      key: 'workerCount',
      header: 'Workers',
      render: (agent: SubAgent) => (
        <div className="text-center">
          <span className="text-lg font-bold text-indigo-600">{agent.workerCount || 0}</span>
          <p className="text-xs text-gray-500">workers</p>
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (agent: SubAgent) => (
        <span className="text-sm text-gray-600 truncate block max-w-[150px]">
          {agent.company?.name || 'N/A'}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (agent: SubAgent) => (
        <span className="text-sm text-gray-500">{formatDate(agent.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (agent: SubAgent) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onView(agent);
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
      data={agents}
      onRowClick={onView}
    />
  );
}