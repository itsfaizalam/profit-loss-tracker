import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, UserCheck, UserX, LineChart,
    ArrowUpRight, ArrowDownRight, Activity, TrendingUp, TrendingDown
} from 'lucide-react';
import {
    LineChart as RechartsLine, Line, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const token = JSON.parse(localStorage.getItem('user'))?.token;
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                const response = await axios.get(`${apiUrl}/admin/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setStats(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch admin stats');
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
                <p className="text-red-600 mt-1">{error}</p>
            </div>
        );
    }

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Overview</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">System metrics and platform performance</p>
                </div>
            </div>

            {/* Quick Metrics Grids */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Users Card */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
                                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.users.totalUsers}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
                        <div className="text-sm flex justify-between">
                            <span className="text-emerald-600 flex items-center"><UserCheck className="w-3 h-3 mr-1" /> {stats?.users.activeUsersCount} Active</span>
                            <span className="text-red-500 flex items-center"><UserX className="w-3 h-3 mr-1" /> {stats?.users.blockedUsers} Blocked</span>
                        </div>
                    </div>
                </div>

                {/* System P&L Card */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900 rounded-md p-3">
                                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">System Net P&L</dt>
                                    <dd className="flex items-baseline">
                                        <div className={`text-2xl font-semibold ${(stats?.financials.totalProfit - stats?.financials.totalLoss) >= 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                            }`}>
                                            {formatCurrency(stats?.financials.totalProfit - stats?.financials.totalLoss)}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 flex justify-between">
                        <div className="text-sm font-medium text-emerald-600 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" /> {formatCurrency(stats?.financials.totalProfit)}
                        </div>
                        <div className="text-sm font-medium text-red-600 flex items-center">
                            <TrendingDown className="w-4 h-4 mr-1" /> {formatCurrency(stats?.financials.totalLoss)}
                        </div>
                    </div>
                </div>

                {/* Trades Card */}
                <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg border border-gray-100 dark:border-gray-700">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                                <LineChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Trades Logged</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.trades.totalTrades}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3">
                        <div className="text-sm flex justify-between text-gray-500 dark:text-gray-400">
                            <span>{stats?.trades.activeTrades} Active</span>
                            <span>{stats?.trades.deletedTrades} in Bin</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trading Volume Chart */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Platform Trading Volume (Last 30 Days)</h3>
                <div className="h-72 w-full">
                    {stats?.charts?.dailyTrades?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <RechartsLine data={stats.charts.dailyTrades} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="_id" stroke="#6B7280" fontSize={12} tickMargin={10} />
                                <YAxis stroke="#6B7280" fontSize={12} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F9FAFB' }}
                                    itemStyle={{ color: '#60A5FA' }}
                                />
                                <Line type="monotone" dataKey="count" name="Trades Logged" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                            </RechartsLine>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                            Not enough trading data to display chart yet.
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
