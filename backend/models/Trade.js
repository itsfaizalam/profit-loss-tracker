const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stockName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    buyPrice: {
        type: Number,
        required: true
    },
    sellPrice: {
        type: Number,
        required: true
    },
    buyDate: {
        type: Date,
        required: true
    },
    sellDate: {
        type: Date,
        required: true
    },
    brokerage: {
        type: Number,
        default: 0
    },
    profitLoss: {
        type: Number,
        required: true
    },
    holdingDays: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Trade', tradeSchema);
