const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getUsers,
    toggleBlockUser,
    deleteUser,
    getUserProfile,
    updateUser,
    softDeleteUserTrade,
    hardDeleteUserTrade,
    restoreUserTrade
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here are protected and require admin privileges
router.use(protect);
router.use(admin);

router.route('/dashboard').get(getDashboardStats);
router.route('/users').get(getUsers);
router.route('/users/:id').get(getUserProfile).put(updateUser).delete(deleteUser);
router.route('/users/:id/block').put(toggleBlockUser);

// Admin Trade routes
router.route('/trades/:id/soft').delete(softDeleteUserTrade);
router.route('/trades/:id/hard').delete(hardDeleteUserTrade);
router.route('/trades/:id/restore').put(restoreUserTrade);

module.exports = router;
