// app/(dashboard)/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
    FiActivity,
    FiArrowDown,
    FiArrowUp,
    FiBriefcase,
    FiClock,
    FiFileText,
    FiHome,
    FiTrendingUp,
    FiUserCheck,
    FiUserPlus,
    FiUsers,
    FiGlobe,
    FiShield,
    FiBarChart2,
    FiCalendar
} from 'react-icons/fi';
import { 
    Area, AreaChart, 
    Bar, BarChart, 
    CartesianGrid, 
    Cell, 
    Line, LineChart, 
    Pie, PieChart, 
    ResponsiveContainer, 
    Tooltip, 
    XAxis, YAxis,
    Legend
} from 'recharts';
import Card from '../components/ui/Card';
import { superAdminClient } from '../lib/api';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
        fetchTrendData();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await superAdminClient.get('/stats');
            console.log('Stats response:', response);
            setStats(response.data);
        } catch (error: any) {
            console.error('Failed to fetch stats:', error);
            setError(error?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    const fetchTrendData = async () => {
        try {
            const response = await superAdminClient.get('/stats/trends?period=monthly');
            if (response.data && response.data.length > 0) {
                setTrendData(response.data);
            } else {
                setTrendData([
                    { month: 'Jan', users: 45, companies: 8, workers: 65 },
                    { month: 'Feb', users: 52, companies: 10, workers: 78 },
                    { month: 'Mar', users: 68, companies: 14, workers: 92 },
                    { month: 'Apr', users: 85, companies: 18, workers: 105 },
                    { month: 'May', users: 102, companies: 22, workers: 118 },
                    { month: 'Jun', users: 128, companies: 26, workers: 132 },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
            setTrendData([
                { month: 'Jan', users: 45, companies: 8, workers: 65 },
                { month: 'Feb', users: 52, companies: 10, workers: 78 },
                { month: 'Mar', users: 68, companies: 14, workers: 92 },
                { month: 'Apr', users: 85, companies: 18, workers: 105 },
                { month: 'May', users: 102, companies: 22, workers: 118 },
                { month: 'Jun', users: 128, companies: 26, workers: 132 },
            ]);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-gray-500 font-light">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                        <FiActivity className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-gray-700 font-medium">Error loading dashboard</p>
                    <p className="text-sm text-gray-400 mt-1">{error}</p>
                </div>
            </div>
        );
    }

    // Safely access nested properties
    const companiesData = stats?.data?.companies || stats?.companies || {};
    const usersData = stats?.data?.users || stats?.users || {};
    const employersData = stats?.data?.employers || stats?.employers || {};
    const workersData = stats?.data?.workers || stats?.workers || {};
    const jobDemandsData = stats?.data?.jobDemands || stats?.jobDemands || {};
    const subAgentsData = stats?.data?.subAgents || stats?.subAgents || {};

    const statCards = [
        { title: 'Total Companies', value: companiesData.total || 0, icon: FiHome, gradient: 'from-blue-500 to-blue-600', change: '+12%', trend: 'up' },
        { title: 'Total Users', value: usersData.total || 0, icon: FiUsers, gradient: 'from-green-500 to-emerald-600', change: '+8%', trend: 'up' },
        { title: 'Active Employers', value: employersData.active || 0, icon: FiBriefcase, gradient: 'from-orange-500 to-amber-600', change: '+5%', trend: 'up' },
        { title: 'Active Workers', value: workersData.active || 0, icon: FiUserPlus, gradient: 'from-pink-500 to-rose-600', change: '+15%', trend: 'up' },
        { title: 'Job Demands', value: jobDemandsData.active || 0, icon: FiFileText, gradient: 'from-red-500 to-pink-600', change: '-2%', trend: 'down' },
        { title: 'Sub Agents', value: subAgentsData.active || 0, icon: FiUserCheck, gradient: 'from-purple-500 to-indigo-600', change: '+10%', trend: 'up' },
    ];

    const workerStatusData = workersData.byStatus
        ? Object.entries(workersData.byStatus).map(([name, value]) => ({ name, value }))
        : [];

    const companyStatusData = companiesData.byStatus
        ? Object.entries(companiesData.byStatus).map(([name, value]) => ({ name, value }))
        : [];

    const userRoleData = usersData.byRole
        ? Object.entries(usersData.byRole).map(([name, value]) => ({ name, value }))
        : [];

    const totalActive = (employersData.active || 0) + (workersData.active || 0);
    const totalDeleted = (employersData.deleted || 0) + (workersData.deleted || 0) + (jobDemandsData.deleted || 0);
    const fillRate = jobDemandsData.active > 0 
        ? Math.round((jobDemandsData.active / (jobDemandsData.active + jobDemandsData.deleted)) * 100) 
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
            <div className="max-w-[1600px] mx-auto px-8 py-10">

                {/* Welcome Section */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white mb-12">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-8 bg-white/50 rounded-full"></div>
                            <span className="text-xs font-mono tracking-wider text-white/80">WELCOME BACK</span>
                        </div>
                        <h1 className="text-4xl font-light tracking-tight">Dashboard</h1>
                        <p className="text-white/70 mt-2 text-sm font-light">
                            System overview and real-time statistics
                        </p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-6 gap-5 mb-10">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.title} className="group">
                                <Card hoverable className="relative overflow-hidden border border-gray-100">
                                    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`}></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`w-10 h-10 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-sm`}>
                                                <Icon className="text-white text-lg" />
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {stat.trend === 'up' ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
                                                {stat.change}
                                            </div>
                                        </div>
                                        <p className="text-2xl font-light text-gray-900">{stat.value.toLocaleString()}</p>
                                        <p className="text-xs text-gray-400 mt-1 font-light">{stat.title}</p>
                                    </div>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Monthly Trends */}
                    <Card title="Monthly Trends" className="col-span-1">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={trendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} name="Users" />
                                    <Line type="monotone" dataKey="companies" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} name="Companies" />
                                    <Line type="monotone" dataKey="workers" stroke="#F59E0B" strokeWidth={2} dot={{ fill: '#F59E0B', r: 4 }} name="Workers" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-green-500 rounded"></div> Users</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-blue-500 rounded"></div> Companies</span>
                            <span className="flex items-center gap-2"><div className="w-3 h-0.5 bg-orange-500 rounded"></div> Workers</span>
                        </div>
                    </Card>

                    {/* Worker Status Distribution */}
                    <Card title="Worker Status Distribution" className="col-span-1">
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
                                            outerRadius={90}
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
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Company Status Distribution */}
                    <Card title="Company Status Distribution" className="col-span-1">
                        <div className="h-80">
                            {companyStatusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={companyStatusData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis type="category" dataKey="name" width={80} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* User Role Distribution */}
                    <Card title="User Role Distribution" className="col-span-1">
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
                                            outerRadius={90}
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
                                <div className="h-full flex items-center justify-center text-gray-400">
                                    No data available
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* System Health & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card title="System Health" className="lg:col-span-2">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs font-medium text-emerald-700">API Status</span>
                                    </div>
                                    <p className="text-lg font-light text-emerald-700">Operational</p>
                                    <p className="text-xs text-emerald-600 mt-1">All systems running normally</p>
                                </div>
                                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FiActivity className="text-blue-500 text-sm" />
                                        <span className="text-xs font-medium text-blue-700">Response Time</span>
                                    </div>
                                    <p className="text-lg font-light text-blue-700">124ms</p>
                                    <p className="text-xs text-blue-600 mt-1">Average response time</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-xs text-gray-500">Fill Rate</span>
                                    <span className="text-sm font-medium text-gray-700">{fillRate}%</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-xs text-gray-500">Total Active</span>
                                    <span className="text-sm font-medium text-gray-700">{totalActive.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-xs text-gray-500">Deleted Items</span>
                                    <span className="text-sm font-medium text-red-600">{totalDeleted.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-xs text-gray-500">Active Rate</span>
                                    <span className="text-sm font-medium text-emerald-600">
                                        {totalActive + totalDeleted > 0 
                                            ? Math.round((totalActive / (totalActive + totalDeleted)) * 100) 
                                            : 0}%
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs text-gray-500">Active vs Deleted</span>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400">Employers</div>
                                        <div className="text-xs font-medium">
                                            <span className="text-emerald-600">{employersData.active || 0}</span>
                                            <span className="text-gray-300"> / </span>
                                            <span className="text-rose-600">{employersData.deleted || 0}</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-400">Workers</div>
                                        <div className="text-xs font-medium">
                                            <span className="text-emerald-600">{workersData.active || 0}</span>
                                            <span className="text-gray-300"> / </span>
                                            <span className="text-rose-600">{workersData.deleted || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Quick Actions">
                        <div className="space-y-2">
                            <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FiBarChart2 className="text-indigo-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Export Report</p>
                                    <p className="text-xs text-gray-400">Download monthly analytics</p>
                                </div>
                            </button>
                            <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FiUsers className="text-emerald-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">View Workers</p>
                                    <p className="text-xs text-gray-400">Check worker status</p>
                                </div>
                            </button>
                            <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FiCalendar className="text-purple-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Recent Activity</p>
                                    <p className="text-xs text-gray-400">View audit logs</p>
                                </div>
                            </button>
                            <button className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-all flex items-center gap-3 group">
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FiGlobe className="text-amber-500 text-sm" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Export Data</p>
                                    <p className="text-xs text-gray-400">For R/Python analysis</p>
                                </div>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}