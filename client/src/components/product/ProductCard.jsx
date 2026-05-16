import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Zap } from 'lucide-react';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlistItem } from '../../store/slices/wishlistSlice';
import { formatPrice } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const dispatch = useDispatch();
  const wishlist = useSelector(s => s.wishlist.items);
  const { user } = useSelector(s => s.auth);
  const isWishlisted = wishlist.includes(product._id);
  const [imageIdx, setImageIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add to wishlist'); return; }
    dispatch(toggleWishlistItem(product._id));
    try {
      await api.post(`/wishlist/toggle/${product._id}`);
    } catch (err) {
      dispatch(toggleWishlistItem(product._id)); // revert
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) { toast.error('Out of stock'); return; }
    dispatch(addToCart({ ...product, quantity: 1 }));
  };

  const discount = product.discount || 
    (product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="product-card group"
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image */}
        <div className="relative overflow-hidden bg-[var(--bg-secondary)] aspect-square">
          <img
            src={product.images?.[imageIdx]?.url || `https://placehold.co/400x400/f97316/white?text=${encodeURIComponent(product.name?.slice(0,2))}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onMouseEnter={() => product.images?.length > 1 && setImageIdx(1)}
            onMouseLeave={() => setImageIdx(0)}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {discount > 0 && (
              <span className="badge bg-primary-500 text-white text-[10px] font-bold shadow-sm">
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="badge bg-gray-700 text-white text-[10px]">Out of Stock</span>
            )}
            {product.freeShipping && (
              <span className="badge bg-emerald-500 text-white text-[10px]">Free Ship</span>
            )}
          </div>

          {/* Action buttons overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-all ${
                isWishlisted ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-500'
              }`}
            >
              <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <Link
              to={`/products/${product.slug}`}
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md text-gray-600 hover:text-primary-500 hover:bg-primary-50 transition-all"
            >
              <Eye size={14} />
            </Link>
          </div>

          {/* Thumbnail dots */}
          {product.images?.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {product.images.slice(0, 4).map((_, i) => (
                <button
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === imageIdx ? 'bg-primary-500 w-3' : 'bg-white/70'}`}
                  onClick={(e) => { e.preventDefault(); setImageIdx(i); }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={11} className={i <= Math.round(product.rating) ? 'star-filled' : 'star-empty'} />
              ))}
            </div>
            <span className="text-xs text-[var(--text-muted)]">({product.numReviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-bold text-[var(--text-primary)]">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[var(--text-muted)] line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-secondary)] hover:bg-primary-500 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed group/btn"
          >
            <ShoppingCart size={14} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
