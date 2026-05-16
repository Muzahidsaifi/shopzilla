import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Check, Package } from 'lucide-react';
import api from '../../utils/api';
import { formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { name:'', price:'', originalPrice:'', category:'', brand:'', stock:'', description:'', images:[{url:''}], isFeatured:false, freeShipping:false, tags:'' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      const res = await api.get(`/products?${params}&admin=true`);
      setProducts(res.data.products);
      setTotal(res.data.pagination?.total || 0);
    } catch { toast.error('Failed to fetch products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ ...p, category: p.category?._id || p.category, tags: p.tags?.join(', ') || '', images: p.images?.length ? p.images : [{url:''}] });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) { toast.error('Name, price and category required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editing) {
        const res = await api.put(`/products/${editing}`, payload);
        setProducts(prev => prev.map(p => p._id === editing ? res.data.product : p));
        toast.success('Product updated!');
      } else {
        const res = await api.post('/products', payload);
        setProducts(prev => [res.data.product, ...prev]);
        toast.success('Product created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deactivated');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Products</h1>
          <p className="text-sm text-[var(--text-secondary)]">{total} total products</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..." className="input-field pl-9 py-2 text-sm" />
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? [...Array(8)].map((_, i) => (
          <div key={i} className="glass-card p-4 space-y-3">
            <div className="aspect-square skeleton rounded-xl" />
            <div className="h-4 skeleton rounded w-3/4" />
            <div className="h-3 skeleton rounded w-1/2" />
          </div>
        )) : products.map(p => (
          <motion.div key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="glass-card overflow-hidden group">
            <div className="relative aspect-square bg-[var(--bg-secondary)]">
              <img src={p.images?.[0]?.url || 'https://placehold.co/200'} alt={p.name}
                className="w-full h-full object-cover" />
              {!p.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="badge badge-danger">Inactive</span>
                </div>
              )}
              {p.isFeatured && (
                <span className="absolute top-2 left-2 badge bg-primary-500 text-white text-[10px]">Featured</span>
              )}
            </div>
            <div className="p-3">
              <p className="font-semibold text-sm line-clamp-1">{p.name}</p>
              <p className="text-xs text-[var(--text-muted)] mb-2">{p.brand}</p>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-primary-500">{formatPrice(p.price)}</span>
                <span className={`text-xs font-medium ${p.stock <= 5 ? 'text-red-500' : p.stock <= 20 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  Stock: {p.stock}
                </span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(p)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
                <button onClick={() => handleDelete(p._id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-ghost text-sm px-3 py-1.5">← Prev</button>
          <span className="px-4 py-1.5 text-sm text-[var(--text-secondary)]">Page {page}</span>
          <button onClick={() => setPage(p => p+1)} disabled={page >= Math.ceil(total/12)} className="btn-ghost text-sm px-3 py-1.5">Next →</button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed inset-x-4 top-8 bottom-8 z-50 max-w-2xl mx-auto bg-[var(--bg-primary)] rounded-2xl shadow-2xl overflow-y-auto">
              <div className="sticky top-0 bg-[var(--bg-primary)] px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                <h2 className="font-display font-bold text-lg">{editing ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Product Name *</label>
                    <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="e.g. iPhone 15 Pro" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm({...form, price:e.target.value})} placeholder="99999" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Original Price (₹)</label>
                    <input type="number" value={form.originalPrice} onChange={e => setForm({...form, originalPrice:e.target.value})} placeholder="129999" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Category *</label>
                    <select value={form.category} onChange={e => setForm({...form, category:e.target.value})} className="input-field">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Brand</label>
                    <input value={form.brand} onChange={e => setForm({...form, brand:e.target.value})} placeholder="Apple" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Stock *</label>
                    <input type="number" value={form.stock} onChange={e => setForm({...form, stock:e.target.value})} placeholder="100" className="input-field" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Tags (comma separated)</label>
                    <input value={form.tags} onChange={e => setForm({...form, tags:e.target.value})} placeholder="phone, apple, ios" className="input-field" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Image URL</label>
                    <input value={form.images?.[0]?.url || ''} onChange={e => setForm({...form, images:[{url:e.target.value}]})} placeholder="https://..." className="input-field" />
                    {form.images?.[0]?.url && (
                      <img src={form.images[0].url} alt="preview" className="w-20 h-20 object-cover rounded-xl mt-2 border border-[var(--border)]" />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Description *</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3} placeholder="Product description..." className="input-field resize-none" />
                  </div>
                  <div className="sm:col-span-2 flex gap-6">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured:e.target.checked})} className="accent-primary-500 w-4 h-4 rounded" />
                      Featured Product
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.freeShipping} onChange={e => setForm({...form, freeShipping:e.target.checked})} className="accent-primary-500 w-4 h-4 rounded" />
                      Free Shipping
                    </label>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-[var(--bg-primary)] px-6 py-4 border-t border-[var(--border)] flex gap-3">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16}/> {editing ? 'Update' : 'Create'} Product</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
