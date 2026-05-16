import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag } from 'lucide-react';
import { setCartOpen } from '../../store/slices/uiSlice';
import { removeFromCart, updateQuantity, selectCartItems, selectCartSubtotal } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils/helpers';

export default function CartDrawer({ open }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const coupon = useSelector(s => s.cart.coupon);

  const close = () => dispatch(setCartOpen(false));

  const handleCheckout = () => {
    close();
    navigate('/checkout');
  };

  const shipping = subtotal >= 499 ? 0 : 49;
  const discount = coupon?.discount || 0;
  const total = subtotal + shipping - discount;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={close}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[var(--bg-primary)] shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-primary-500" />
                <span className="font-display font-bold text-lg">My Cart</span>
                <span className="badge badge-primary ml-1">{items.length}</span>
              </div>
              <button onClick={close} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <ShoppingCart size={36} className="text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Add items to get started</p>
                  </div>
                  <button onClick={() => { close(); navigate('/products'); }} className="btn-primary">
                    Browse Products
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={`${item._id}-${item.variant?.value}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]"
                    >
                      <img
                        src={item.images?.[0]?.url || `https://placehold.co/80x80/f97316/white?text=${item.name?.slice(0,2)}`}
                        alt={item.name}
                        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-2 leading-snug">{item.name}</p>
                        {item.variant && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">{item.variant.name}: {item.variant.value}</p>
                        )}
                        <p className="text-primary-500 font-bold mt-1">{formatPrice(item.price)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => dispatch(updateQuantity({ _id: item._id, variant: item.variant, quantity: item.quantity - 1 }))}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => dispatch(updateQuantity({ _id: item._id, variant: item.variant, quantity: item.quantity + 1 }))}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-primary)] flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            onClick={() => dispatch(removeFromCart({ _id: item._id, variant: item.variant }))}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--border)] px-6 py-5 space-y-4 bg-[var(--bg-secondary)]">
                {coupon && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl px-3 py-2">
                    <Tag size={14} />
                    <span>Coupon <strong>{coupon.code}</strong> applied! -₹{coupon.discount}</span>
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount</span><span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
                    <span>Total</span>
                    <span className="text-primary-500">{formatPrice(total)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
                <Link to="/cart" onClick={close} className="block text-center text-sm text-[var(--text-secondary)] hover:text-primary-500 transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
