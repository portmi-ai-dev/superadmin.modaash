// app/(dashboard)/users/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { superAdminClient } from '../../../lib/api';
import { User, Company } from '../../../types';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Spinner from '../../../components/ui/Spinner';
import { 
  FiArrowLeft, 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar,
  FiLock,
  FiUnlock,
  FiRefreshCw,
  FiBriefcase,
  FiShield
} from 'react-icons/fi';
import { formatDate } from '../../../lib/utils';
import toast from 'react-hot-toast';

interface UserDetails extends User {
  company?: Company;
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const response = await superAdminClient.get(`/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!user) return;
    
    const action = user.isBlocked ? 'unblock' : 'block';
    const confirmed = confirm(`Are you sure you want to ${action} ${user.fullName}?`);
    
    if (!confirmed) return;

    try {
      const response = await superAdminClient.patch(`/users/${userId}/toggle-block`);
      if (response.data.success) {
        toast.success(`User ${action}ed successfully`);
        fetchUserDetails();
      }
    } catch (error) {
      toast.error(`Failed to ${action} user`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.role === 'admin' ? 'info' : 'default'}>
                {user.role === 'admin' ? 'Admin' : 'Employee'}
              </Badge>
              <Badge variant={user.isBlocked ? 'danger' : 'success'}>
                {user.isBlocked ? 'Blocked' : 'Active'}
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant={user.isBlocked ? 'secondary' : 'danger'}
          onClick={handleToggleBlock}
        >
          {user.isBlocked ? (
            <>
              <FiUnlock className="mr-2" />
              Unblock User
            </>
          ) : (
            <>
              <FiLock className="mr-2" />
              Block User
            </>
          )}
        </Button>
      </div>

      {/* User Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
          <p className="text-gray-500 text-sm mt-1">{user.role}</p>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">User ID</span>
              <span className="font-mono text-xs">{user._id}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-500">Joined</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card title="Contact Information" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiMail className="text-gray-400 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Email Address</p>
                <p className="text-gray-900">{user.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiPhone className="text-gray-400 text-xl" />
              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="text-gray-900">{user.contactNumber || 'N/A'}</p>
              </div>
            </div>
            
            {user.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiMapPin className="text-gray-400 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-gray-900">{user.address}</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Company Information */}
        <Card title="Company Information" className="lg:col-span-3">
          {user.company ? (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              {user.company.logo ? (
                <img 
                  src={user.company.logo} 
                  alt={user.company.name} 
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FiBriefcase className="text-blue-600 text-xl" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user.company.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={user.company.isActive ? 'success' : 'danger'}>
                    {user.company.isActive ? 'Active' : 'Blocked'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    ID: {user.company._id.slice(-6)}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/companies/${user.company?._id}`)}
              >
                View Company
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FiShield className="text-2xl mx-auto mb-2" />
              <p>This is a system user</p>
              <p className="text-sm">No company associated</p>
            </div>
          )}
        </Card>

        {/* Activity Log (Optional - can be added later) */}
        <Card title="Recent Activity" className="lg:col-span-3">
          <div className="text-center py-8 text-gray-500">
            <FiCalendar className="text-2xl mx-auto mb-2" />
            <p>Activity log coming soon</p>
            <p className="text-sm">User actions will appear here</p>
          </div>
        </Card>
      </div>
    </div>
  );
}