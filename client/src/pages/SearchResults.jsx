// SearchResults.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    api.get(`/products?search=${encodeURIComponent(q)}&limit=24`)
      .then(res => { setProducts(res.data.products); setTotal(res.data.pagination.total); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="page-container py-10">
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl mb-1">
          {q ? `Search results for "${q}"` : 'Search'}
        </h1>
        {!loading && <p className="text-[var(--text-secondary)] text-sm">{total} products found</p>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.length > 0
            ? products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)
            : (
              <div className="col-span-full text-center py-20">
                <Search size={48} className="mx-auto text-[var(--text-muted)] mb-4 opacity-30" />
                <h3 className="font-display font-bold text-xl mb-2">No results found</h3>
                <p className="text-[var(--text-secondary)]">Try different keywords or browse our categories</p>
              </div>
            )
        }
      </div>
    </div>
  );
}
