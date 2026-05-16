import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Check, Ticket } from 'lucide-react';
import api from '../../utils/api';
import { formatDate, formatPrice } from '../../utils/helpers';
import toast from 'react-hot-toast';

const EMPTY = { code:'', type:'percentage', value:'', minOrderAmount:0, maxDiscount:'', usageLimit:'', validFrom: new Date().toISOString().split('T')[0], validUntil: new Date(Date.now()+30*86400000).toISOString().split('T')[0], isActive:true, description:'' };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/coupons').then(r => setCoupons(r.data.coupons));
  }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c._id);
    setForm({ ...c, validFrom: c.validFrom?.split('T')[0], validUntil: c.validUntil?.split('T')[0] });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code and value required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const res = await api.put(`/admin/coupons/${editing}`, form);
        setCoupons(prev => prev.map(c => c._id===editing ? res.data.coupon : c));
        toast.success('Coupon updated!');
      } else {
        const res = await api.post('/admin/coupons', form);
        setCoupons(prev => [res.data.coupon, ...prev]);
        toast.success('Coupon created!');
      }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(prev => prev.filter(c => c._id!==id));
      toast.success('Coupon deleted');
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl">Coupons</h1>
          <p className="text-sm text-[var(--text-secondary)]">{coupons.length} coupons</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={16}/> Add Coupon</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => {
          const expired = new Date(c.validUntil) < new Date();
          return (
            <motion.div key={c._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
              className={`glass-card p-5 border-l-4 ${c.isActive && !expired ? 'border-emerald-500' : 'border-red-400'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono font-bold text-lg text-primary-500">{c.code}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.description}</p>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 hover:bg-blue-100"><Edit2 size={13}/></button>
                  <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 hover:bg-red-100"><Trash2 size={13}/></button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Discount</span>
                  <span className="font-bold text-emerald-500">{c.type==='percentage' ? `${c.value}%` : formatPrice(c.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Min Order</span>
                  <span>{formatPrice(c.minOrderAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Used</span>
                  <span>{c.usedCount}/{c.usageLimit || '∞'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-muted)]">Valid Until</span>
                  <span className={expired ? 'text-red-500' : ''}>{formatDate(c.validUntil)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[var(--text-muted)]">Status</span>
                  <span className={`badge ${c.isActive && !expired ? 'badge-success' : 'badge-danger'}`}>
                    {expired ? 'Expired' : c.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 bg-[var(--bg-primary)] rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5">
                <h2 className="font-display font-bold text-lg">{editing ? 'Edit' : 'Add'} Coupon</h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)]"><X size={16}/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Coupon Code *</label>
                  <input value={form.code} onChange={e => setForm({...form, code:e.target.value.toUpperCase()})} placeholder="SUMMER20" className="input-field font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Type *</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})} className="input-field">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Value *</label>
                  <input type="number" value={form.value} onChange={e => setForm({...form, value:e.target.value})} placeholder={form.type==='percentage' ? '20' : '200'} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Min Order (₹)</label>
                  <input type="number" value={form.minOrderAmount} onChange={e => setForm({...form, minOrderAmount:e.target.value})} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Max Discount (₹)</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount:e.target.value})} placeholder="500" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit:e.target.value})} placeholder="Unlimited" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Valid From *</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm({...form, validFrom:e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Valid Until *</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm({...form, validUntil:e.target.value})} className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1 block">Description</label>
                  <input value={form.description} onChange={e => setForm({...form, description:e.target.value})} placeholder="20% off on all orders" className="input-field" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm({...form, isActive:e.target.checked})} className="accent-primary-500 w-4 h-4" />
                    Active Coupon
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14}/> Save Coupon</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
