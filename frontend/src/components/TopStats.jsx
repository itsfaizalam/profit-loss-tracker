import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Target, Clock, Activity } from 'lucide-react';

const StatCard = ({ title, value, prefix = '', suffix = '', icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-200 hover:shadow-md">
        <div className="flex items-center">
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 dark:bg-opacity-20 mr-4`}>
                <Icon className={`h-6 w-6 ${colorClass.replace('bg-', 'text-').split(' ')[0]}`} />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {prefix}{value}{suffix}
                </p>
            </div>
        </div>
    </div>
);

const TopStats = ({ stats }) => {
    const { totalInvested = 0, totalRealizedProfit = 0, totalTrades = 0, winRate = 0, averageProfit = 0, averageHoldingDays = 0 } = stats || {};

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard
                title="Total Invested"
                value={totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                prefix="₹"
                icon={DollarSign}
                colorClass="bg-blue-500 text-blue-600 dark:text-blue-400"
            />
            <StatCard
                title="Realized Profit/Loss"
                value={totalRealizedProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                prefix="₹"
                icon={totalRealizedProfit >= 0 ? TrendingUp : TrendingDown}
                colorClass={totalRealizedProfit >= 0 ? "bg-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-red-500 text-red-600 dark:text-red-400"}
            />
            <StatCard
                title="Win Rate"
                value={winRate.toFixed(1)}
                suffix="%"
                icon={Target}
                colorClass="bg-purple-500 text-purple-600 dark:text-purple-400"
            />
            <StatCard
                title="Total Trades"
                value={totalTrades}
                icon={Activity}
                colorClass="bg-indigo-500 text-indigo-600 dark:text-indigo-400"
            />
            <StatCard
                title="Avg Profit/Trade"
                value={averageProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                prefix="₹"
                icon={DollarSign}
                colorClass={averageProfit >= 0 ? "bg-emerald-500 text-emerald-600 dark:text-emerald-400" : "bg-red-500 text-red-600 dark:text-red-400"}
            />
            <StatCard
                title="Avg Holding Time"
                value={averageHoldingDays.toFixed(1)}
                suffix=" Days"
                icon={Clock}
                colorClass="bg-amber-500 text-amber-600 dark:text-amber-400"
            />
        </div>
    );
};

export default TopStats;
