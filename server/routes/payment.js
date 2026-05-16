const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Razorpay Payment
router.post('/razorpay/create', protect, async (req, res) => {
  try {
    const Razorpay = require('razorpay');
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount } = req.body;
    
    const options = {
      amount: Math.round(amount * 100), // paise mein
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    
    res.json({ 
      success: true, 
      order, 
      key: process.env.RAZORPAY_KEY_ID 
    });

  } catch (err) {
    console.error('Razorpay Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Stripe Payment
router.post('/create-intent', protect, async (req, res) => {
  try {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const { amount, currency = 'inr' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId: req.user._id.toString() }
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;