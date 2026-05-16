import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, RefreshCw, Headphones, Zap, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import { formatPrice } from '../utils/helpers';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: '💻', color: 'from-blue-500 to-purple-600' },
  { name: 'Fashion', slug: 'fashion', icon: '👗', color: 'from-pink-500 to-rose-500' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏠', color: 'from-green-500 to-emerald-600' },
  { name: 'Sports', slug: 'sports', icon: '⚽', color: 'from-orange-500 to-amber-500' },
  { name: 'Books', slug: 'books', icon: '📚', color: 'from-indigo-500 to-blue-600' },
  { name: 'Beauty', slug: 'beauty', icon: '💄', color: 'from-fuchsia-500 to-pink-500' },
  { name: 'Toys', slug: 'toys', icon: '🎮', color: 'from-yellow-500 to-orange-500' },
  { name: 'Grocery', slug: 'grocery', icon: '🛒', color: 'from-lime-500 to-green-500' },
];

const FEATURES = [
  { icon: <Truck size={22} />, title: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: <Shield size={22} />, title: 'Secure Payment', desc: '100% secure transactions' },
  { icon: <RefreshCw size={22} />, title: 'Easy Returns', desc: '30 day return policy' },
  { icon: <Headphones size={22} />, title: '24/7 Support', desc: 'Round the clock help' },
];

export default function Home() {
  const navigate = useNavigate();
  const [data, setData] = useState({ featured: [], newArrivals: [], bestSellers: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    api.get('/products/featured').then(r => {
      setData(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const tabProducts = data[activeTab] || [];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[88vh] flex items-center hero-mesh">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: `${120 + i * 60}px`, height: `${120 + i * 60}px`,
                background: i % 2 === 0 ? '#f97316' : '#8b5cf6',
                left: `${10 + i * 18}%`, top: `${15 + (i % 3) * 20}%`,
              }}
              animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>

        <div className="page-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-800">
                <Zap size={14} className="fill-current" /> New Arrivals Every Day
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                Shop <span className="text-gradient">Everything</span>
                <br />You Love
              </h1>
              <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed max-w-md">
                Discover millions of products from top brands. Unbeatable prices, lightning-fast delivery, and world-class service.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/products')} className="btn-primary text-base px-8 py-4 flex items-center gap-2">
                  Shop Now <ArrowRight size={18} />
                </button>
                <button onClick={() => navigate('/products?featured=true')} className="btn-secondary text-base px-8 py-4">
                  View Deals
                </button>
              </div>
              <div className="flex items-center gap-6 mt-10">
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-gradient">2M+</div>
                  <div className="text-xs text-[var(--text-muted)]">Products</div>
                </div>
                <div className="w-px h-10 bg-[var(--border)]" />
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-gradient">500K+</div>
                  <div className="text-xs text-[var(--text-muted)]">Happy Customers</div>
                </div>
                <div className="w-px h-10 bg-[var(--border)]" />
                <div className="text-center">
                  <div className="font-display text-2xl font-bold text-gradient">4.9★</div>
                  <div className="text-xs text-[var(--text-muted)]">Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
              className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { emoji: '💻', label: 'Electronics', price: '₹9,999', color: 'from-blue-400 to-purple-500' },
                { emoji: '👟', label: 'Footwear', price: '₹1,499', color: 'from-orange-400 to-red-500' },
                { emoji: '📱', label: 'Mobiles', price: '₹14,999', color: 'from-green-400 to-emerald-500' },
                { emoji: '⌚', label: 'Watches', price: '₹2,999', color: 'from-pink-400 to-rose-500' },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                  onClick={() => navigate('/products')}
                  className={`glass-card p-6 cursor-pointer ${i === 1 ? 'mt-8' : ''} ${i === 3 ? 'mt-8' : ''}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl mb-3 shadow-lg`}>
                    {item.emoji}
                  </div>
                  <div className="font-semibold text-sm">{item.label}</div>
                  <div className="text-xs text-[var(--text-muted)]">Starting at</div>
                  <div className="font-display font-bold text-primary-500">{item.price}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-y border-[var(--border)] bg-[var(--bg-secondary)]">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-500 flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-[var(--text-muted)]">{f.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 page-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Find exactly what you're looking for</p>
          </div>
          <Link to="/products" className="text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1">
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }} viewport={{ once: true }}>
              <Link to={`/products?category=${cat.slug}`}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-[var(--bg-secondary)] hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-[var(--border)] hover:border-primary-300 dark:hover:border-primary-700 transition-all group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-xs font-semibold text-center text-[var(--text-secondary)] group-hover:text-primary-500 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Products Tabs */}
      <section className="py-8 page-container">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="section-title">Discover Products</h2>
          <div className="flex gap-2 p-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border)]">
            {[
              { key: 'featured', label: '⭐ Featured' },
              { key: 'newArrivals', label: '🆕 New Arrivals' },
              { key: 'bestSellers', label: '🔥 Best Sellers' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-primary-500'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {loading
            ? [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
            : tabProducts.slice(0, 8).map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
          }
        </div>

        {!loading && tabProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="font-semibold text-lg mb-2">No products yet</h3>
            <p className="text-[var(--text-muted)] text-sm">Products will appear here once added by admin</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/products" className="btn-secondary inline-flex items-center gap-2">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 page-container">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-500 to-accent-500 p-10 md:p-16 text-white text-center">
          <div className="absolute inset-0 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute rounded-full bg-white"
                style={{ width: `${60+i*40}px`, height: `${60+i*40}px`, left: `${i*15}%`, top: `${-20+(i%3)*40}%`, opacity: 0.3 }} />
            ))}
          </div>
          <div className="relative z-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Get 20% Off Your First Order!
            </h2>
            <p className="text-white/80 mb-6 text-lg">Use code <span className="font-mono font-bold text-white bg-white/20 px-3 py-1 rounded-lg">SHOPZILLA20</span></p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/register')}
                className="px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-primary-50 transition-colors">
                Sign Up & Save
              </button>
              <button onClick={() => navigate('/products')}
                className="px-8 py-3 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Shop Now
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
