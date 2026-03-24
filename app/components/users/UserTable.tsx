// app/components/users/UserTable.tsx

'use client';

import { User } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { formatDate } from '../../lib/utils';
import { FiLock, FiUnlock, FiEye } from 'react-icons/fi';

interface UserTableProps {
  users: User[];
  onView: (user: User) => void;
  onToggleBlock: (user: User) => void;
}

export default function UserTable({ users, onView, onToggleBlock }: UserTableProps) {
  const columns = [
    {
      key: 'fullName',
      header: 'User',
      render: (user: User) => (
        <div>
          <p className="font-medium text-gray-900">{user.fullName}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      )
    },
    {
      key: 'contactNumber',
      header: 'Contact',
      render: (user: User) => (
        <div>
          <p className="text-sm text-gray-600">{user.contactNumber}</p>
          {user.address && (
            <p className="text-xs text-gray-400 truncate max-w-[200px]">{user.address}</p>
          )}
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (user: User) => (
        <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
          {user.role === 'admin' ? 'Admin' : 'Employee'}
        </Badge>
      )
    },
    {
      key: 'company',
      header: 'Company',
      render: (user: User) => (
        <div>
          <p className="text-sm font-medium text-gray-700">{user.company?.name || 'N/A'}</p>
          <p className="text-xs text-gray-400">ID: {user.companyId?.slice(-6) || 'N/A'}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => (
        <Badge variant={user.isBlocked ? 'danger' : 'success'}>
          {user.isBlocked ? 'Blocked' : 'Active'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Joined',
      render: (user: User) => (
        <span className="text-sm text-gray-500">{formatDate(user.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView(user);
            }}
          >
            <FiEye className="text-sm" />
          </Button>
          <Button
            size="sm"
            variant={user.isBlocked ? 'secondary' : 'danger'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBlock(user);
            }}
          >
            {user.isBlocked ? <FiUnlock className="text-sm" /> : <FiLock className="text-sm" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={users}
      onRowClick={onView}
    />
  );
}