import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, MapPin, Clock, ShoppingBag, Home, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import { formatPrice, formatDate } from '../utils/helpers';

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="page-container py-12 max-w-2xl">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle size={48} className="text-white" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display text-3xl font-bold text-emerald-500 mb-2"
        >
          Order Placed! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[var(--text-secondary)]"
        >
          Thank you! Your order has been confirmed. A confirmation email has been sent to you.
        </motion.p>
      </motion.div>

      {order && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {/* Order ID */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-muted)]">Order ID</span>
              <span className="font-mono font-bold text-primary-500 text-sm">{order.orderId}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-muted)]">Order Date</span>
              <span className="text-sm font-semibold">{formatDate(order.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[var(--text-muted)]">Payment</span>
              <span className={`badge ${order.payment.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                {order.payment.method.toUpperCase()} — {order.payment.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-muted)]">Estimated Delivery</span>
              <span className="text-sm font-semibold text-emerald-500">{formatDate(order.estimatedDelivery)}</span>
            </div>
          </div>

          {/* Items */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Package size={16} className="text-primary-500"/> Order Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img
                    src={item.image || `https://placehold.co/50x50/f97316/white?text=${item.name?.slice(0,2)}`}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-bold text-primary-500 flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary-500"/> Delivery Address
            </h3>
            <p className="text-sm font-semibold">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-[var(--text-secondary)]">{order.shippingAddress.phone}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </p>
          </div>

          {/* Price Summary */}
          <div className="glass-card p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span><span>{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax</span><span>{formatPrice(order.pricing.tax)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span className={order.pricing.shippingCost === 0 ? 'text-emerald-500' : ''}>
                  {order.pricing.shippingCost === 0 ? 'FREE' : formatPrice(order.pricing.shippingCost)}
                </span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <span>Discount</span><span>-{formatPrice(order.pricing.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t border-[var(--border)]">
                <span>Total Paid</span>
                <span className="text-primary-500">{formatPrice(order.pricing.total)}</span>
              </div>
            </div>
          </div>

          {/* Order Tracking steps */}
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Clock size={16} className="text-primary-500"/> Order Status
            </h3>
            {[
              { status: 'pending', label: 'Order Placed', icon: '📝' },
              { status: 'confirmed', label: 'Confirmed', icon: '✅' },
              { status: 'processing', label: 'Processing', icon: '⚙️' },
              { status: 'shipped', label: 'Shipped', icon: '🚚' },
              { status: 'out_for_delivery', label: 'Out for Delivery', icon: '📦' },
              { status: 'delivered', label: 'Delivered', icon: '🎉' },
            ].map((s, i) => {
              const statuses = ['pending','confirmed','processing','shipped','out_for_delivery','delivered'];
              const currentIdx = statuses.indexOf(order.status);
              const isDone = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={s.status} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    isDone ? 'bg-emerald-500 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                  } ${isCurrent ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
                    {isDone ? '✓' : s.icon}
                  </div>
                  <span className={`text-sm ${isDone ? 'font-semibold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                    {s.label}
                  </span>
                  {isCurrent && <span className="badge badge-primary text-[10px]">Current</span>}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link to="/account/orders" className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ShoppingBag size={16}/> My Orders
            </Link>
            <Link to="/" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Home size={16}/> Continue Shopping
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
