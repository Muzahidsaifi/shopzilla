import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, MapPin, CreditCard, ArrowLeft, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUSES } from '../../utils/helpers';
import toast from 'react-hot-toast';

const TRACKING_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: '📝', desc: 'Your order has been received' },
  { status: 'confirmed', label: 'Confirmed', icon: '✅', desc: 'Seller confirmed your order' },
  { status: 'processing', label: 'Processing', icon: '⚙️', desc: 'Order is being prepared' },
  { status: 'shipped', label: 'Shipped', icon: '🚚', desc: 'Order is on its way' },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: '📦', desc: 'Arriving today!' },
  { status: 'delivered', label: 'Delivered', icon: '🎉', desc: 'Order delivered successfully' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      setOrder(res.data.order);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cannot cancel this order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/>
    </div>
  );

  if (!order) return (
    <div className="page-container py-12 text-center">
      <p className="text-[var(--text-secondary)]">Order not found.</p>
      <Link to="/account/orders" className="btn-primary mt-4 inline-flex">Back to Orders</Link>
    </div>
  );

  const currentStatusIdx = TRACKING_STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = !['shipped','out_for_delivery','delivered','cancelled'].includes(order.status);

  return (
    <div className="page-container py-8 max-w-3xl">
      <Link to="/account/orders" className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft size={14}/> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Order Details</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-mono">{order.orderId}</p>
        </div>
        <span className={`badge badge-${ORDER_STATUSES[order.status]?.color || 'info'} text-sm px-3 py-1`}>
          {ORDER_STATUSES[order.status]?.label || order.status}
        </span>
      </div>

      <div className="space-y-4">
        {/* Tracking Timeline */}
        {!isCancelled ? (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-5 flex items-center gap-2">
              <Clock size={16} className="text-primary-500"/> Order Tracking
            </h3>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--border)]"/>
              <div className="absolute left-4 top-4 w-0.5 bg-emerald-500 transition-all duration-500"
                style={{ height: `${currentStatusIdx >= 0 ? (currentStatusIdx / (TRACKING_STEPS.length - 1)) * 100 : 0}%` }}/>

              <div className="space-y-5 relative">
                {TRACKING_STEPS.map((step, i) => {
                  const isDone = i <= currentStatusIdx;
                  const isCurrent = i === currentStatusIdx;
                  const historyEntry = order.statusHistory?.find(h => h.status === step.status);
                  return (
                    <motion.div
                      key={step.status}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-4 pl-0"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 border-2 transition-all ${
                        isDone ? 'bg-emerald-500 border-emerald-500 text-white' :
                        isCurrent ? 'bg-primary-500 border-primary-500 text-white animate-pulse-glow' :
                        'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-muted)]'
                      }`}>
                        {isDone ? '✓' : i + 1}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-semibold text-sm ${isDone ? '' : 'text-[var(--text-muted)]'}`}>
                            {step.icon} {step.label}
                          </span>
                          {isCurrent && <span className="badge badge-primary text-[10px]">Current</span>}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDone ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>
                          {historyEntry?.message || step.desc}
                        </p>
                        {historyEntry?.timestamp && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {formatDate(historyEntry.timestamp)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6 border-2 border-red-200 dark:border-red-900">
            <div className="flex items-center gap-3 text-red-500">
              <XCircle size={24}/>
              <div>
                <p className="font-semibold">Order Cancelled</p>
                <p className="text-sm text-[var(--text-secondary)]">This order was cancelled.</p>
              </div>
            </div>
          </div>
        )}

        {/* Items */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package size={16} className="text-primary-500"/> Items ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl">
                <img src={item.image || `https://placehold.co/56x56/f97316/white?text=P`}
                  alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
                  {item.variant && <p className="text-xs text-[var(--text-muted)]">{item.variant.name}: {item.variant.value}</p>}
                  <p className="text-xs text-[var(--text-muted)]">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <p className="font-bold text-primary-500 text-sm flex-shrink-0">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Address + Payment */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <MapPin size={14} className="text-primary-500"/> Delivery Address
            </h3>
            <p className="font-semibold text-sm">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-[var(--text-secondary)]">{order.shippingAddress.phone}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {order.shippingAddress.street}, {order.shippingAddress.city},<br/>
              {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </p>
          </div>
          <div className="glass-card p-5">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
              <CreditCard size={14} className="text-primary-500"/> Payment Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Method</span><span className="font-semibold uppercase">{order.payment.method}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Status</span>
                <span className={`badge ${order.payment.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.payment.status}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-[var(--border)]">
                <span>Total</span>
                <span className="text-primary-500">{formatPrice(order.pricing.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel button */}
        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling}
            className="w-full py-3 rounded-xl border-2 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 font-semibold text-sm transition-all flex items-center justify-center gap-2">
            {cancelling ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"/> : <XCircle size={16}/>}
            Cancel Order
          </button>
        )}
      </div>
    </div>
  );
}
