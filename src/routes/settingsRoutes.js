const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'mypolimer',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            public_id: file.fieldname === 'watermark' ? 'watermark' : 'logo',
            overwrite: true,
        };
    },
});

const upload = multer({ storage });

// Birden fazla dosya yükleme için fields kullan
const uploadFields = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'watermark', maxCount: 1 }
]);

router.get('/', authMiddleware, settingsController.getSettings);
router.put('/', authMiddleware, uploadFields, settingsController.updateSettings);

module.exports = router;
