import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Shield, User, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, getInitials } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/admin/users?search=${search}`)
      .then(res => { setUsers(res.data.users); setTotal(res.data.total); })
      .catch(() => toast.error('Failed to fetch users'))
      .finally(() => setLoading(false));
  }, [search]);

  const toggleAdmin = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Make ${user.name} ${newRole}?`)) return;
    try {
      const res = await api.patch(`/admin/users/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.user : u));
      toast.success(`${user.name} is now ${newRole}`);
    } catch { toast.error('Failed to update'); }
  };

  const toggleActive = async (user) => {
    try {
      const res = await api.patch(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? res.data.user : u));
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Failed to update'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Users</h1>
          <p className="text-sm text-[var(--text-secondary)]">{total} registered users</p>
        </div>
      </div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..." className="input-field pl-9 py-2 text-sm" />
      </div>
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-secondary)] border-b border-[var(--border)]">
              <tr className="text-[var(--text-muted)] text-xs">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? [...Array(5)].map((_,i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-4"><div className="h-4 skeleton rounded" /></td></tr>
              )) : users.map(user => (
                <motion.tr key={user._id} initial={{ opacity:0 }} animate={{ opacity:1 }}
                  className="hover:bg-[var(--bg-secondary)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                      {user.role === 'admin' ? <><Shield size={10} className="mr-1" />Admin</> : <><User size={10} className="mr-1" />User</>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleAdmin(user)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors font-medium
                          ${user.role==='admin' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/30 dark:text-amber-400' : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950/30 dark:text-blue-400'}`}>
                        {user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                      <button onClick={() => toggleActive(user)}
                        className={`text-xs px-2 py-1 rounded-lg transition-colors font-medium
                          ${user.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
