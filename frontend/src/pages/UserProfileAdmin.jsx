import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import {
    ArrowLeft, User, Mail, Calendar, Activity,
    ShieldBan, ShieldCheck, Trash2, TrendingUp, TrendingDown,
    AlertCircle, CheckCircle, XCircle, Archive, ArchiveRestore, RefreshCw, MailCheck
} from 'lucide-react';
import { CumulativeProfitChart, WinLossPieChart } from '../components/Charts';
import StockDetailModal from '../components/StockDetailModal';

const UserProfileAdmin = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'bin'

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const token = JSON.parse(localStorage.getItem('user'))?.token;

            const response = await API.get(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProfile(response.data);

            // Generate chart data for Cumulative Profit
            if (response.data.trades) {
                // Get active trades and sort chronologically
                const activeTrades = response.data.trades
                    .filter(t => !t.isDeleted)
                    .sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));

                const groupedByDate = {};
                activeTrades.forEach(trade => {
                    const dateKey = new Date(trade.sellDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    if (!groupedByDate[dateKey]) {
                        groupedByDate[dateKey] = { date: dateKey, profitLoss: 0 };
                    }
                    groupedByDate[dateKey].profitLoss += trade.profitLoss;
                });

                let cumProfit = 0;
                const computedChartData = Object.values(groupedByDate).map(dayData => {
                    cumProfit += dayData.profitLoss;
                    return {
                        date: dayData.date,
                        cumulativeProfit: cumProfit,
                        profitLoss: dayData.profitLoss
                    };
                });

                setChartData(computedChartData);
            }

            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch user profile');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [id]);

    const handleToggleBlock = async () => {
        if (!window.confirm("Are you sure you want to change this user's access status?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.put(`/api/admin/users/${id}/block`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile(); // Refresh data
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user status');
        }
    };

    const handleDeleteUser = async () => {
        if (!window.confirm("WARNING: This will permanently delete the user AND all of their trades. This cannot be undone. Proceed?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/admin/users'); // Go back to list after deletion
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleVerifyUser = async () => {
        if (!window.confirm("Are you sure you want to manually verify this user's email?")) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.put(`/api/admin/users/${id}/verify`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to verify user email');
        }
    };

    const handleSoftDeleteTrade = async (tradeId) => {
        if (!window.confirm('Move this trade to the bin?')) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.delete(`/api/admin/trades/${tradeId}/soft`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to move trade to bin');
        }
    };

    const handleRestoreTrade = async (tradeId) => {
        if (!window.confirm('Restore this trade? It will be active again.')) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.put(`/api/admin/trades/${tradeId}/restore`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to restore trade');
        }
    };

    const handlePermanentDeleteTrade = async (tradeId) => {
        if (!window.confirm('Permanently delete this trade? This cannot be undone.')) return;
        try {
            const token = JSON.parse(localStorage.getItem('user'))?.token;
            await API.delete(`/api/admin/trades/${tradeId}/hard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchUserProfile();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to permanently delete trade');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 flex flex-col items-center">
                <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
                <h3 className="text-red-800 font-medium text-lg">Failed to Load Profile</h3>
                <p className="text-red-600 mt-1 mb-4">{error}</p>
                <Link to="/admin/users" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
                </Link>
            </div>
        );
    }

    const { user, stats, trades } = profile;
    const displayedTrades = trades.filter(t => viewMode === 'active' ? !t.isDeleted : t.isDeleted);

    return (
        <div className="space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center text-sm">
                <Link to="/admin/users" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Users List
                </Link>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 sm:flex sm:items-center sm:justify-between bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                        User Profile Details
                        {user.role === 'admin' && (
                            <span className="ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300">
                                Administrator
                            </span>
                        )}
                    </h3>

                    {/* Admin Actions */}
                    {user.role !== 'admin' && (
                        <div className="mt-3 sm:mt-0 flex flex-wrap justify-end gap-3">
                            {!user.isVerified && (
                                <button
                                    onClick={handleVerifyUser}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 dark:ring-offset-gray-900"
                                >
                                    <MailCheck className="w-4 h-4 mr-1.5" /> Verify Email
                                </button>
                            )}
                            <button
                                onClick={handleToggleBlock}
                                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${user.isBlocked
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-amber-600 hover:bg-amber-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors dark:ring-offset-gray-900`}
                            >
                                {user.isBlocked ? (
                                    <><ShieldCheck className="w-4 h-4 mr-1.5" /> Unblock Access</>
                                ) : (
                                    <><ShieldBan className="w-4 h-4 mr-1.5" /> Block Access</>
                                )}
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors dark:ring-offset-gray-900"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" /> Delete User
                            </button>
                        </div>
                    )}
                </div>

                <div className="px-6 py-5 flex flex-col md:flex-row gap-8">
                    {/* Avatar & Basic Info */}
                    <div className="flex flex-col items-center justify-center space-y-4 md:w-1/4 md:border-r border-gray-100 dark:border-gray-700 pr-4">
                        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-600 shadow-md">
                            {user.profilePic ? (
                                <img src={user.profilePic} alt={user.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-indigo-300 dark:text-indigo-500 bg-indigo-50 dark:bg-indigo-900/40">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>

                            <div className="mt-3 flex items-center justify-center space-x-2 text-sm">
                                {user.isVerified ? (
                                    <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                        <CheckCircle className="w-4 h-4 mr-1" /> Email Verified
                                    </span>
                                ) : (
                                    <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                                        <XCircle className="w-4 h-4 mr-1" /> Unverified
                                    </span>
                                )}
                            </div>
                            {user.isBlocked && (
                                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 uppercase tracking-wider">
                                    Account Suspended
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                <Activity className="w-4 h-4 mr-1.5 text-blue-500" /> Total Trades
                            </div>
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalTrades}</div>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                <span>{stats.activeTrades} Active</span>
                                <span>{stats.deletedTrades} in Trash</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                <TrendingUp className="w-4 h-4 mr-1.5 text-emerald-500" /> Net Profit/Loss
                            </div>
                            <div className={`text-2xl font-bold ${stats.netProfitLoss >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                {formatCurrency(stats.netProfitLoss)}
                            </div>
                            <div className="mt-2 text-xs font-medium flex justify-between">
                                <span className="text-emerald-600 dark:text-emerald-400">Winning: {stats.totalProfitTrades}</span>
                                <span className="text-red-600 dark:text-red-400">Losing: {stats.totalLossTrades}</span>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" /> Member Since
                            </div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white mt-2">
                                {new Date(user.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cumulative Profit</h2>
                    <CumulativeProfitChart data={chartData} />
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Win / Loss Ratio</h2>
                    <WinLossPieChart winCount={stats?.totalProfitTrades || 0} lossCount={stats?.totalLossTrades || 0} />
                </div>
            </div>

            {/* User Trades Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trade History</h3>
                        <button
                            onClick={() => setViewMode(viewMode === 'active' ? 'bin' : 'active')}
                            className={`inline-flex items-center px-3 py-1.5 font-medium text-xs rounded-lg transition-colors ${viewMode === 'active'
                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                                : 'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                }`}
                        >
                            {viewMode === 'active' ? (
                                <><Archive className="w-3 h-3 mr-1.5" /> View Bin ({stats?.deletedTrades || 0})</>
                            ) : (
                                <><RefreshCw className="w-3 h-3 mr-1.5" /> Back to Active Trades</>
                            )}
                        </button>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Showing {displayedTrades.length} trades</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type / Qty</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">P&L</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            {displayedTrades.length > 0 ? (
                                displayedTrades.map((trade) => (
                                    <tr key={trade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                            {new Date(trade.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                                className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
                                                onClick={() => {
                                                    setSelectedStock(trade.stockName);
                                                    setStockModalOpen(true);
                                                }}
                                            >
                                                {trade.stockName}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">Tags: {trade.tags?.join(', ') || 'None'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${trade.buyOrSell === 'BUY'
                                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                                }`}>
                                                {trade.buyOrSell}
                                            </span>
                                            <span className="ml-2 text-gray-500 dark:text-gray-400">x{trade.quantity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                                            <span className={trade.profitLoss >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                                                {formatCurrency(trade.profitLoss)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {trade.isDeleted ? (
                                                <span className="text-xs font-medium text-red-500 dark:text-red-400 flex items-center">
                                                    <Trash2 className="w-3 h-3 mr-1" /> In Bin
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 flex items-center">
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {!trade.isDeleted ? (
                                                <button
                                                    onClick={() => handleSoftDeleteTrade(trade._id)}
                                                    className="text-amber-600 hover:text-amber-900 dark:text-amber-500 dark:hover:text-amber-400 transition-colors inline-flex items-center"
                                                    title="Move to Bin"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleRestoreTrade(trade._id)}
                                                        className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors inline-flex items-center mr-4"
                                                        title="Restore Trade"
                                                    >
                                                        <ArchiveRestore className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePermanentDeleteTrade(trade._id)}
                                                        className="text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 transition-colors inline-flex items-center"
                                                        title="Permanently Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                        This user has not logged any trades yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stock Detail Modal */}
            <StockDetailModal
                isOpen={stockModalOpen}
                onClose={() => { setStockModalOpen(false); setSelectedStock(null); }}
                stockName={selectedStock}
                trades={trades}
            />

        </div>
    );
};

export default UserProfileAdmin;
