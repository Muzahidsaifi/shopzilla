const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', adminCtrl.getDashboardStats);
router.get('/users', adminCtrl.getUsers);
router.patch('/users/:id', adminCtrl.updateUser);
router.get('/coupons', adminCtrl.getCoupons);
router.post('/coupons', adminCtrl.createCoupon);
router.put('/coupons/:id', adminCtrl.updateCoupon);
router.delete('/coupons/:id', adminCtrl.deleteCoupon);

module.exports = router;
