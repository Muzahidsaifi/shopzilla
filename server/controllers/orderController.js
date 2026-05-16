const Order = require('../models/Order');
const Product = require('../models/Product');
const { Coupon } = require('../models/CategoryCoupon');
const { sendEmail } = require('../utils/email');

// POST /api/orders - Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, payment, couponCode, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items in order.' });
    }

    // Validate items and calculate pricing
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Product ${item.product} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}.` });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        variant: item.variant
      });

      // Update stock
      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save();
    }

    // Tax (18% GST)
    const tax = Math.round(subtotal * 0.18 * 100) / 100;

    // Shipping
    const shippingCost = subtotal >= 500 ? 0 : 49;

    // Coupon discount
    let discount = 0;
    let couponInfo = null;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon && coupon.isValid() && subtotal >= coupon.minOrderAmount) {
        if (!coupon.usedBy.includes(req.user._id)) {
          if (coupon.type === 'percentage') {
            discount = Math.round(subtotal * coupon.value / 100);
            if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          } else {
            discount = coupon.value;
          }
          coupon.usedCount += 1;
          coupon.usedBy.push(req.user._id);
          await coupon.save();
          couponInfo = { code: coupon.code, discount };
        }
      }
    }

    const total = subtotal + tax + shippingCost - discount;

    // Estimated delivery (5-7 days)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      pricing: { subtotal, tax, shippingCost, discount, total },
      coupon: couponInfo,
      payment,
      estimatedDelivery,
      notes,
      statusHistory: [{ status: 'pending', message: 'Order placed successfully' }]
    });

    // Send confirmation email
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - ${order.orderId}`,
      html: `
        <h2>Order Confirmed! 🎉</h2>
        <p>Hi ${req.user.name},</p>
        <p>Your order <strong>${order.orderId}</strong> has been placed successfully.</p>
        <p>Total: ₹${total.toFixed(2)}</p>
        <p>Estimated Delivery: ${estimatedDelivery.toDateString()}</p>
        <p>Thank you for shopping with ShopZilla!</p>
      `
    }).catch(console.error);

    await order.populate('items.product', 'name images');
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders - User's orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select('-items.product');

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    
    // Verify ownership (or admin)
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
    }

    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', message: 'Order cancelled by user' });
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, message, location } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    order.status = status;
    order.statusHistory.push({ status, message: message || `Status updated to ${status}`, location });

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    // Notify user
    const user = await require('../models/User').findById(order.user);
    if (user) {
      sendEmail({
        to: user.email,
        subject: `Order Update - ${order.orderId}`,
        html: `<p>Your order ${order.orderId} status: <strong>${status.replace(/_/g,' ').toUpperCase()}</strong></p>`
      }).catch(console.error);
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
