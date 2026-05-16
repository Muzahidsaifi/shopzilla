import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Sun, Moon, User, Menu, X,
  ChevronDown, Package, LogOut, Settings, LayoutDashboard, Zap
} from 'lucide-react';
import { toggleTheme } from '../../store/slices/uiSlice';
import { toggleCart } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { selectCartCount } from '../../store/slices/cartSlice';
import api from '../../utils/api';
import { debounce } from '../../utils/helpers';

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', icon: '💻' },
  { name: 'Fashion', slug: 'fashion', icon: '👗' },
  { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
  { name: 'Sports', slug: 'sports', icon: '⚽' },
  { name: 'Books', slug: 'books', icon: '📚' },
  { name: 'Beauty', slug: 'beauty', icon: '💄' },
  { name: 'Toys', slug: 'toys', icon: '🎮' },
  { name: 'Grocery', slug: 'grocery', icon: '🛒' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useSelector(s => s.ui);
  const { user } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(s => s.wishlist.items.length);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const fetchSuggestions = debounce(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await api.get(`/products/search/suggestions?q=${q}`);
      setSuggestions(res.data.suggestions || []);
    } catch { setSuggestions([]); }
  }, 300);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSuggestions([]);
      setSearchFocused(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass shadow-md' : 'bg-[var(--bg-primary)]'
    }`}>
      {/* Promo banner */}
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs py-2 text-center font-medium">
        <span className="flex items-center justify-center gap-2">
          <Zap size={12} />
          Free shipping on orders above ₹499 | Use code SHOPZILLA20 for 20% off
          <Zap size={12} />
        </span>
      </div>

      <div className="page-container">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow">
              <ShoppingCart size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient hidden sm:block">
              ShopZilla
            </span>
          </Link>

          {/* Categories dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex items-center gap-1 nav-link text-sm"
            >
              Categories <ChevronDown size={14} className={`transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {categoriesOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 top-full mt-2 w-56 glass-card py-2 z-50"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/products?category=${cat.slug}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/50 transition-colors"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <span>{cat.icon}</span>
                      {cat.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search bar */}
          <div className="flex-1 relative max-w-xl hidden sm:block" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value); }}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Search products, brands..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all"
                />
              </div>
            </form>
            {/* Suggestions */}
            <AnimatePresence>
              {searchFocused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-full left-0 right-0 mt-1 glass-card py-2 z-50 overflow-hidden"
                >
                  {suggestions.map(s => (
                    <button
                      key={s._id}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-950/30 text-left transition-colors"
                      onClick={() => { navigate(`/products/${s.slug}`); setSuggestions([]); }}
                    >
                      <img src={s.images?.[0]?.url || 'https://placehold.co/32'} alt={s.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="text-sm font-medium text-[var(--text-primary)]">{s.name}</div>
                        <div className="text-xs text-primary-500 font-semibold">₹{s.price?.toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Wishlist */}
            <Link to="/account/wishlist" className="relative p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors hidden sm:flex">
              <Heart size={18} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={12} />
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-card py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-[var(--border)]">
                        <div className="text-sm font-semibold">{user.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{user.email}</div>
                      </div>
                      {[
                        { icon: <LayoutDashboard size={14}/>, label: 'Dashboard', to: '/account' },
                        { icon: <Package size={14}/>, label: 'My Orders', to: '/account/orders' },
                        { icon: <Heart size={14}/>, label: 'Wishlist', to: '/account/wishlist' },
                        { icon: <Settings size={14}/>, label: 'Profile', to: '/account/profile' },
                        ...(user.role === 'admin' ? [{ icon: <LayoutDashboard size={14}/>, label: '⚡ Admin Panel', to: '/admin' }] : []),
                      ].map(item => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-950/30 transition-colors">
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-[var(--border)] mt-1">
                        <LogOut size={14} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4 hidden sm:flex items-center gap-1.5">
                <User size={14} /> Login
              </Link>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] md:hidden transition-colors">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[var(--border)] bg-[var(--bg-primary)] md:hidden"
          >
            <div className="page-container py-4 space-y-3">
              {/* Mobile search */}
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </form>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.slice(0, 8).map(cat => (
                  <Link key={cat.slug} to={`/products?category=${cat.slug}`}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[var(--bg-secondary)] text-center text-xs">
                    <span className="text-2xl">{cat.icon}</span>
                    <span className="text-[var(--text-secondary)]">{cat.name.split(' ')[0]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
