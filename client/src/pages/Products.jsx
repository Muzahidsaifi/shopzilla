import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState(true);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    brand: searchParams.get('brand') || '',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    const search = searchParams.get('search') || searchParams.get('q');
    if (search) params.set('search', search);
    params.set('limit', '12');
    try {
      const r = await api.get(`/products?${params}`);
      setProducts(r.data.products);
      setPagination(r.data.pagination);
      setBrands(r.data.brands || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const setFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', rating: '', brand: '', sort: 'newest', page: 1 });
  };

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.rating, filters.brand].filter(Boolean).length;

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Category</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input type="radio" name="category" value="" checked={!filters.category} onChange={() => setFilter('category', '')}
              className="accent-primary-500" />
            <span className="text-[var(--text-secondary)] hover:text-primary-500">All Categories</span>
          </label>
          {categories.map(cat => (
            <label key={cat._id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="category" value={cat.slug} checked={filters.category === cat.slug}
                onChange={() => setFilter('category', cat.slug)} className="accent-primary-500" />
              <span className="text-[var(--text-secondary)] hover:text-primary-500">{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Price Range</h4>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice}
            onChange={e => setFilter('minPrice', e.target.value)}
            className="input-field text-sm py-2 px-3" />
          <input type="number" placeholder="Max" value={filters.maxPrice}
            onChange={e => setFilter('maxPrice', e.target.value)}
            className="input-field text-sm py-2 px-3" />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[['0','500'],['500','2000'],['2000','10000'],['10000','']].map(([min,max], i) => (
            <button key={i} onClick={() => { setFilter('minPrice', min); setFilter('maxPrice', max); }}
              className="text-xs px-2.5 py-1 rounded-lg border border-[var(--border)] hover:border-primary-400 hover:text-primary-500 transition-colors">
              {max ? `₹${Number(min).toLocaleString()}-₹${Number(max).toLocaleString()}` : `₹${Number(min).toLocaleString()}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm mb-3">Min Rating</h4>
        <div className="space-y-2">
          {[4, 3, 2, 1].map(r => (
            <label key={r} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="radio" name="rating" value={r} checked={filters.rating === String(r)}
                onChange={() => setFilter('rating', r)} className="accent-primary-500" />
              <div className="flex items-center gap-1">
                {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                <span className="text-[var(--text-muted)] ml-1">& up</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Brand */}
      {brands.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-3">Brand</h4>
          <div className="flex flex-wrap gap-2">
            {brands.slice(0, 10).map(b => (
              <button key={b} onClick={() => setFilter('brand', filters.brand === b ? '' : b)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${filters.brand === b
                  ? 'bg-primary-500 text-white border-primary-500' : 'border-[var(--border)] hover:border-primary-400 hover:text-primary-500'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full py-2 rounded-xl border border-red-300 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
          Clear All Filters ({activeFilterCount})
        </button>
      )}
    </div>
  );

  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="section-title">
            {searchParams.get('q') ? `Results for "${searchParams.get('q')}"` :
             searchParams.get('category') ? searchParams.get('category').replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) :
             'All Products'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">{pagination.total} products found</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:border-primary-400 hover:text-primary-500 transition-colors lg:hidden">
            <SlidersHorizontal size={16} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
            className="input-field py-2 text-sm w-auto cursor-pointer">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="flex gap-1 border border-[var(--border)] rounded-xl p-1">
            <button onClick={() => setGridView(true)} className={`p-1.5 rounded-lg transition-colors ${gridView ? 'bg-primary-500 text-white' : 'hover:bg-[var(--bg-secondary)]'}`}>
              <Grid3X3 size={14} />
            </button>
            <button onClick={() => setGridView(false)} className={`p-1.5 rounded-lg transition-colors ${!gridView ? 'bg-primary-500 text-white' : 'hover:bg-[var(--bg-secondary)]'}`}>
              <LayoutList size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - desktop */}
        <aside className="w-60 flex-shrink-0 hidden lg:block">
          <div className="sticky top-24 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold">Filters</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">{activeFilterCount} active</button>
              )}
            </div>
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile filters drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFiltersOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />
              <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28 }}
                className="fixed left-0 top-0 h-full w-72 z-50 bg-[var(--bg-primary)] border-r border-[var(--border)] p-6 overflow-y-auto lg:hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-lg">Filters</h3>
                  <button onClick={() => setFiltersOpen(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]"><X size={18} /></button>
                </div>
                <FilterSidebar />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className={`grid gap-4 ${gridView ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-semibold text-xl mb-2">No products found</h3>
              <p className="text-[var(--text-muted)] mb-6">Try adjusting your filters or search query</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${gridView ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button disabled={filters.page <= 1} onClick={() => setFilter('page', filters.page - 1)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm disabled:opacity-40 hover:border-primary-400 hover:text-primary-500 transition-colors">
                    ← Prev
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === pagination.pages || Math.abs(p - filters.page) <= 1)
                      return (
                        <button key={p} onClick={() => setFilter('page', p)}
                          className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${filters.page === p
                            ? 'bg-primary-500 text-white' : 'border border-[var(--border)] hover:border-primary-400 hover:text-primary-500'}`}>
                          {p}
                        </button>
                      );
                    if (Math.abs(p - filters.page) === 2) return <span key={p} className="text-[var(--text-muted)]">…</span>;
                    return null;
                  })}
                  <button disabled={filters.page >= pagination.pages} onClick={() => setFilter('page', filters.page + 1)}
                    className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm disabled:opacity-40 hover:border-primary-400 hover:text-primary-500 transition-colors">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
