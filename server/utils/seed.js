// server/utils/seed.js
// Run: node utils/seed.js
require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const { Category, Coupon } = require('../models/CategoryCoupon');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopzilla';

const categories = [
  { name: 'Electronics', icon: '💻', description: 'Gadgets, phones, laptops and more' },
  { name: 'Fashion', icon: '👗', description: 'Clothing, shoes and accessories' },
  { name: 'Home & Garden', icon: '🏠', description: 'Furniture, decor and garden supplies' },
  { name: 'Sports', icon: '⚽', description: 'Sports gear and fitness equipment' },
  { name: 'Books', icon: '📚', description: 'Books, e-books and educational material' },
  { name: 'Beauty', icon: '💄', description: 'Skincare, makeup and personal care' },
  { name: 'Toys', icon: '🎮', description: 'Toys and games for all ages' },
  { name: 'Grocery', icon: '🛒', description: 'Food, beverages and household essentials' },
];

const generateProducts = (categoryIds) => {
  const catMap = {};
  categoryIds.forEach((id, i) => { catMap[categories[i].name] = id; });

  return [
    // Electronics
    { name: 'Apple iPhone 15 Pro Max 256GB', price: 134900, originalPrice: 159900, category: catMap['Electronics'], brand: 'Apple', stock: 50, rating: 4.8, numReviews: 2341, isFeatured: true, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/1a1a2e/f97316?text=iPhone+15', public_id: 'iphone15' }], tags: ['smartphone', 'apple', 'ios'], description: 'The most powerful iPhone ever. Titanium design, A17 Pro chip, and a revolutionary camera system.' },
    { name: 'Samsung Galaxy S24 Ultra 512GB', price: 124999, originalPrice: 149999, category: catMap['Electronics'], brand: 'Samsung', stock: 35, rating: 4.7, numReviews: 1876, isFeatured: true, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/0a0a23/3498db?text=Galaxy+S24', public_id: 's24ultra' }], tags: ['smartphone', 'samsung', 'android'], description: 'Galaxy AI is here. The most note-worthy. Unmatched performance with Snapdragon 8 Gen 3.' },
    { name: 'Sony WH-1000XM5 Headphones', price: 26990, originalPrice: 34990, category: catMap['Electronics'], brand: 'Sony', stock: 120, rating: 4.9, numReviews: 5621, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/1c1c1c/f97316?text=Sony+WH1000XM5', public_id: 'sony_xm5' }], tags: ['headphones', 'sony', 'noise-cancelling'], description: 'Industry-leading noise canceling with 30-hour battery and exceptional sound quality.' },
    { name: 'MacBook Air M3 13-inch', price: 114900, originalPrice: 129900, category: catMap['Electronics'], brand: 'Apple', stock: 25, rating: 4.9, numReviews: 987, isFeatured: true, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/f5f5f5/1a1a2e?text=MacBook+Air+M3', public_id: 'macbook_m3' }], tags: ['laptop', 'apple', 'macbook'], description: 'Supercharged by M3, the latest chip in Apple\'s lineup, MacBook Air is impossibly thin.' },
    { name: 'iPad Pro 12.9" M4 Chip', price: 109900, originalPrice: 119900, category: catMap['Electronics'], brand: 'Apple', stock: 40, rating: 4.8, numReviews: 432, images: [{ url: 'https://placehold.co/600x600/e8f4f8/1a1a2e?text=iPad+Pro', public_id: 'ipad_pro' }], tags: ['tablet', 'apple', 'ipad'], description: 'Thin. Light. Epic. The iPad Pro M4 is the thinnest Apple product ever.' },
    { name: 'Dell XPS 15 OLED Laptop', price: 164990, originalPrice: 184990, category: catMap['Electronics'], brand: 'Dell', stock: 18, rating: 4.6, numReviews: 234, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/00274c/f97316?text=Dell+XPS+15', public_id: 'dell_xps15' }], tags: ['laptop', 'dell', 'oled'], description: 'The XPS 15 OLED delivers exceptional display performance with InfinityEdge design.' },

    // Fashion
    { name: 'Nike Air Max 270 React', price: 7495, originalPrice: 10995, category: catMap['Fashion'], brand: 'Nike', stock: 200, rating: 4.5, numReviews: 3421, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/f97316/white?text=Nike+Air+Max', public_id: 'nike_airmax' }], tags: ['shoes', 'nike', 'running'], description: 'Nike\'s biggest Air unit yet delivers unrivaled, all-day comfort.' },
    { name: 'Levi\'s 511 Slim Fit Jeans', price: 2799, originalPrice: 3999, category: catMap['Fashion'], brand: 'Levi\'s', stock: 300, rating: 4.4, numReviews: 8765, images: [{ url: 'https://placehold.co/600x600/1a237e/white?text=Levis+511', public_id: 'levis_511' }], tags: ['jeans', 'levis', 'denim'], description: 'Classic slim fit jeans in authentic stretch denim.' },
    { name: 'Adidas Ultraboost 23', price: 12999, originalPrice: 15999, category: catMap['Fashion'], brand: 'Adidas', stock: 85, rating: 4.7, numReviews: 2134, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/000000/white?text=Ultraboost+23', public_id: 'adidas_ub23' }], tags: ['shoes', 'adidas', 'running'], description: 'The iconic running shoe updated for 2023 with BOOST cushioning.' },
    { name: 'Puma Everyday Hoodie', price: 1799, originalPrice: 2499, category: catMap['Fashion'], brand: 'Puma', stock: 150, rating: 4.2, numReviews: 654, images: [{ url: 'https://placehold.co/600x600/212121/f97316?text=Puma+Hoodie', public_id: 'puma_hoodie' }], tags: ['hoodie', 'puma', 'sportswear'], description: 'Soft and cozy everyday hoodie with Puma signature branding.' },

    // Home & Garden
    { name: 'Dyson V15 Detect Cordless Vacuum', price: 52900, originalPrice: 59900, category: catMap['Home & Garden'], brand: 'Dyson', stock: 30, rating: 4.8, numReviews: 1234, freeShipping: true, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/c8a876/1a1a1a?text=Dyson+V15', public_id: 'dyson_v15' }], tags: ['vacuum', 'dyson', 'cordless'], description: 'Laser-guided dust detection and the most powerful Dyson cordless vacuum.' },
    { name: 'Philips Air Fryer XL 6.2L', price: 7999, originalPrice: 11999, category: catMap['Home & Garden'], brand: 'Philips', stock: 75, rating: 4.6, numReviews: 4521, images: [{ url: 'https://placehold.co/600x600/e8e8e8/1a1a1a?text=Philips+AirFryer', public_id: 'philips_af' }], tags: ['airfryer', 'philips', 'kitchen'], description: 'Rapid Air technology for guilt-free crispy results with little to no oil.' },
    { name: 'IKEA MALM Bed Frame King', price: 24999, originalPrice: 29999, category: catMap['Home & Garden'], brand: 'IKEA', stock: 12, rating: 4.3, numReviews: 876, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/f5ede3/555?text=IKEA+MALM', public_id: 'ikea_malm' }], tags: ['bed', 'ikea', 'furniture'], description: 'Minimalist bedroom frame in birch veneer, built for lasting comfort.' },

    // Sports
    { name: 'Decathlon Trek 300 Mountain Bike', price: 15999, originalPrice: 19999, category: catMap['Sports'], brand: 'Decathlon', stock: 20, rating: 4.5, numReviews: 345, freeShipping: true, images: [{ url: 'https://placehold.co/600x600/27ae60/white?text=Trek+300+MTB', public_id: 'trek300' }], tags: ['bicycle', 'mountain bike', 'outdoor'], description: '21-speed mountain bike perfect for trail riding and everyday use.' },
    { name: 'Yoga Mat Premium 6mm', price: 1299, originalPrice: 1999, category: catMap['Sports'], brand: 'Decathlon', stock: 500, rating: 4.4, numReviews: 3210, images: [{ url: 'https://placehold.co/600x600/9b59b6/white?text=Yoga+Mat', public_id: 'yoga_mat' }], tags: ['yoga', 'fitness', 'mat'], description: 'Non-slip, extra-thick yoga mat for maximum comfort during practice.' },

    // Books
    { name: 'Atomic Habits — James Clear', price: 349, originalPrice: 499, category: catMap['Books'], brand: 'Random House', stock: 1000, rating: 4.9, numReviews: 54321, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/ffa500/white?text=Atomic+Habits', public_id: 'atomic_habits' }], tags: ['self-help', 'habits', 'productivity'], description: 'Tiny Changes, Remarkable Results. The definitive guide to breaking bad habits and building good ones.' },
    { name: 'The Psychology of Money', price: 279, originalPrice: 399, category: catMap['Books'], brand: 'Jaico Publishing', stock: 800, rating: 4.8, numReviews: 23456, images: [{ url: 'https://placehold.co/600x600/2c3e50/white?text=Psychology+of+Money', public_id: 'psych_money' }], tags: ['finance', 'money', 'investing'], description: 'Timeless lessons on wealth, greed, and happiness by Morgan Housel.' },

    // Beauty
    { name: 'Cetaphil Gentle Skin Cleanser 500ml', price: 649, originalPrice: 849, category: catMap['Beauty'], brand: 'Cetaphil', stock: 400, rating: 4.7, numReviews: 9876, images: [{ url: 'https://placehold.co/600x600/e8f5e9/2e7d32?text=Cetaphil', public_id: 'cetaphil' }], tags: ['skincare', 'cleanser', 'gentle'], description: 'Gentle, non-foaming formula for normal to sensitive skin.' },
    { name: 'L\'Oreal Paris Serum Hyaluronic Acid', price: 749, originalPrice: 999, category: catMap['Beauty'], brand: 'L\'Oreal', stock: 200, rating: 4.5, numReviews: 5432, isFeatured: true, images: [{ url: 'https://placehold.co/600x600/e8d5b7/8b4513?text=Hyaluronic+Serum', public_id: 'loreal_serum' }], tags: ['serum', 'hyaluronic acid', 'anti-aging'], description: '1.5% pure hyaluronic acid for intense hydration and plumping.' },
  ];
};

const coupons = [
  { code: 'WELCOME10', type: 'percentage', value: 10, minOrderAmount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), isActive: true, description: '10% off for new users' },
  { code: 'SHOPZILLA20', type: 'percentage', value: 20, minOrderAmount: 999, maxDiscount: 500, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true, description: '20% off on orders above ₹999' },
  { code: 'FLAT200', type: 'fixed', value: 200, minOrderAmount: 1499, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true, description: '₹200 flat discount' },
  { code: 'FREESHIP', type: 'fixed', value: 49, minOrderAmount: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true, description: 'Free shipping' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Muzahid Saifi',
      email: 'admin@shopzilla.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '9876543210',
      emailVerified: true,
    });
    console.log('👑 Admin user created:', admin.email);

    // Create demo user
    await User.create({
      name: 'Demo User',
      email: 'demo@shopzilla.com',
      password: 'Demo@123',
      role: 'user',
      emailVerified: true,
    });
    console.log('👤 Demo user created: demo@shopzilla.com');

    // Create categories one by one (to trigger pre-save slug generation)
    const createdCategories = [];
    for (const cat of categories) {
      const created = await Category.create(cat);
      createdCategories.push(created);
    }
    console.log(`📂 ${createdCategories.length} categories created`);

// Create products one by one
const products = generateProducts(createdCategories.map(c => c._id));
const createdProducts = [];
for (const product of products) {
  const created = await Product.create(product);
  createdProducts.push(created);
}
console.log(`📦 ${createdProducts.length} products created`);

    // Create coupons
    await Coupon.insertMany(coupons);
    console.log(`🎟️  ${coupons.length} coupons created`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:  admin@shopzilla.com / Admin@123456');
    console.log('User:   demo@shopzilla.com  / Demo@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
