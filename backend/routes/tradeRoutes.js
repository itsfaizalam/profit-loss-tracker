const express = require('express');
const router = express.Router();
const {
    createTrade,
    getTrades,
    updateTrade,
    deleteTrade,
    getTradeReport,
    getBinTrades,
    restoreTrade,
    hardDeleteTrade,
    bulkSoftDeleteTrades,
    bulkRestoreTrades,
    bulkHardDeleteTrades
} = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTrade)
    .get(protect, getTrades);

router.route('/bin')
    .get(protect, getBinTrades);

router.route('/report')
    .get(protect, getTradeReport);

router.route('/bulk-soft-delete')
    .post(protect, bulkSoftDeleteTrades);

router.route('/bulk-restore')
    .post(protect, bulkRestoreTrades);

router.route('/bulk-delete')
    .post(protect, bulkHardDeleteTrades);

router.route('/:id')
    .put(protect, updateTrade)
    .delete(protect, deleteTrade);

router.route('/:id/restore')
    .put(protect, restoreTrade);

router.route('/:id/hard')
    .delete(protect, hardDeleteTrade);

module.exports = router;
