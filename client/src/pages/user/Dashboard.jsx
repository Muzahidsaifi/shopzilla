import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, Heart, User, MapPin, ShoppingBag } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

export default function Dashboard() {
  const { user } = useSelector(s => s.auth);
  const wishlistCount = useSelector(s => s.wishlist.items.length);

  const links = [
    { icon: <Package size={24}/>, label: 'My Orders', desc: 'Track and manage orders', to: '/account/orders', color: 'from-blue-400 to-blue-600' },
    { icon: <Heart size={24}/>, label: 'Wishlist', desc: `${wishlistCount} saved items`, to: '/account/wishlist', color: 'from-pink-400 to-rose-500' },
    { icon: <User size={24}/>, label: 'Profile', desc: 'Update your details', to: '/account/profile', color: 'from-purple-400 to-accent-500' },
    { icon: <MapPin size={24}/>, label: 'Addresses', desc: `${user?.addresses?.length || 0} saved addresses`, to: '/account/profile', color: 'from-green-400 to-emerald-500' },
  ];

  return (
    <div className="page-container py-10 max-w-4xl">
      <div className="flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center font-display text-2xl font-bold">
          {getInitials(user?.name)}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Hey, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-white/80 text-sm">{user?.email}</p>
          {user?.role === 'admin' && <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">⚡ Administrator</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {links.map(l => (
          <Link key={l.to+l.label} to={l.to}
            className="p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-primary-300 hover:-translate-y-1 transition-all group text-center">
            <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${l.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform shadow-md`}>
              {l.icon}
            </div>
            <div className="font-semibold text-sm">{l.label}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{l.desc}</div>
          </Link>
        ))}
      </div>
      {user?.role === 'admin' && (
        <div className="mt-6 p-5 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40">
          <p className="font-semibold text-primary-700 dark:text-primary-400 mb-2">Admin Access</p>
          <p className="text-sm text-primary-600 dark:text-primary-500 mb-3">You have full administrative access to the platform.</p>
          <Link to="/admin" className="btn-primary inline-flex items-center gap-2 text-sm py-2"><ShoppingBag size={14}/> Open Admin Dashboard</Link>
        </div>
      )}
    </div>
  );
}
