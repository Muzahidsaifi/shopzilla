const mongoose = require('mongoose');
const fs = require('fs');

require('dotenv').config();
const URI = process.env.MONGODB_URI;

mongoose.connect(URI).then(async () => {
  console.log('✅ Connected to Atlas!');
  const db = mongoose.connection.db;

  const categories = JSON.parse(fs.readFileSync('categories.json'));
  await db.collection('categories').deleteMany({});
  await db.collection('categories').insertMany(categories);
  console.log('📂 Categories imported:', categories.length);

  const products = JSON.parse(fs.readFileSync('products.json'));
  await db.collection('products').deleteMany({});
  await db.collection('products').insertMany(products);
  console.log('📦 Products imported:', products.length);

  const coupons = JSON.parse(fs.readFileSync('coupons.json'));
  await db.collection('coupons').deleteMany({});
  await db.collection('coupons').insertMany(coupons);
  console.log('🎟️ Coupons imported:', coupons.length);

  console.log('🎉 All data imported successfully!');
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});