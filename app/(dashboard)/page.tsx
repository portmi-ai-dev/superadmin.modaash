// app/(dashboard)/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
    FiAlertCircle,
    FiBriefcase,
    FiFileText,
    FiHome,
    FiTrendingUp,
    FiUserCheck,
    FiUserPlus,
    FiUsers
} from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Card from '../components/ui/Card';
import { superAdminClient } from '../lib/api';
import { SystemStats } from '../types';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function DashboardPage() {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await superAdminClient.get('/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Companies',
            value: stats?.companies.total || 0,
            icon: FiHome,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
        },
        {
            title: 'Total Users',
            value: stats?.users.total || 0,
            icon: FiUsers,
            color: 'bg-green-500',
            textColor: 'text-green-600',
        },
        {
            title: 'Active Employers',
            value: stats?.employers.active || 0,
            icon: FiBriefcase,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
        },
        {
            title: 'Active Workers',
            value: stats?.workers.active || 0,
            icon: FiUserPlus,
            color: 'bg-pink-500',
            textColor: 'text-pink-600',
        },
        {
            title: 'Job Demands',
            value: stats?.jobDemands.active || 0,
            icon: FiFileText,
            color: 'bg-red-500',
            textColor: 'text-red-600',
        },
        {
            title: 'Sub Agents',
            value: stats?.subAgents.active || 0,
            icon: FiUserCheck,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
        },
    ];

    // Prepare chart data
    const workerStatusData = stats?.workers.byStatus
        ? Object.entries(stats.workers.byStatus).map(([name, value]) => ({ name, value }))
        : [];

    const companyStatusData = stats?.companies.byStatus
        ? Object.entries(stats.companies.byStatus).map(([name, value]) => ({ name, value }))
        : [];

    const userRoleData = stats?.users.byRole
        ? Object.entries(stats.users.byRole).map(([name, value]) => ({ name, value }))
        : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">System overview and real-time statistics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.title} className="hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <Icon className="text-white text-xl" />
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Worker Status Distribution */}
                <Card title="Worker Status Distribution">
                    <div className="h-80">
                        {workerStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={workerStatusData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {workerStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>
                </Card>

                {/* Company Status Distribution */}
                <Card title="Company Status Distribution">
                    <div className="h-80">
                        {companyStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={companyStatusData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3B82F6" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>
                </Card>

                {/* User Role Distribution */}
                <Card title="User Role Distribution">
                    <div className="h-80">
                        {userRoleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userRoleData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {userRoleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card title="System Health">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Deleted Items</span>
                            <div className="space-x-3">
                                <span className="text-sm">
                                    Employers: <strong className="text-red-600">{stats?.employers.deleted || 0}</strong>
                                </span>
                                <span className="text-sm">
                                    Workers: <strong className="text-red-600">{stats?.workers.deleted || 0}</strong>
                                </span>
                                <span className="text-sm">
                                    Demands: <strong className="text-red-600">{stats?.jobDemands.deleted || 0}</strong>
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pb-2 border-b">
                            <span className="text-gray-600">Active vs Deleted Ratio</span>
                            <div className="flex gap-4">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500">Employers</div>
                                    <div className="text-sm">
                                        <span className="text-green-600">{stats?.employers.active || 0}</span>
                                        <span className="text-gray-400"> / </span>
                                        <span className="text-red-600">{stats?.employers.deleted || 0}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500">Workers</div>
                                    <div className="text-sm">
                                        <span className="text-green-600">{stats?.workers.active || 0}</span>
                                        <span className="text-gray-400"> / </span>
                                        <span className="text-red-600">{stats?.workers.deleted || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <FiTrendingUp className="text-blue-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-blue-800">System Status</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        All systems operational. Last updated: {new Date().toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {stats?.workers.active === 0 && (
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FiAlertCircle className="text-yellow-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800">No Workers Data</p>
                                        <p className="text-xs text-yellow-600 mt-1">
                                            No active workers found in the system
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}