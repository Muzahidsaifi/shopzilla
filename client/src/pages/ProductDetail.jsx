import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, Minus, Plus, Share2, ChevronRight, Check } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlistItem } from '../store/slices/wishlistSlice';
import api from '../utils/api';
import ProductCard from '../components/product/ProductCard';
import ProductCardSkeleton from '../components/product/ProductCardSkeleton';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const wishlist = useSelector(s => s.wishlist.items);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [tab, setTab] = useState('description');
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`).then(r => {
      setProduct(r.data.product);
      setRelated(r.data.related || []);
      setLoading(false);
    }).catch(() => { setLoading(false); navigate('/404'); });
  }, [slug]);

  const isWishlisted = wishlist.includes(product?._id);

  const handleWishlist = async () => {
    if (!user) { toast.error('Please login first'); return; }
    dispatch(toggleWishlistItem(product._id));
    try { await api.post(`/wishlist/toggle/${product._id}`); } catch {}
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ ...product, quantity: qty, variant: Object.keys(selectedVariant).length ? selectedVariant : undefined }));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    if (!review.comment.trim()) { toast.error('Please write a review'); return; }
    setSubmitting(true);
    try {
      await api.post(`/products/${product._id}/reviews`, review);
      toast.success('Review submitted!');
      const r = await api.get(`/products/${slug}`);
      setProduct(r.data.product);
      setReview({ rating: 5, comment: '' });
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="page-container py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <div className="aspect-square skeleton rounded-2xl" />
          <div className="flex gap-2">{[...Array(4)].map((_,i)=><div key={i} className="w-16 h-16 skeleton rounded-xl"/>)}</div>
        </div>
        <div className="space-y-4 pt-6">{[...Array(6)].map((_,i)=><div key={i} className={`h-${4+i%3*2} skeleton rounded-xl`}/>)}</div>
      </div>
    </div>
  );

  if (!product) return null;

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link to="/" className="hover:text-primary-500">Home</Link>
        <ChevronRight size={14} />
        <Link to="/products" className="hover:text-primary-500">Products</Link>
        <ChevronRight size={14} />
        {product.category && <Link to={`/products?category=${product.category.slug}`} className="hover:text-primary-500">{product.category.name}</Link>}
        <ChevronRight size={14} />
        <span className="text-[var(--text-primary)] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Images */}
        <div>
          <motion.div className="aspect-square rounded-2xl overflow-hidden bg-[var(--bg-secondary)] mb-3 relative group"
            layoutId={`product-${product._id}`}>
            <img src={product.images?.[activeImg]?.url || `https://placehold.co/600x600/f97316/white?text=${product.name[0]}`}
              alt={product.name} className="w-full h-full object-cover" />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-primary-500 text-white font-bold px-3 py-1.5 rounded-xl text-sm shadow-glow">
                -{discount}% OFF
              </div>
            )}
          </motion.div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary-500' : 'border-[var(--border)] hover:border-primary-300'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="py-2">
          {product.brand && <p className="text-sm font-semibold text-primary-500 uppercase tracking-wider mb-2">{product.brand}</p>}
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className={i <= Math.round(product.rating) ? 'star-filled' : 'star-empty'} />
              ))}
            </div>
            <span className="font-semibold">{product.rating.toFixed(1)}</span>
            <span className="text-[var(--text-muted)] text-sm">({product.numReviews} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-5 p-4 rounded-2xl bg-[var(--bg-secondary)]">
            <span className="font-display text-3xl font-bold text-primary-500">{formatPrice(product.price)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="text-lg text-[var(--text-muted)] line-through">{formatPrice(product.originalPrice)}</span>
                <span className="badge bg-primary-100 text-primary-700 dark:bg-primary-950 dark:text-primary-400 text-sm font-bold">Save {discount}%</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className={`inline-flex items-center gap-1.5 mb-5 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {product.stock > 0 ? (product.stock <= 10 ? `Only ${product.stock} left!` : 'In Stock') : 'Out of Stock'}
          </div>

          {/* Variants */}
          {product.variants?.map(variant => (
            <div key={variant.name} className="mb-4">
              <p className="text-sm font-semibold mb-2">{variant.name}: <span className="text-primary-500">{selectedVariant[variant.name] || 'Select'}</span></p>
              <div className="flex flex-wrap gap-2">
                {variant.options?.map(opt => (
                  <button key={opt.value} onClick={() => setSelectedVariant(prev => ({ ...prev, [variant.name]: opt.value }))}
                    disabled={opt.stock === 0}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed
                      ${selectedVariant[variant.name] === opt.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-600' : 'border-[var(--border)] hover:border-primary-300'}`}>
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-[var(--border)] rounded-xl overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors"><Minus size={16} /></button>
              <span className="px-5 py-3 font-semibold text-lg border-x border-[var(--border)]">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-4 py-3 hover:bg-[var(--bg-secondary)] transition-colors"><Plus size={16} /></button>
            </div>
            <span className="text-sm text-[var(--text-muted)]">Max: {product.stock}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <motion.button onClick={handleAddToCart} disabled={product.stock === 0}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all
                ${added ? 'bg-emerald-500 text-white' : 'btn-primary'} disabled:opacity-40 disabled:cursor-not-allowed`}>
              {added ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
            </motion.button>
            <button onClick={handleWishlist}
              className={`p-4 rounded-2xl border-2 transition-all ${isWishlisted ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-500' : 'border-[var(--border)] hover:border-primary-400'}`}>
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Truck size={16} />, text: product.freeShipping ? 'Free Delivery' : 'Fast Delivery' },
              { icon: <Shield size={16} />, text: 'Secure Pay' },
              { icon: <RefreshCw size={16} />, text: '30d Returns' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[var(--bg-secondary)] text-center">
                <span className="text-primary-500">{f.icon}</span>
                <span className="text-xs text-[var(--text-secondary)] font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12">
        <div className="flex gap-1 border-b border-[var(--border)] mb-6">
          {['description', 'specifications', 'reviews'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors relative ${tab === t
                ? 'text-primary-500' : 'text-[var(--text-secondary)] hover:text-primary-400'}`}>
              {t} {t === 'reviews' && `(${product.numReviews})`}
              {tab === t && <motion.div layoutId="tabline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {tab === 'description' && (
              <div className="prose dark:prose-invert max-w-none text-[var(--text-secondary)] leading-relaxed">
                <p>{product.description}</p>
              </div>
            )}
            {tab === 'specifications' && (
              <div className="max-w-xl">
                {product.specifications?.length > 0 ? (
                  <table className="w-full text-sm">
                    <tbody>
                      {product.specifications.map((s, i) => (
                        <tr key={i} className={`${i % 2 === 0 ? 'bg-[var(--bg-secondary)]' : ''}`}>
                          <td className="py-3 px-4 font-semibold text-[var(--text-secondary)] w-40 rounded-l-lg">{s.key}</td>
                          <td className="py-3 px-4 rounded-r-lg">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p className="text-[var(--text-muted)]">No specifications available.</p>}
              </div>
            )}
            {tab === 'reviews' && (
              <div className="space-y-6">
                {/* Review form */}
                {user && (
                  <form onSubmit={handleReview} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <h3 className="font-semibold mb-4">Write a Review</h3>
                    <div className="flex gap-2 mb-4">
                      {[1,2,3,4,5].map(r => (
                        <button key={r} type="button" onClick={() => setReview(prev => ({ ...prev, rating: r }))}>
                          <Star size={24} className={r <= review.rating ? 'star-filled' : 'star-empty'} />
                        </button>
                      ))}
                    </div>
                    <textarea value={review.comment} onChange={e => setReview(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Share your experience..." rows={4} className="input-field resize-none mb-3" />
                    <button type="submit" disabled={submitting} className="btn-primary">
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
                {product.reviews?.length === 0 ? (
                  <div className="text-center py-12 text-[var(--text-muted)]">
                    <Star size={40} className="mx-auto mb-3 opacity-30" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  product.reviews.map(r => (
                    <div key={r._id} className="p-5 rounded-2xl bg-[var(--bg-secondary)]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {r.name?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-xs text-[var(--text-muted)]">{formatDate(r.createdAt)}</span>
                          </div>
                          <div className="flex gap-0.5 my-1">
                            {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i<=r.rating?'star-filled':'star-empty'}/>)}
                          </div>
                          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <h2 className="section-title mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {related.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      )}
    </div>
  );
}
