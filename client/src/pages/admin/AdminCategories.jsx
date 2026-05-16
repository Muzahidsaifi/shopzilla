import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:'', description:'', icon:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
  }, []);

  const openAdd = () => { setEditing(null); setForm({ name:'', description:'', icon:'' }); setShowModal(true); };
  const openEdit = (c) => { setEditing(c._id); setForm({ name:c.name, description:c.description||'', icon:c.icon||'' }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/categories/${editing}`, form);
        setCategories(prev => prev.map(c => c._id===editing ? res.data.category : c));
        toast.success('Category updated!');
      } else {
        const res = await api.post('/categories', form);
        setCategories(prev => [...prev, res.data.category]);
        toast.success('Category created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Categories</h1>
          <p className="text-sm text-[var(--text-secondary)]">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Category</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => (
          <motion.div key={cat._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            className="glass-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-950/50 dark:to-primary-900/30 flex items-center justify-center text-2xl flex-shrink-0">
              {cat.icon || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{cat.name}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{cat.description || 'No description'}</p>
              <p className="text-xs text-primary-500 font-mono mt-0.5">{cat.slug}</p>
            </div>
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100 transition-colors"><Edit2 size={13}/></button>
              <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={13}/></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 bg-[var(--bg-primary)] rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-lg">{editing ? 'Edit' : 'Add'} Category</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]"><X size={16}/></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Name *</label>
                  <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} placeholder="Electronics" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Icon (emoji)</label>
                  <input value={form.icon} onChange={e => setForm({...form, icon:e.target.value})} placeholder="💻" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={2} placeholder="Category description..." className="input-field resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14}/> Save</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
