import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { setWishlist, toggleWishlistItem } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';
import api from '../../utils/api';
import ProductCard from '../../components/product/ProductCard';
import ProductCardSkeleton from '../../components/product/ProductCardSkeleton';

export default function Wishlist() {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => {
      setProducts(r.data.wishlist || []);
      dispatch(setWishlist(r.data.wishlist?.map(p => p._id) || []));
      setLoading(false);
    }).catch(()=>setLoading(false));
  }, []);

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title flex items-center gap-2"><Heart size={24} className="text-primary-500"/>Wishlist <span className="text-[var(--text-muted)] text-lg font-normal">({products.length})</span></h1>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">{[...Array(4)].map((_,i)=><ProductCardSkeleton key={i}/>)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto mb-4 text-[var(--text-muted)]"/>
          <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
          <p className="text-[var(--text-muted)] mb-6">Save products you love to your wishlist</p>
          <Link to="/products" className="btn-primary">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p, i) => <ProductCard key={p._id} product={p} index={i}/>)}
        </div>
      )}
    </div>
  );
}
