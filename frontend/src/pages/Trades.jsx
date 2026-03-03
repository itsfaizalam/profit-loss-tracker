import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TradeFormModal from '../components/TradeFormModal';
import StockDetailModal from '../components/StockDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { Loader2, Plus, Search, Filter, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Trades = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState(null);

    // Filters
    const [stockFilter, setStockFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchTrades = async () => {
        setLoading(true);
        try {
            let url = '/trades?';
            if (stockFilter) url += `stockName=${stockFilter}&`;
            if (typeFilter) url += `type=${typeFilter}&`;
            if (dateRange.start && dateRange.end) {
                url += `startDate=${dateRange.start}&endDate=${dateRange.end}`;
            }

            const res = await api.get(url);
            setTrades(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrades();
    }, [stockFilter, typeFilter, dateRange]);

    const handleCreateTrade = async (data) => {
        try {
            await api.post('/trades', data);
            setModalOpen(false);
            fetchTrades();
        } catch (err) {
            console.error(err);
            alert('Failed to save trade');
        }
    };

    const handleUpdateTrade = async (data) => {
        try {
            await api.put(`/trades/${data._id}`, data);
            setModalOpen(false);
            setEditingTrade(null);
            fetchTrades();
        } catch (err) {
            console.error(err);
            alert('Failed to update trade');
        }
    };

    const handleDelete = (id) => {
        setTradeToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const confirmDeletion = async () => {
        if (!tradeToDelete) return;
        try {
            await api.delete(`/trades/${tradeToDelete}`);
            fetchTrades();
            setConfirmDeleteOpen(false);
            setTradeToDelete(null);
        } catch (err) {
            console.error(err);
            alert('Failed to delete trade');
            setConfirmDeleteOpen(false);
            setTradeToDelete(null);
        }
    };

    const openEditModal = (trade) => {
        setEditingTrade(trade);
        setModalOpen(true);
    };

    const openStockModal = (stockName) => {
        setSelectedStock(stockName);
        setStockModalOpen(true);
    };

    const clearFilters = () => {
        setStockFilter('');
        setTypeFilter('');
        setDateRange({ start: '', end: '' });
    };

    return (
        <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Trades Log</h1>
                    <p className="text-gray-500 dark:text-gray-400">View, add, and manage your trading history.</p>
                </div>
                <button
                    onClick={() => { setEditingTrade(null); setModalOpen(true); }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Trade
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search stock..."
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex gap-4 flex-1">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Trades</option>
                        <option value="profit">Winning Trades (Profit)</option>
                        <option value="loss">Losing Trades (Loss)</option>
                    </select>
                </div>

                <div className="flex gap-2 flex-1 items-center">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
                    />
                </div>

                <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg transition-colors"
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                </button>
            </div>

            {/* Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900 text-xs uppercase text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left">Stock</th>
                                    <th scope="col" className="px-6 py-4 text-left">Quantity</th>
                                    <th scope="col" className="px-6 py-4 text-left">Buy Price</th>
                                    <th scope="col" className="px-6 py-4 text-left">Sell Price</th>
                                    <th scope="col" className="px-6 py-4 text-left">P&L</th>
                                    <th scope="col" className="px-6 py-4 text-left">Hold Days</th>
                                    <th scope="col" className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {trades.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No trades found. Start tracking by adding a new trade!
                                        </td>
                                    </tr>
                                ) : trades.map((trade) => {
                                    const isProfit = trade.profitLoss >= 0;
                                    return (
                                        <tr key={trade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className={`p-2 rounded flex-shrink-0 mr-3 ${isProfit ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-100 text-red-600 dark:bg-red-900/30'}`}>
                                                        {isProfit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div
                                                            className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 cursor-pointer transition-colors"
                                                            onClick={() => openStockModal(trade.stockName)}
                                                        >
                                                            {trade.stockName.toUpperCase()}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(trade.buyDate).toLocaleDateString()} - {new Date(trade.sellDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                {trade.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                ₹{trade.buyPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                                                ₹{trade.sellPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${isProfit ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'}`}>
                                                    {isProfit ? '+' : ''}₹{trade.profitLoss.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {trade.holdingDays}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(trade)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(trade._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <TradeFormModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingTrade(null); }}
                initialData={editingTrade}
                onSubmit={editingTrade ? handleUpdateTrade : handleCreateTrade}
            />

            <StockDetailModal
                isOpen={stockModalOpen}
                onClose={() => { setStockModalOpen(false); setSelectedStock(null); }}
                stockName={selectedStock}
                trades={trades}
            />

            <ConfirmModal
                isOpen={confirmDeleteOpen}
                onClose={() => { setConfirmDeleteOpen(false); setTradeToDelete(null); }}
                onConfirm={confirmDeletion}
                title="Delete Trade"
                message="Are you sure you want to delete this trade? This action cannot be undone and will permanently remove it from your records."
                confirmText="Delete"
            />
        </div>
    );
};

export default Trades;
