const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

// Secure all user routes
router.use(protect);

// Apply multer Cloudinary upload middleware specifically to the profile update route
// We wrap it to catch multer/Cloudinary errors and send a proper JSON response instead of crashing HTML
router.put('/profile', (req, res, next) => {
    upload.single('profilePic')(req, res, (err) => {
        if (err) {
            console.error('Multer/Cloudinary Upload Error:', err);
            return res.status(400).json({
                message: 'Image upload failed',
                error: err.message || err
            });
        }
        next();
    });
}, updateProfile);

router.put('/password', changePassword);

module.exports = router;
