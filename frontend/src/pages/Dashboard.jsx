import React, { useState, useEffect } from 'react';
import API from '../api';
import TopStats from '../components/TopStats';
import { CumulativeProfitChart, WinLossPieChart } from '../components/Charts';
import { Loader2, Plus } from 'lucide-react';
import TradeFormModal from '../components/TradeFormModal';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const [statsRes, tradesRes] = await Promise.all([
                API.get('/api/trades/report'),
                API.get('/api/trades')
            ]);

            setStats(statsRes.data);

            // Process trades for cumulative profit chart
            const sortedTrades = [...tradesRes.data].sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));

            // Group by date
            const groupedByDate = {};
            sortedTrades.forEach(trade => {
                const dateKey = new Date(trade.sellDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = {
                        date: dateKey,
                        profitLoss: 0
                    };
                }
                groupedByDate[dateKey].profitLoss += trade.profitLoss;
            });

            let cumProfit = 0;
            const chartData = Object.values(groupedByDate).map(dayData => {
                cumProfit += dayData.profitLoss;
                return {
                    date: dayData.date,
                    cumulativeProfit: cumProfit,
                    profitLoss: dayData.profitLoss
                };
            });

            setTrades(chartData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleCreateTrade = async (data) => {
        try {
            await API.post('/api/trades', data);
            setModalOpen(false);
            setLoading(true);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to save trade');
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                {error}
            </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-500">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
                    <p className="text-gray-500 dark:text-gray-400">Here's a summary of your trading performance.</p>
                </div>
                <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trade
                </button>
            </div>

            <TopStats stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cumulative Profit Growth</h2>
                    <CumulativeProfitChart data={trades} />
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Win / Loss Ratio</h2>
                    <WinLossPieChart winCount={stats?.winCount || 0} lossCount={stats?.lossCount || 0} />
                </div>
            </div>

            <TradeFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreateTrade}
            />
        </div>
    );
};

export default Dashboard;
