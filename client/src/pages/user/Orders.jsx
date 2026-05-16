import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Search } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate, ORDER_STATUSES } from '../../utils/helpers';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    api.get(`/orders/my-orders${status ? `?status=${status}` : ''}`)
      .then(r => { setOrders(r.data.orders); setLoading(false); })
      .catch(() => setLoading(false));
  }, [status]);

  return (
    <div className="page-container py-10 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">My Orders</h1>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field w-auto text-sm">
          <option value="">All Orders</option>
          {Object.entries(ORDER_STATUSES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      {loading ? (
        <div className="space-y-4">{[...Array(3)].map((_,i)=><div key={i} className="h-28 skeleton rounded-2xl"/>)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h3 className="font-semibold text-lg mb-2">No orders yet</h3>
          <p className="text-[var(--text-muted)] mb-6">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: 'info' };
            return (
              <motion.div key={order._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-primary-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-primary-500">{order.orderId}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge badge-${statusInfo.color}`}>{statusInfo.label}</span>
                    <span className="font-bold text-primary-500">{formatPrice(order.pricing?.total)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {order.items?.slice(0,3).map((item, j) => (
                      <img key={j} src={item.image || `https://placehold.co/40x40/f97316/white?text=${item.name?.[0]}`}
                        alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-[var(--border)]" />
                    ))}
                    {order.items?.length > 3 && <span className="text-xs text-[var(--text-muted)] font-semibold">+{order.items.length-3} more</span>}
                  </div>
                  <Link to={`/account/orders/${order._id}`} className="flex items-center gap-1 text-sm text-primary-500 font-semibold hover:underline">
                    View Details <ChevronRight size={14}/>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
