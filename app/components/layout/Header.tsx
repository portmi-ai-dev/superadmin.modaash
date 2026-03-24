// app/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { FiBell, FiUser, FiChevronDown, FiMenu, FiX } from 'react-icons/fi';

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Menu button (for mobile) */}
        <div className="lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Page Title */}
        <div className="hidden lg:block">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Super Admin'}
          </h2>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiBell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0) || 'SA'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || 'Super Admin'}
                </p>
                <p className="text-xs text-gray-500">{user?.role || 'super_admin'}</p>
              </div>
              <FiChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  Security
                </button>
                <hr className="my-1" />
                <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  Help & Support
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 mr-6">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-4 text-center text-sm text-gray-500">
              No new notifications
            </div>
          </div>
          <div className="p-2 border-t border-gray-100 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>
        </div>
      )}
    </header>
  );
}