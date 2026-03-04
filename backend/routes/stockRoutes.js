const express = require('express');
const router = express.Router();
const { searchStocks, seedStocks } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.get('/search', protect, searchStocks);
router.post('/seed', protect, seedStocks);

module.exports = router;
