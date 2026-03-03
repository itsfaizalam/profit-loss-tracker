const express = require('express');
const router = express.Router();
const {
    createTrade,
    getTrades,
    updateTrade,
    deleteTrade,
    getTradeReport
} = require('../controllers/tradeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTrade)
    .get(protect, getTrades);

router.route('/report')
    .get(protect, getTradeReport);

router.route('/:id')
    .put(protect, updateTrade)
    .delete(protect, deleteTrade);

module.exports = router;
