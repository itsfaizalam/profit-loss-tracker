const User = require('../models/User');
const Trade = require('../models/Trade');

// @desc    Get top-level dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsersCount = await User.countDocuments({ isBlocked: false, isVerified: true });
        const blockedUsers = await User.countDocuments({ isBlocked: true });

        const totalTrades = await Trade.countDocuments();
        const activeTrades = await Trade.countDocuments({ isDeleted: false });
        const deletedTrades = await Trade.countDocuments({ isDeleted: true });

        // Aggregate Profit and Loss
        const plAggregation = await Trade.aggregate([
            { $match: { isDeleted: false } }, // Only active trades count towards real P&L
            {
                $group: {
                    _id: null,
                    totalProfit: {
                        $sum: { $cond: [{ $gt: ["$profitLoss", 0] }, "$profitLoss", 0] }
                    },
                    totalLoss: {
                        $sum: { $cond: [{ $lt: ["$profitLoss", 0] }, "$profitLoss", 0] }
                    }
                }
            }
        ]);

        const totalProfit = plAggregation.length > 0 ? plAggregation[0].totalProfit : 0;
        const totalLoss = plAggregation.length > 0 ? plAggregation[0].totalLoss : 0;

        // Daily Trades for charting (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyTrades = await Trade.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.status(200).json({
            users: { totalUsers, activeUsersCount, blockedUsers },
            trades: { totalTrades, activeTrades, deletedTrades },
            financials: { totalProfit, totalLoss },
            charts: { dailyTrades }
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error retrieving stats', error: err.message });
    }
};

// @desc    Get all users with aggregated stats
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        // Aggregate users with their trade counts and total P&L
        const users = await User.aggregate([
            {
                $lookup: {
                    from: 'trades',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'userTrades'
                }
            },
            {
                $project: {
                    password: 0, // exclude password
                    verificationToken: 0
                }
            },
            {
                $addFields: {
                    totalTradesCount: { $size: "$userTrades" },
                    totalProfitLoss: {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: "$userTrades",
                                        as: "trade",
                                        cond: { $eq: ["$$trade.isDeleted", false] }
                                    }
                                },
                                as: "activeTrade",
                                in: "$$activeTrade.profitLoss"
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    userTrades: 0 // We don't need the massive array of raw trades sent to the list view
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error retrieving users', error: err.message });
    }
};

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block another admin' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({ message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully', isBlocked: user.isBlocked });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user', error: err.message });
    }
};

// @desc    Delete user and all their trades
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot delete another admin' });
        }

        // Delete all associated trades
        await Trade.deleteMany({ userId: user._id });
        // Delete user
        await User.deleteOne({ _id: user._id });

        res.status(200).json({ message: 'User and all associated trades deleted permanently' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting user', error: err.message });
    }
};

// @desc    Get single user profile and their trades
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -verificationToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const trades = await Trade.find({ userId: user._id }).sort({ createdAt: -1 });

        // Calculate stats for the admin view
        const activeTradesList = trades.filter(t => !t.isDeleted);

        let netProfitLoss = 0;
        let totalProfitTrades = 0;
        let totalLossTrades = 0;

        activeTradesList.forEach(trade => {
            netProfitLoss += trade.profitLoss;
            if (trade.profitLoss > 0) totalProfitTrades++;
            if (trade.profitLoss < 0) totalLossTrades++;
        });

        const stats = {
            totalTrades: trades.length,
            activeTrades: activeTradesList.length,
            deletedTrades: trades.length - activeTradesList.length,
            netProfitLoss,
            totalProfitTrades,
            totalLossTrades
        };

        res.status(200).json({ user, stats, trades });
    } catch (err) {
        res.status(500).json({ message: 'Server error retrieving user profile', error: err.message });
    }
};

// @desc    Update user profile (name, email, status) — admin only
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { name, email, isBlocked } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot edit another admin account via this panel' });
        }

        // Validate email format
        if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
        }

        const oldEmail = user.email;
        const newEmail = email ? email.toLowerCase().trim() : oldEmail;

        // Check for duplicate email (only if email is being changed)
        if (newEmail !== oldEmail) {
            const existingUser = await User.findOne({ email: newEmail });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
        }

        // Update user fields
        user.name = name || user.name;
        user.email = newEmail;
        if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;

        await user.save();

        // If email changed, update any trade records that store userEmail field (for DB consistency)
        if (newEmail !== oldEmail) {
            await Trade.updateMany(
                { userId: user._id, userEmail: oldEmail },
                { $set: { userEmail: newEmail } }
            );
        }

        res.status(200).json({
            message: 'User updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isBlocked: user.isBlocked,
                role: user.role
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error updating user', error: err.message });
    }
};

// @desc    Restore an arbitrary soft-deleted user trade
// @route   PUT /api/admin/trades/:id/restore
// @access  Private/Admin
const restoreUserTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        trade.isDeleted = false;
        await trade.save();
        res.status(200).json({ message: 'Trade restored successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error restoring trade', error: err.message });
    }
};

// @desc    Soft delete an arbitrary user trade
// @route   DELETE /api/admin/trades/:id/soft
// @access  Private/Admin
const softDeleteUserTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        trade.isDeleted = true;
        await trade.save();
        res.status(200).json({ message: 'Trade moved to bin' });
    } catch (err) {
        res.status(500).json({ message: 'Server error moving trade to bin', error: err.message });
    }
};

// @desc    Permanently delete an arbitrary user trade
// @route   DELETE /api/admin/trades/:id/hard
// @access  Private/Admin
const hardDeleteUserTrade = async (req, res) => {
    try {
        const trade = await Trade.findById(req.params.id);
        if (!trade) {
            return res.status(404).json({ message: 'Trade not found' });
        }

        await Trade.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Trade permanently deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error deleting trade permanently', error: err.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getUserProfile,
    updateUser,
    softDeleteUserTrade,
    hardDeleteUserTrade,
    restoreUserTrade
};
