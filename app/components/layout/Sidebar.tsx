// app/components/layout/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiBarChart2,
  FiBriefcase,
  FiClipboard,
  FiFileText,
  FiHome,
  FiLogOut,
  FiTrash2,
  FiTrendingUp,
  FiUserCheck,
  FiUserPlus,
  FiUsers
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: FiHome, color: 'text-blue-400' },
  { href: '/companies', label: 'Companies', icon: FiTrendingUp, color: 'text-purple-400' },
  { href: '/users', label: 'Users', icon: FiUsers, color: 'text-green-400' },
  { href: '/employers', label: 'Employers', icon: FiBriefcase, color: 'text-orange-400' },
  { href: '/job-demands', label: 'Job Demands', icon: FiFileText, color: 'text-red-400' },
  { href: '/workers', label: 'Workers', icon: FiUserPlus, color: 'text-pink-400' },
  { href: '/sub-agents', label: 'Sub Agents', icon: FiUserCheck, color: 'text-indigo-400' },
  { href: '/deleted', label: 'Deleted Items', icon: FiTrash2, color: 'text-gray-400' },
  { href: '/audit-logs', label: 'Audit Logs', icon: FiClipboard, color: 'text-teal-400' },
  { href: '/analysis', label: 'Data Analysis', icon: FiBarChart2, color: 'text-cyan-400' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col shadow-2xl">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FiTrendingUp className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              SUPERADMIN
            </h1>
            <p className="text-xs text-gray-400">MODAASH</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-xl">
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            <p className="text-xs text-blue-400 mt-1 font-medium">Super Admin</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="px-4 mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">Main Menu</p>
        </div>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 mx-3 px-4 py-3 rounded-xl text-sm transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                }
              `}
            >
              <Icon className={`text-lg ${isActive ? 'text-white' : item.color}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200 group"
        >
          <FiLogOut className="text-lg group-hover:rotate-12 transition-transform" />
          <span>Logout</span>
        </button>
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Version 2.0.0</span>
            <span>© 2024</span>
          </div>
        </div>
      </div>
    </aside>
  );
}