// app/components/sub-agents/SubAgentCard.tsx

'use client';

import { SubAgent } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  FiUser, 
  FiMapPin, 
  FiPhone, 
  FiUsers,
  FiCalendar,
  FiStar
} from 'react-icons/fi';
import { formatDate, getStatusBadgeVariant } from '../../lib/utils';

interface SubAgentCardProps {
  agent: SubAgent;
  onClick?: () => void;
}

export default function SubAgentCard({ agent, onClick }: SubAgentCardProps) {
  const statusVariant = getStatusBadgeVariant(agent.status);

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <FiUser className="text-white text-lg" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant}>{agent.status}</Badge>
              {agent.deleted && (
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
          <span>{agent.country || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiPhone className="text-gray-400" />
          <span>{agent.contact || 'N/A'}</span>
        </div>
      </div>

      {/* Worker Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers className="text-gray-400" />
            <span className="text-sm text-gray-600">Workers Brought</span>
          </div>
          <div className="flex items-center gap-1">
            <FiStar className="text-yellow-500 text-sm" />
            <span className="text-xl font-bold text-indigo-600">{agent.workerCount || 0}</span>
          </div>
        </div>
        
        {/* Progress bar for workers (if we want to show a target) */}
        {agent.workerCount > 0 && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min((agent.workerCount / 50) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {agent.workerCount} total workers
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
        <span>Joined: {formatDate(agent.createdAt)}</span>
        {agent.company && (
          <span className="truncate max-w-[120px]">{agent.company.name}</span>
        )}
      </div>
    </Card>
  );
}