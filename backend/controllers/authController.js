const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate random token for email verification
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Create user with unverified status
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            isVerified: false
        });

        if (user) {
            // Send verification email
            // Generate link based on environment
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

            const message = `
                Hello ${user.name},\n\n
                Welcome to Profit & Loss Tracker!\n
                Please click the link below to verify your email address and activate your account:\n\n
                ${verifyUrl}\n\n
                If you did not request this, please ignore this email.
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your email for Profit & Loss Tracker',
                    message
                });

                res.status(201).json({
                    message: 'Registration successful! Please check your email to verify your account.'
                });
            } catch (emailError) {
                // If email fails to send, we might want to delete the user or handle gracefully
                console.error("Failed to send verification email", emailError);
                res.status(500).json({ message: 'User registered, but verification email failed to send.' });
            }

        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Verify email address
// @route   GET /api/auth/verify/:token
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear the token
        await user.save();

        res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
}

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {

            // Check if user is verified
            if (!user.isVerified) {
                return res.status(403).json({ message: 'Please verify your email address to log in.' });
            }

            // Check if user is blocked by admin
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been blocked by an administrator.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePic: user.profilePic,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email address' });

    try {
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if the email exists or not (security)
            return res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });
        }

        // Generate raw token and hashed version
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken = hashed;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

        // ALWAYS log the link to console (dev convenience + fallback if email fails)
        console.log('\n=================================================');
        console.log('  PASSWORD RESET LINK (valid 1 hour)');
        console.log('=================================================');
        console.log(`  User : ${user.name} <${user.email}>`);
        console.log(`  Link : ${resetUrl}`);
        console.log('=================================================\n');

        const message = `Hello ${user.name},\n\nYou requested a password reset for your Profit & Loss Tracker account.\n\nClick the link below to set a new password. This link is valid for 1 hour:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

        // Try sending email — but don't let failure break the flow
        try {
            await sendEmail({ email: user.email, subject: 'Password Reset Request - P&L Tracker', message });
        } catch (emailErr) {
            // Email failed — token is still valid, link is in console
            console.error('[ForgotPassword] Email delivery failed (link still valid via console):', emailErr.message);
        }

        // Always return success so the user isn't stuck
        res.status(200).json({ message: 'If that email is registered, a reset link has been sent.' });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    try {
        // Hash the raw token from the URL to compare with DB
        const hashed = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: Date.now() } // not expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token. Please request a new one.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful! You can now log in with your new password.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    forgotPassword,
    resetPassword
};
