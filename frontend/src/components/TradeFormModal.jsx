import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import api from '../services/api';

const TradeFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        stockName: '',
        quantity: '',
        buyPrice: '',
        sellPrice: '',
        buyDate: '',
        sellDate: '',
        brokerage: '',
        notes: ''
    });

    // Auto-suggest state
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingStocks, setIsLoadingStocks] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                buyDate: initialData.buyDate.substring(0, 10),
                sellDate: initialData.sellDate.substring(0, 10),
            });
            setSearchQuery(initialData.stockName);
        } else {
            setFormData({
                stockName: '',
                quantity: '',
                buyPrice: '',
                sellPrice: '',
                buyDate: new Date().toISOString().substring(0, 10),
                sellDate: new Date().toISOString().substring(0, 10),
                brokerage: '',
                notes: ''
            });
            setSearchQuery('');
        }
    }, [initialData, isOpen]);

    // Handle outside click for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search API Call
    useEffect(() => {
        if (!searchQuery || searchQuery === formData.stockName) {
            setSuggestions([]);
            setIsDropdownOpen(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoadingStocks(true);
            try {
                const res = await api.get(`/stocks/search?q=${searchQuery}`);
                setSuggestions(res.data);
                setIsDropdownOpen(res.data.length > 0);
                setHighlightedIndex(-1);
            } catch (err) {
                console.error("Failed to fetch stocks:", err);
            } finally {
                setIsLoadingStocks(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, formData.stockName]);


    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleStockInputChange = (e) => {
        setSearchQuery(e.target.value);
        // Clear actual stock name block if user modifies the text
        if (formData.stockName && e.target.value !== formData.stockName) {
            setFormData(prev => ({ ...prev, stockName: '' }));
        }
    };

    const handleSelectStock = (stock) => {
        setSearchQuery(stock.symbol);
        setFormData(prev => ({ ...prev, stockName: stock.symbol }));
        setSuggestions([]);
        setIsDropdownOpen(false);
    };

    const handleKeyDown = (e) => {
        if (!isDropdownOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : 0
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev > 0 ? prev - 1 : suggestions.length - 1
            );
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            handleSelectStock(suggestions[highlightedIndex]);
        } else if (e.key === 'Escape') {
            setIsDropdownOpen(false);
        }
    };

    // Helper to highlight matching text
    const highlightMatch = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? <span key={i} className="bg-yellow-200 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-200">{part}</span> : part
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // If they typed something but didn't select from dropdown, just use what they typed
        const finalStockName = formData.stockName || searchQuery.toUpperCase();

        onSubmit({
            ...formData,
            stockName: finalStockName,
            quantity: Number(formData.quantity),
            buyPrice: Number(formData.buyPrice),
            sellPrice: Number(formData.sellPrice),
            brokerage: formData.brokerage ? Number(formData.brokerage) : 0
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-gray-500/75 dark:bg-gray-900/80" onClick={onClose} />

                <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 dark:border-gray-700">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                            {initialData ? 'Edit Trade' : 'Add New Trade'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 text-sm">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                            <div className="sm:col-span-2 relative" ref={dropdownRef}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Name / Symbol</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="searchQuery"
                                        required
                                        autoComplete="off"
                                        value={searchQuery}
                                        onChange={handleStockInputChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => { if (suggestions.length > 0 && searchQuery !== formData.stockName) setIsDropdownOpen(true); }}
                                        className="appearance-none rounded-lg block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Search stock symbol or name (e.g. RELIANCE)"
                                    />
                                    {isLoadingStocks && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Autocomplete Dropdown */}
                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {suggestions.map((stock, index) => (
                                            <div
                                                key={stock._id}
                                                className={`px-4 py-2 cursor-pointer transition-colors ${highlightedIndex === index
                                                        ? 'bg-blue-50 dark:bg-blue-900/30'
                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                onClick={() => handleSelectStock(stock)}
                                                onMouseEnter={() => setHighlightedIndex(index)}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {highlightMatch(stock.symbol, searchQuery)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {highlightMatch(stock.name, searchQuery)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="1"
                                    step="1"
                                    required
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brokerage (₹)</label>
                                <input
                                    type="number"
                                    name="brokerage"
                                    min="0"
                                    step="0.01"
                                    value={formData.brokerage}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buy Price (₹)</label>
                                <input
                                    type="number"
                                    name="buyPrice"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.buyPrice}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sell Price (₹)</label>
                                <input
                                    type="number"
                                    name="sellPrice"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={formData.sellPrice}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buy Date</label>
                                <input
                                    type="date"
                                    name="buyDate"
                                    required
                                    value={formData.buyDate}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sell Date</label>
                                <input
                                    type="date"
                                    name="sellDate"
                                    required
                                    value={formData.sellDate}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                                <textarea
                                    name="notes"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Strategy used, emotions, etc."
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                {initialData ? 'Update Trade' : 'Save Trade'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TradeFormModal;
