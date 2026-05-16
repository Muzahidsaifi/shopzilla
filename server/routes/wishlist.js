// routes/wishlist.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'name price images rating slug discount brand');
    res.json({ success: true, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/toggle/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.indexOf(req.params.productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
    } else {
      user.wishlist.push(req.params.productId);
    }
    await user.save();
    res.json({ success: true, inWishlist: idx === -1, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
