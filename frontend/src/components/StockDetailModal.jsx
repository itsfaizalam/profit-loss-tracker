import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, IndianRupee, Activity } from 'lucide-react';
import { StockPriceChart } from './Charts';

const StatCard = ({ title, value, prefix = '', suffix = '', icon: Icon, colorClass }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center shadow-sm border border-gray-100 dark:border-gray-700">
        <div className={`p-3 rounded-full mr-4 bg-opacity-20 flex-shrink-0 ${colorClass.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}`}>
            <Icon className={`w-6 h-6 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[2]}`} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {prefix}{value}{suffix}
            </p>
        </div>
    </div>
);

const StockDetailModal = ({ isOpen, onClose, stockName, trades }) => {
    // Memoize the calculations so they only run when the stockName or trades change
    const { chartData, stats } = useMemo(() => {
        if (!stockName || !trades || trades.length === 0) return { chartData: [], stats: null };

        // Filter trades for the specific stock
        const stockTrades = trades.filter(trade => trade.stockName.toLowerCase() === stockName.toLowerCase());

        // Sort chronologically by sellDate
        const sortedTrades = [...stockTrades].sort((a, b) => new Date(a.sellDate) - new Date(b.sellDate));

        let totalProfit = 0;
        let totalBrokerage = 0;
        let totalQuantity = 0;

        const dataForChart = sortedTrades.map((trade, index) => {
            totalProfit += trade.profitLoss;
            totalBrokerage += trade.brokerage || 0;
            totalQuantity += trade.quantity;

            // We use the timestamp for the chronological X-Axis. 
            // A slight artificial offset ensures stable sorting rendering for same-day trades.
            const timestamp = new Date(trade.sellDate).getTime() + index;

            return {
                timestamp,
                price: trade.sellPrice,
                fullDate: new Date(trade.sellDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            };
        });

        return {
            chartData: dataForChart,
            stats: {
                totalTrades: stockTrades.length,
                totalProfit,
                totalBrokerage,
                totalQuantity
            }
        };
    }, [stockName, trades]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/80" onClick={onClose} />

                <div className="relative z-10 inline-block align-bottom bg-gray-50 dark:bg-gray-900 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl w-full border border-gray-200 dark:border-gray-700">

                    {/* Header */}
                    <div className="bg-white dark:bg-gray-800 px-4 py-4 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl leading-6 font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                {stockName}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                Detailed View
                            </span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="px-4 py-6 sm:px-6">
                        {stats ? (
                            <div className="space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard
                                        title="Total P&L"
                                        value={stats.totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        prefix="₹"
                                        icon={stats.totalProfit >= 0 ? TrendingUp : TrendingDown}
                                        colorClass={stats.totalProfit >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}
                                    />
                                    <StatCard
                                        title="Total Brokerage"
                                        value={stats.totalBrokerage.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        prefix="₹"
                                        icon={IndianRupee}
                                        colorClass="text-orange-500 dark:text-orange-400"
                                    />
                                    <StatCard
                                        title="Trades Count"
                                        value={stats.totalTrades}
                                        icon={Activity}
                                        colorClass="text-blue-500 dark:text-blue-400"
                                    />
                                    <StatCard
                                        title="Total Quantity Traded"
                                        value={stats.totalQuantity}
                                        icon={Activity}
                                        colorClass="text-purple-500 dark:text-purple-400"
                                    />
                                </div>

                                {/* Chart Row */}
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stock Performance Timeline</h2>
                                    <StockPriceChart data={chartData} />
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                <Activity className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
                                <p>No trades found for {stockName}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-xl border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                        >
                            Close
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default StockDetailModal;
