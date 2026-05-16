const Product = require('../models/Product');
const { Category } = require('../models/CategoryCoupon');

// GET /api/products - List products with filters/search/pagination
exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, minPrice, maxPrice, rating, brand,
      sort = '-createdAt', page = 1, limit = 12, featured, inStock
    } = req.query;

    const query = { isActive: true };

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) query.category = cat._id;
    }

    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) query.rating = { $gte: Number(rating) };

    // Brand filter
    if (brand) query.brand = { $regex: brand, $options: 'i' };

    // Featured filter
    if (featured === 'true') query.isFeatured = true;

    // Stock filter
    if (inStock === 'true') query.stock = { $gt: 0 };

    // Sort options
    const sortOptions = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'rating': { rating: -1 },
      'newest': { createdAt: -1 },
      'popular': { sold: -1 },
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');

    // Get unique brands for filter sidebar
    const brands = await Product.distinct('brand', { isActive: true });

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit)
      },
      brands: brands.filter(Boolean)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/search/suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json({ suggestions: [] });

    const products = await Product.find({
      name: { $regex: q, $options: 'i' },
      isActive: true
    }).limit(8).select('name images price slug');

    res.json({ suggestions: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:slug
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('reviews.user', 'name avatar');

    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Related products
    const related = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    }).limit(6).select('name price images rating slug brand discount');

    // Update recently viewed (if user is attached by optional auth)
    if (req.user) {
      await require('../models/User').findByIdAndUpdate(req.user._id, {
        $addToSet: { recentlyViewed: product._id },
        $slice: { recentlyViewed: -10 }
      });
    }

    res.json({ success: true, product, related });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products/:id/reviews
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found.' });

    // Check if already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ error: 'Product already reviewed.' });
    }

    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    });
    product.updateRating();
    await product.save();

    res.status(201).json({ success: true, message: 'Review added.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Create product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADMIN: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, message: 'Product deactivated.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET featured products for homepage
exports.getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true, isActive: true })
      .limit(8).select('name price images rating slug brand discount stock').populate('category', 'name');
    const newArrivals = await Product.find({ isActive: true })
      .sort({ createdAt: -1 }).limit(8).select('name price images rating slug brand discount stock').populate('category', 'name');
    const bestSellers = await Product.find({ isActive: true })
      .sort({ sold: -1 }).limit(8).select('name price images rating slug brand discount stock').populate('category', 'name');
    
    res.json({ success: true, featured, newArrivals, bestSellers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
