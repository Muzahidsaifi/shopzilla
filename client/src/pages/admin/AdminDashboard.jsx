import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp, ShoppingBag, Users, Package,
  AlertTriangle, ArrowUp, ArrowDown, Clock, CheckCircle
} from 'lucide-react';
import api from '../../utils/api';
import { formatPrice, formatDate } from '../../utils/helpers';

const StatCard = ({ title, value, sub, icon, color, growth, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="glass-card p-5">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      {growth !== undefined && (
        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg
          ${parseFloat(growth) >= 0 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'}`}>
          {parseFloat(growth) >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(growth)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-[var(--text-secondary)] mt-1">{title}</p>
    {sub && <p className="text-xs text-[var(--text-muted)] mt-0.5">{sub}</p>}
  </motion.div>
);

const STATUS_COLORS = {
  pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info',
  shipped: 'badge-info', out_for_delivery: 'badge-primary',
  delivered: 'badge-success', cancelled: 'badge-danger'
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { stats, recentOrders, topProducts, lowStockProducts, ordersByStatus, revenueTrend } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl">Dashboard</h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">Welcome back, Admin! Here's what's happening.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (This Month)" value={formatPrice(stats?.revenue?.current || 0)}
          sub={`Last month: ${formatPrice(stats?.revenue?.previous || 0)}`}
          icon={<TrendingUp size={22} className="text-white" />}
          color="bg-gradient-to-br from-primary-500 to-primary-600"
          growth={stats?.revenue?.growth} delay={0} />
        <StatCard title="Total Orders" value={stats?.totalOrders || 0}
          sub={`${stats?.pendingOrders} pending`}
          icon={<ShoppingBag size={22} className="text-white" />}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          growth={stats?.ordersGrowth} delay={0.1} />
        <StatCard title="Total Users" value={stats?.totalUsers || 0}
          sub="Registered customers"
          icon={<Users size={22} className="text-white" />}
          color="bg-gradient-to-br from-violet-500 to-violet-600"
          delay={0.2} />
        <StatCard title="Products" value={stats?.totalProducts || 0}
          sub={`${lowStockProducts?.length || 0} low stock`}
          icon={<Package size={22} className="text-white" />}
          color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          delay={0.3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="xl:col-span-2 glass-card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold flex items-center gap-2"><Clock size={16} className="text-primary-500" /> Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs text-primary-500 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[var(--text-muted)] text-xs border-b border-[var(--border)]">
                  <th className="pb-2 text-left font-medium">Order ID</th>
                  <th className="pb-2 text-left font-medium">Customer</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentOrders?.map(order => (
                  <tr key={order._id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="py-3">
                      <Link to={`/admin/orders`} className="font-mono text-xs text-primary-500 hover:underline">
                        {order.orderId}
                      </Link>
                    </td>
                    <td className="py-3">
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{order.user?.email}</p>
                    </td>
                    <td className="py-3">
                      <span className={`badge text-[10px] ${STATUS_COLORS[order.status] || 'badge-info'}`}>
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold">{formatPrice(order.pricing?.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Order by status */}
          <div className="glass-card p-5">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><CheckCircle size={16} className="text-primary-500" /> Orders by Status</h2>
            <div className="space-y-2">
              {ordersByStatus?.map(({ _id, count }) => (
                <div key={_id} className="flex items-center justify-between">
                  <span className={`badge text-[10px] ${STATUS_COLORS[_id] || 'badge-info'}`}>{_id?.replace(/_/g,' ')}</span>
                  <span className="font-bold text-sm">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Low stock */}
          {lowStockProducts?.length > 0 && (
            <div className="glass-card p-5 border-l-4 border-amber-500">
              <h2 className="font-semibold mb-3 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={16} /> Low Stock Alert
              </h2>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 5).map(p => (
                  <div key={p._id} className="flex items-center justify-between text-sm">
                    <span className="truncate text-[var(--text-secondary)]">{p.name}</span>
                    <span className={`font-bold ml-2 ${p.stock <= 5 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/admin/products" className="text-xs text-primary-500 hover:underline mt-2 block">
                Manage inventory →
              </Link>
            </div>
          )}

          {/* Top products */}
          <div className="glass-card p-5">
            <h2 className="font-semibold mb-3 text-sm">🔥 Top Selling Products</h2>
            <div className="space-y-3">
              {topProducts?.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-[var(--text-muted)] w-5">#{i + 1}</span>
                  <img src={p.images?.[0]?.url || 'https://placehold.co/36'} alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[var(--border)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.sold} sold</p>
                  </div>
                  <span className="text-xs font-semibold text-primary-500">{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
