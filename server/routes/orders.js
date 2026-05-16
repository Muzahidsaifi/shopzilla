const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, orderCtrl.createOrder);
router.get('/my-orders', protect, orderCtrl.getMyOrders);
router.get('/:id', protect, orderCtrl.getOrder);
router.put('/:id/cancel', protect, orderCtrl.cancelOrder);

// Admin
router.get('/', protect, adminOnly, orderCtrl.getAllOrders);
router.put('/:id/status', protect, adminOnly, orderCtrl.updateOrderStatus);

module.exports = router;
