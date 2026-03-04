const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Update user profile & picture
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.name = req.body.name || user.name;

        // If a new file uses req.file uploaded by Cloudinary multer middleware
        if (req.file && req.file.path) {
            user.profilePic = req.file.path; // Update with the url string from Cloudinary
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePic: updatedUser.profilePic
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating profile', error: error.message });
    }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide required fields' });
        }

        const user = await User.findById(req.user._id);

        // Verify current password is correct
        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);

            await user.save();
            res.status(200).json({ message: 'Password updated successfully' });
        } else {
            res.status(401).json({ message: 'Current password is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error updating password', error: error.message });
    }
}

module.exports = {
    updateProfile,
    changePassword
};
