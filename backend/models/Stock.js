const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    exchange: {
        type: String,
        default: 'NSE', // Can be NSE or BSE
    }
}, { timestamps: true });

// Create text index for faster searching
stockSchema.index({ symbol: 'text', name: 'text' });
// Also create exact/prefix matching indexes for fast regex queries
stockSchema.index({ name: 1 });

const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;
