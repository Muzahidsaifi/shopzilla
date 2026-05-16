// routes/users.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.get('/recently-viewed', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('recentlyViewed', 'name price images rating slug');
    res.json({ success: true, products: user.recentlyViewed.reverse() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
