import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled'];
const STATUS_COLORS = {
  pending:'badge-warning', confirmed:'badge-info', processing:'badge-info',
  shipped:'badge-info', out_for_delivery:'badge-primary', delivered:'badge-success', cancelled:'badge-danger'
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updating, setUpdating] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (filter) params.set('status', filter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.orders);
      setTotal(res.data.total);
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating('');
    }
  };

  const filteredOrders = orders.filter(o =>
    !search || o.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Orders</h1>
          <p className="text-sm text-[var(--text-secondary)]">{total} total orders</p>
        </div>
        <button onClick={fetchOrders} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..." className="input-field pl-9 py-2 text-sm" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
          className="input-field py-2 text-sm w-auto">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ').toUpperCase()}</option>)}
        </select>
      </div>

      {/* Orders table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <tr className="text-[var(--text-muted)] text-xs">
                <th className="px-4 py-3 text-left font-medium">Order ID</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-4 py-4">
                    <div className="h-4 skeleton rounded w-full" />
                  </td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-[var(--text-muted)]">No orders found</td></tr>
              ) : filteredOrders.map(order => (
                <>
                  <motion.tr key={order._id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary-500 font-bold">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="badge badge-info">{order.items?.length}</span>
                    </td>
                    <td className="px-4 py-3 font-bold">{formatPrice(order.pricing?.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${STATUS_COLORS[order.status]}`}>
                        {order.status?.replace(/_/g,' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={e => { e.stopPropagation(); updateStatus(order._id, e.target.value); }}
                        disabled={updating === order._id || order.status === 'cancelled' || order.status === 'delivered'}
                        onClick={e => e.stopPropagation()}
                        className="input-field py-1 text-xs w-36"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                      </select>
                    </td>
                  </motion.tr>
                  {/* Expanded row */}
                  {expandedOrder === order._id && (
                    <tr key={`${order._id}-exp`} className="bg-[var(--bg-secondary)]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold mb-2 text-xs text-[var(--text-muted)] uppercase">Items</p>
                            {order.items?.map((item, i) => (
                              <div key={i} className="flex justify-between py-1">
                                <span className="text-[var(--text-secondary)]">{item.name} × {item.quantity}</span>
                                <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="font-semibold mb-2 text-xs text-[var(--text-muted)] uppercase">Delivery Address</p>
                            <p>{order.shippingAddress?.fullName}</p>
                            <p className="text-[var(--text-secondary)] text-xs">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            <p className="text-[var(--text-muted)] text-xs mt-1">📞 {order.shippingAddress?.phone}</p>
                            <p className="mt-2">Payment: <span className="font-semibold capitalize">{order.payment?.method}</span> — <span className={order.payment?.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>{order.payment?.status}</span></p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm px-3 py-1.5">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-[var(--text-secondary)]">Page {page} of {Math.ceil(total / 15)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 15)} className="btn-ghost text-sm px-3 py-1.5">Next →</button>
        </div>
      )}
    </div>
  );
}
