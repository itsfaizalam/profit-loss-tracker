import React, { useState, useEffect } from 'react';
import api from '../services/api';
import TradeFormModal from '../components/TradeFormModal';
import StockDetailModal from '../components/StockDetailModal';
import ConfirmModal from '../components/ConfirmModal';
import { Loader2, Plus, Search, Filter, Pencil, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw, Archive, ArchiveRestore, AlertCircle } from 'lucide-react';

const Trades = () => {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState(null);
    const [stockModalOpen, setStockModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [tradeToDelete, setTradeToDelete] = useState(null);
    const [viewMode, setViewMode] = useState('active'); // 'active' or 'bin'

    // Bulk Operations State
    const [selectedTrades, setSelectedTrades] = useState([]);
    const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
    const [bulkActionType, setBulkActionType] = useState(null); // 'soft-delete', 'restore', 'hard-delete'

    // Filters
    const [stockFilter, setStockFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const fetchTrades = async () => {
        setLoading(true);
        try {
            let url = viewMode === 'bin' ? '/trades/bin?' : '/trades?';
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
        setSelectedTrades([]);
        fetchTrades();
    }, [stockFilter, typeFilter, dateRange, viewMode]);

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
            if (viewMode === 'active') {
                // Soft delete
                await api.delete(`/trades/${tradeToDelete}`);
            } else {
                // Hard delete
                await api.delete(`/trades/${tradeToDelete}/hard`);
            }
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

    const handleRestore = async (id) => {
        try {
            await api.put(`/trades/${id}/restore`);
            fetchTrades();
        } catch (err) {
            console.error(err);
            alert('Failed to restore trade');
        }
    };

    // Bulk Actions Handlers
    const toggleSelectTrade = (id) => {
        setSelectedTrades(prev =>
            prev.includes(id) ? prev.filter(tId => tId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedTrades(trades.map(t => t._id));
        } else {
            setSelectedTrades([]);
        }
    };

    const confirmBulkAction = async () => {
        try {
            if (bulkActionType === 'soft-delete') {
                await api.post('/trades/bulk-soft-delete', { tradeIds: selectedTrades });
            } else if (bulkActionType === 'restore') {
                await api.post('/trades/bulk-restore', { tradeIds: selectedTrades });
            } else if (bulkActionType === 'hard-delete') {
                await api.post('/trades/bulk-delete', { tradeIds: selectedTrades });
            }

            setSelectedTrades([]);
            setConfirmBulkOpen(false);
            setBulkActionType(null);
            fetchTrades();
        } catch (err) {
            console.error(err);
            alert(`Failed to execute bulk action`);
            setConfirmBulkOpen(false);
        }
    };

    const startBulkAction = (type) => {
        setBulkActionType(type);
        setConfirmBulkOpen(true);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Trades Log</h1>
                    <p className="text-gray-500 dark:text-gray-400">View, add, and manage your trading history.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setViewMode(viewMode === 'active' ? 'bin' : 'active')}
                        className={`inline-flex items-center px-4 py-2 font-medium text-sm rounded-lg shadow-sm transition-colors ${viewMode === 'active'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                            : 'bg-orange-100 hover:bg-orange-200 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}
                    >
                        {viewMode === 'active' ? (
                            <><Archive className="w-4 h-4 mr-2" /> View Bin</>
                        ) : (
                            <><RefreshCw className="w-4 h-4 mr-2" /> Back to Active Trades</>
                        )}
                    </button>
                    {viewMode === 'active' && (
                        <button
                            onClick={() => { setEditingTrade(null); setModalOpen(true); }}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Trade
                        </button>
                    )}
                </div>
            </div>

            {/* Warning Banner in Bin Mode */}
            {viewMode === 'bin' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 p-4 rounded-xl border border-orange-200 dark:border-orange-800/50 mb-6 flex items-start gap-3 w-full">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <h3 className="font-semibold text-sm">Trash/Bin Section</h3>
                        <p className="text-sm mt-1 opacity-90">Trades listed here are soft-deleted. They won't appear in dashboard calculations. You can restore them or permanently delete them.</p>
                    </div>
                </div>
            )}

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

            {/* Bulk Action Bar */}
            {selectedTrades.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-3 rounded-lg flex items-center justify-between mb-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center text-blue-800 dark:text-blue-300 font-medium text-sm px-2">
                        <span className="bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full mr-2">
                            {selectedTrades.length}
                        </span>
                        item{selectedTrades.length > 1 ? 's' : ''} selected
                    </div>
                    <div className="flex gap-2">
                        {viewMode === 'active' ? (
                            <button
                                onClick={() => startBulkAction('soft-delete')}
                                className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-md text-sm font-medium transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5" /> Move to Bin
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => startBulkAction('restore')}
                                    className="inline-flex items-center px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 rounded-md text-sm font-medium transition-colors"
                                >
                                    <ArchiveRestore className="w-4 h-4 mr-1.5" /> Restore
                                </button>
                                <button
                                    onClick={() => startBulkAction('hard-delete')}
                                    className="inline-flex items-center px-3 py-1.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/60 rounded-md text-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-1.5" /> Delete Permanently
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setSelectedTrades([])}
                            className="inline-flex items-center px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

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
                                    <th scope="col" className="px-6 py-4 text-left w-12">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 h-4 w-4"
                                            checked={trades.length > 0 && selectedTrades.length === trades.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th>
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
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No trades found. Start tracking by adding a new trade!
                                        </td>
                                    </tr>
                                ) : trades.map((trade) => {
                                    const isProfit = trade.profitLoss >= 0;
                                    const isSelected = selectedTrades.includes(trade._id);

                                    return (
                                        <tr key={trade._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isSelected ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 h-4 w-4"
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectTrade(trade._id)}
                                                />
                                            </td>
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
                                                {viewMode === 'active' ? (
                                                    <>
                                                        <button onClick={() => openEditModal(trade)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4" title="Edit Trade">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(trade._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Move to Bin">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleRestore(trade._id)} className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 mr-4" title="Restore Trade">
                                                            <ArchiveRestore className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete(trade._id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Delete Permanently">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
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
                title={viewMode === 'active' ? "Move to Bin" : "Delete Permanently"}
                message={viewMode === 'active'
                    ? "Are you sure you want to move this trade to the Bin? It won't be included in dashboard calculations but can be restored later."
                    : "Are you sure you want to permanently delete this trade? This action cannot be undone and will permanently remove it from your records."}
                confirmText={viewMode === 'active' ? "Move to Bin" : "Delete Permanently"}
            />
            <ConfirmModal
                isOpen={confirmBulkOpen}
                onClose={() => { setConfirmBulkOpen(false); setBulkActionType(null); }}
                onConfirm={confirmBulkAction}
                title={
                    bulkActionType === 'soft-delete' ? "Move Selected to Bin" :
                        bulkActionType === 'hard-delete' ? "Delete Permanently" : "Restore Selected"
                }
                message={
                    bulkActionType === 'soft-delete' ? `Are you sure you want to move ${selectedTrades.length} trade(s) to the Bin?` :
                        bulkActionType === 'hard-delete' ? `Are you sure you want to permanently delete ${selectedTrades.length} trade(s)? This action cannot be undone.` :
                            `Are you sure you want to restore ${selectedTrades.length} trade(s) to your active list?`
                }
                confirmText={
                    bulkActionType === 'soft-delete' ? "Move to Bin" :
                        bulkActionType === 'hard-delete' ? "Delete Permanently" : "Restore Trades"
                }
            />
        </div>
    );
};

export default Trades;
