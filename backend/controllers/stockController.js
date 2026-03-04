const Stock = require('../models/Stock');

// @desc    Search stocks by symbol or name
// @route   GET /api/stocks/search?q=query
// @access  Private
const searchStocks = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.length < 1) {
            return res.status(200).json([]);
        }

        // Create a case-insensitive regex pattern
        // We use \b for word boundaries if appropriate, but prefix matching is best for symbol
        const regex = new RegExp(`^${q}`, 'i'); // Prefix match first
        const containsRegex = new RegExp(q, 'i'); // Then contains match

        // Prioritize: Direct symbol prefix match -> Symbol contains match -> Name contains match
        const stocks = await Stock.find({
            $or: [
                { symbol: { $regex: regex } },
                { name: { $regex: containsRegex } }
            ]
        })
            .sort({ symbol: 1 }) // Sort alphabetically by symbol
            .limit(20); // Limit results for performance

        res.status(200).json(stocks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Seed database with popular Indian stocks
// @route   POST /api/stocks/seed
// @access  Private (Admin or Setup only)
const seedStocks = async (req, res) => {
    try {
        const { parse } = require('csv-parse/sync');

        // Fetch instrument dump
        console.log('Fetching instrument data from Kite Connect...');
        const response = await fetch('https://api.kite.trade/instruments');

        if (!response.ok) {
            throw new Error(`Failed to fetch instruments: ${response.statusText}`);
        }

        const csvData = await response.text();
        console.log('Parsing CSV data...');

        // Parse CSV
        const records = parse(csvData, {
            columns: true,
            skip_empty_lines: true
        });

        // Filter and map for NSE equities
        const nseStocksMap = new Map();

        records.forEach(row => {
            // We only want active NSE normal equities
            if (row.exchange === 'NSE' && row.segment === 'NSE' && row.name) {
                // Use Map to ensure uniqueness by symbol
                if (!nseStocksMap.has(row.tradingsymbol)) {
                    nseStocksMap.set(row.tradingsymbol, {
                        symbol: row.tradingsymbol,
                        name: row.name,
                        exchange: 'NSE'
                    });
                }
            }
        });

        const stocksToInsert = Array.from(nseStocksMap.values());
        console.log(`Found ${stocksToInsert.length} unique NSE equities.`);

        if (stocksToInsert.length === 0) {
            return res.status(400).json({ message: 'No valid NSE stocks found to parse.' });
        }

        // Clear existing collection
        console.log('Clearing old stock data...');
        await Stock.deleteMany({});

        // Batch insert to prevent memory issues with MongoDB
        const batchSize = 1000;
        let insertedCount = 0;

        console.log('Inserting into database in batches...');
        for (let i = 0; i < stocksToInsert.length; i += batchSize) {
            const batch = stocksToInsert.slice(i, i + batchSize);
            await Stock.insertMany(batch);
            insertedCount += batch.length;
            console.log(`Inserted ${insertedCount} / ${stocksToInsert.length}`);
        }

        res.status(201).json({
            message: 'Stocks seeded dynamically successfully',
            count: insertedCount
        });
    } catch (err) {
        console.error('Seeding error:', err);
        res.status(500).json({ message: 'Server Error seeding stocks', error: err.message });
    }
};

module.exports = {
    searchStocks,
    seedStocks
};
