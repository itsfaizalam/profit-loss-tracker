const Trade = require('../models/Trade');
const Joi = require('joi');

const tradeSchema = Joi.object({
    stockName: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    buyPrice: Joi.number().min(0).required(),
    sellPrice: Joi.number().min(0).required(),
    buyDate: Joi.date().required(),
    sellDate: Joi.date().min(Joi.ref('buyDate')).required(),
    brokerage: Joi.number().min(0).default(0),
    notes: Joi.string().allow('').optional(),
    _id: Joi.string().optional(),
    userId: Joi.string().optional(),
    createdAt: Joi.date().optional(),
    updatedAt: Joi.date().optional(),
    __v: Joi.number().optional(),
    profitLoss: Joi.number().optional(),
    holdingDays: Joi.number().optional()
});

// @desc    Create a trade
// @route   POST /api/trades
// @access  Private
const createTrade = async (req, res) => {
    const { error } = tradeSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { stockName, quantity, buyPrice, sellPrice, buyDate, sellDate, brokerage, notes } = req.body;

    // Calculate profit/loss
    const buyAmount = buyPrice * quantity;
    const sellAmount = sellPrice * quantity;
    const profitLoss = sellAmount - buyAmount - (brokerage || 0);

    // Calculate holding days
    const start = new Date(buyDate);
    const end = new Date(sellDate);
    const diffTime = Math.abs(end - start);
    const holdingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

    try {
        const trade = new Trade({
            userId: req.user._id,
            stockName,
            quantity,
            buyPrice,
            sellPrice,
            buyDate,
            sellDate,
            brokerage: brokerage || 0,
            profitLoss,
            holdingDays,
            notes
        });

        const createdTrade = await trade.save();
        res.status(201).json(createdTrade);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get all trades for a user
// @route   GET /api/trades
// @access  Private
const getTrades = async (req, res) => {
    try {
        // Query formulation based on query params (filters)
        const query = { userId: req.user._id };

        if (req.query.stockName) {
            query.stockName = { $regex: req.query.stockName, $options: 'i' };
        }

        if (req.query.type === 'profit') {
            query.profitLoss = { $gt: 0 };
        } else if (req.query.type === 'loss') {
            query.profitLoss = { $lt: 0 };
        }

        if (req.query.startDate && req.query.endDate) {
            query.buyDate = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        const trades = await Trade.find(query).sort({ buyDate: -1 });
        res.json(trades);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Update a trade
// @route   PUT /api/trades/:id
// @access  Private
const updateTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        // Make sure user owns the trade
        if (trade.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const { error } = tradeSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { stockName, quantity, buyPrice, sellPrice, buyDate, sellDate, brokerage, notes } = req.body;

        const buyAmount = buyPrice * quantity;
        const sellAmount = sellPrice * quantity;
        const profitLoss = sellAmount - buyAmount - (brokerage || 0);

        const start = new Date(buyDate);
        const end = new Date(sellDate);
        const diffTime = Math.abs(end - start);
        const holdingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

        const updatedTrade = await Trade.findByIdAndUpdate(
            req.params.id,
            {
                stockName,
                quantity,
                buyPrice,
                sellPrice,
                buyDate,
                sellDate,
                brokerage: brokerage || 0,
                profitLoss,
                holdingDays,
                notes
            },
            { new: true } // Return the updated document
        );

        res.json(updatedTrade);
    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Delete a trade
// @route   DELETE /api/trades/:id
// @access  Private
const deleteTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);

        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        if (trade.userId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Trade.findByIdAndDelete(req.params.id);
        res.json({ message: 'Trade removed' });
    } catch (err) {
        console.error('Delete Trade Error:', err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

// @desc    Get trade report/dashboard stats
// @route   GET /api/trades/report
// @access  Private
const getTradeReport = async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.user._id });

        let totalInvested = 0;
        let totalRealizedProfit = 0;
        let winCount = 0;
        let lossCount = 0;
        let totalHoldingDays = 0;

        trades.forEach(trade => {
            totalInvested += (trade.buyPrice * trade.quantity);
            totalRealizedProfit += trade.profitLoss;
            totalHoldingDays += trade.holdingDays;

            if (trade.profitLoss > 0) winCount++;
            else if (trade.profitLoss < 0) lossCount++;
        });

        const totalTrades = trades.length;
        const winRate = totalTrades === 0 ? 0 : (winCount / totalTrades) * 100;
        const averageProfit = totalTrades === 0 ? 0 : totalRealizedProfit / totalTrades;
        const averageHoldingDays = totalTrades === 0 ? 0 : totalHoldingDays / totalTrades;

        res.json({
            totalInvested,
            totalRealizedProfit,
            totalTrades,
            winCount,
            lossCount,
            winRate,
            averageProfit,
            averageHoldingDays
        });

    } catch (err) {
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

module.exports = {
    createTrade,
    getTrades,
    updateTrade,
    deleteTrade,
    getTradeReport
};
