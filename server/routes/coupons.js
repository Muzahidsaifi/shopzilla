const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Coupon } = require('../models/CategoryCoupon');

router.post('/validate', protect, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
    
    if (!coupon || !coupon.isValid()) {
      return res.status(400).json({ error: 'Invalid or expired coupon code.' });
    }
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ error: `Minimum order amount ₹${coupon.minOrderAmount} required.` });
    }
    if (coupon.usedBy.includes(req.user._id)) {
      return res.status(400).json({ error: 'Coupon already used.' });
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round(orderAmount * coupon.value / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }

    res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount }, discount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
