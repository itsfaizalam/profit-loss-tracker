import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                buyDate: initialData.buyDate.substring(0, 10),
                sellDate: initialData.sellDate.substring(0, 10),
            });
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
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
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

                <div className="relative z-10 inline-block align-bottom bg-white dark:bg-gray-800 rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 dark:border-gray-700">
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
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Name</label>
                                <input
                                    type="text"
                                    name="stockName"
                                    required
                                    value={formData.stockName}
                                    onChange={handleChange}
                                    className="appearance-none rounded-lg block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="e.g. AAPL"
                                />
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
