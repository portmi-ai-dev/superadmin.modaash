// app/components/layout/Header.tsx

'use client';

import { useState } from 'react';
import {
  FiBell,
  FiChevronDown,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiSearch,
  FiSettings,
  FiUser,
  FiX
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export default function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 fixed top-0 right-0 left-72 z-10 shadow-sm">
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

        {/* Page Title & Search */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'}
            </h2>
            <p className="text-xs text-gray-500">Here's what's happening today</p>
          </div>

          {/* Search Bar - Optional */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-200">
            <FiSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-600 placeholder-gray-400 focus:outline-none w-48"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <FiBell size={20} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                {user?.fullName?.charAt(0) || 'SA'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-700">
                  {user?.fullName || 'Super Admin'}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role || 'super_admin'}</p>
              </div>
              <FiChevronDown size={16} className="text-gray-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <FiUser className="text-gray-400" />
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <FiSettings className="text-gray-400" />
                  Security
                </button>
                <hr className="my-1" />
                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <FiHelpCircle className="text-gray-400" />
                  Help & Support
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
                >
                  <FiLogOut className="text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-6 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 animate-fade-in">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <button className="text-xs text-blue-600 hover:text-blue-700">Mark all read</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiBell className="text-gray-400 text-xl" />
              </div>
              <p className="text-sm text-gray-500">No new notifications</p>
              <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
            </div>
          </div>
          <div className="p-3 border-t border-gray-100 text-center">
            <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );
}