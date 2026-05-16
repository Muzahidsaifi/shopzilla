import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Ticket,
  Menu, X, LogOut, Sun, Moon, Bell, ChevronRight, Store
} from 'lucide-react';
import { toggleTheme } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

const navItems = [
  { icon: <LayoutDashboard size={18}/>, label: 'Dashboard', to: '/admin' },
  { icon: <Package size={18}/>, label: 'Products', to: '/admin/products' },
  { icon: <ShoppingBag size={18}/>, label: 'Orders', to: '/admin/orders' },
  { icon: <Users size={18}/>, label: 'Users', to: '/admin/users' },
  { icon: <Tag size={18}/>, label: 'Categories', to: '/admin/categories' },
  { icon: <Ticket size={18}/>, label: 'Coupons', to: '/admin/coupons' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector(s => s.ui);
  const { user } = useSelector(s => s.auth);

  const handleLogout = () => { dispatch(logout()); navigate('/'); };

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)] overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex-shrink-0 bg-[var(--bg-primary)] border-r border-[var(--border)] flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[var(--border)] gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Store size={16} className="text-white" />
          </div>
          {sidebarOpen && <span className="font-display font-bold text-gradient">Admin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                  ${active ? 'bg-primary-500 text-white shadow-glow' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-primary-500'}`}>
                <span className="flex-shrink-0">{item.icon}</span>
                {sidebarOpen && item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-[var(--border)]">
          <Link to="/" className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-primary-500 hover:bg-[var(--bg-secondary)] transition-colors ${!sidebarOpen && 'justify-center'}`}>
            <Store size={18} />
            {sidebarOpen && 'View Store'}
          </Link>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1 ${!sidebarOpen && 'justify-center'}`}>
            <LogOut size={18} />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center px-6 gap-4 bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            {theme === 'dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
          <button className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors relative">
            <Bell size={18}/>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold">{user?.name}</div>
              <div className="text-xs text-[var(--text-muted)]">Administrator</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
