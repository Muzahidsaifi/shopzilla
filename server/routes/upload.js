// routes/upload.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image as base64
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { image, folder = 'shopzilla' } = req.body;
    if (!image) return res.status(400).json({ error: 'Image required.' });

    const result = await cloudinary.uploader.upload(image, {
      folder,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:publicId', protect, adminOnly, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Image deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
