const express = require('express');
const router = express.Router();
const productCtrl = require('../controllers/productController');
const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

router.get('/', productCtrl.getProducts);
router.get('/featured', productCtrl.getFeaturedProducts);
router.get('/search/suggestions', productCtrl.getSearchSuggestions);
router.get('/:slug', optionalAuth, productCtrl.getProduct);
router.post('/:id/reviews', protect, productCtrl.addReview);

// Admin routes
router.post('/', protect, adminOnly, productCtrl.createProduct);
router.put('/:id', protect, adminOnly, productCtrl.updateProduct);
router.delete('/:id', protect, adminOnly, productCtrl.deleteProduct);

module.exports = router;
