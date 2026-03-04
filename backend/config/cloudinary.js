const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Configure Cloudinary using ENV variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "profit_loss_tracker_profiles",
        allowedFormats: ["jpeg", "png", "jpg", "webp"],
        transformation: [{ width: 250, height: 250, crop: "limit" }],
    },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };