// app/components/layout/Sidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FiHome, 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiUserPlus, 
  FiUserCheck,
  FiTrash2,
  FiLogOut,
  FiClipboard,
  FiBarChart2
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: FiHome, color: 'text-blue-500' },
  { href: '/companies', label: 'Companies', icon: FiHome, color: 'text-purple-500' },
  { href: '/users', label: 'Users', icon: FiUsers, color: 'text-green-500' },
  { href: '/employers', label: 'Employers', icon: FiBriefcase, color: 'text-orange-500' },
  { href: '/job-demands', label: 'Job Demands', icon: FiFileText, color: 'text-red-500' },
  { href: '/workers', label: 'Workers', icon: FiUserPlus, color: 'text-pink-500' },
  { href: '/sub-agents', label: 'Sub Agents', icon: FiUserCheck, color: 'text-indigo-500' },
  { href: '/deleted', label: 'Deleted Items', icon: FiTrash2, color: 'text-gray-500' },
  { href: '/audit-logs', label: 'Audit Logs', icon: FiClipboard, color: 'text-teal-500' },
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
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">SUPERADMIN</h1>
        <p className="text-xs text-gray-400 mt-1">MODAASH</p>
        {user && (
          <p className="text-xs text-blue-400 mt-2 truncate">
            {user.email}
          </p>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white border-l-4 border-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className={`text-lg ${isActive ? 'text-white' : item.color}`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200"
        >
          <FiLogOut className="text-lg" />
          <span>Logout</span>
        </button>
        
        {/* Version */}
        <p className="text-center text-xs text-gray-600 mt-4">
          v1.0.0
        </p>
      </div>
    </aside>
  );
}