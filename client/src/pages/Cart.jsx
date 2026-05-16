import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag, X } from 'lucide-react';
import { removeFromCart, updateQuantity, selectCartItems, selectCartSubtotal, applyCoupon, removeCoupon } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/helpers';
import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const coupon = useSelector(s => s.cart.coupon);
  const { user } = useSelector(s => s.auth);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const discount = coupon?.discount || 0;
  const shipping = subtotal >= 499 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + tax + shipping - discount;

  const handleCoupon = async () => {
    if (!user) { toast.error('Please login to apply coupon'); return; }
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const r = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      dispatch(applyCoupon({ code: r.data.coupon.code, discount: r.data.discount }));
      setCouponCode('');
    } catch (e) { toast.error(e.response?.data?.error || 'Invalid coupon'); }
    setCouponLoading(false);
  };

  if (items.length === 0) return (
    <div className="page-container py-20 text-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="w-28 h-28 rounded-3xl bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-6">
          <ShoppingCart size={48} className="text-[var(--text-muted)]" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-[var(--text-muted)] mb-8">Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">Browse Products <ArrowRight size={16}/></Link>
      </motion.div>
    </div>
  );

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">Shopping Cart <span className="text-[var(--text-muted)] text-xl font-normal">({items.reduce((a,i)=>a+i.quantity,0)} items)</span></h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence>
            {items.map(item => (
              <motion.div key={`${item._id}-${item.variant?.value}`} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                <img src={item.images?.[0]?.url || `https://placehold.co/100x100/f97316/white?text=${item.name?.[0]}`}
                  alt={item.name} className="w-24 h-24 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-semibold hover:text-primary-500 transition-colors line-clamp-2">{item.name}</Link>
                  {item.variant && <p className="text-sm text-[var(--text-muted)] mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => dispatch(updateQuantity({ _id: item._id, variant: item.variant, quantity: item.quantity - 1 }))}
                        className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center hover:bg-primary-50 hover:text-primary-500 transition-colors border border-[var(--border)]">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button onClick={() => dispatch(updateQuantity({ _id: item._id, variant: item.variant, quantity: item.quantity + 1 }))}
                        className="w-8 h-8 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center hover:bg-primary-50 hover:text-primary-500 transition-colors border border-[var(--border)]">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary-500">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => dispatch(removeFromCart(item))} className="p-2 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag size={16} className="text-primary-500" />Coupon Code</h3>
            {coupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{coupon.code} — saved {formatPrice(discount)}</span>
                <button onClick={() => dispatch(removeCoupon())} className="text-emerald-600 hover:text-red-500 transition-colors"><X size={16}/></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                  placeholder="Enter coupon code" className="input-field text-sm flex-1" />
                <button onClick={handleCoupon} disabled={couponLoading} className="btn-primary px-4 py-2 text-sm whitespace-nowrap">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]"><span>Subtotal ({items.reduce((a,i)=>a+i.quantity,0)} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[var(--text-secondary)]"><span>Tax (GST 18%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {discount > 0 && <div className="flex justify-between text-emerald-500 font-semibold"><span>Coupon Discount</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-3 border-t border-[var(--border)]">
                <span>Total</span><span className="text-primary-500">{formatPrice(total)}</span>
              </div>
            </div>
            {subtotal < 499 && (
              <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-xs text-center">
                Add {formatPrice(499 - subtotal)} more for <strong>FREE shipping!</strong>
              </div>
            )}
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="block text-center text-sm text-[var(--text-muted)] hover:text-primary-500 mt-3 transition-colors">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
