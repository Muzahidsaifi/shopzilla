// routes/cart.js - Cart is managed client-side (localStorage/Redux), backend just validates
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');

// Validate cart items (check stock/prices)
router.post('/validate', protect, async (req, res) => {
  try {
    const { items } = req.body;
    const validated = [];
    for (const item of items) {
      const product = await Product.findById(item.product).select('name price stock images');
      if (!product) continue;
      validated.push({
        ...item,
        currentPrice: product.price,
        availableStock: product.stock,
        name: product.name,
        image: product.images[0]?.url
      });
    }
    res.json({ success: true, items: validated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
