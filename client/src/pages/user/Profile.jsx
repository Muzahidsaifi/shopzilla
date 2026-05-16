import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Eye, EyeOff } from 'lucide-react';
import { updateProfile } from '../../store/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { getInitials } from '../../utils/helpers';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'' });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    await dispatch(updateProfile(form));
    toast.success('Profile updated!');
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.put('/auth/password', pwForm);
      toast.success('Password updated!');
      setPwForm({ currentPassword:'', newPassword:'' });
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    setSavingPw(false);
  };

  return (
    <div className="page-container py-10 max-w-2xl">
      <h1 className="section-title mb-8">Profile Settings</h1>
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5 p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white font-display text-2xl font-bold flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-sm text-[var(--text-muted)]">{user?.email}</div>
            <div className="text-xs mt-1 badge-primary badge">Member since {new Date(user?.createdAt).getFullYear()}</div>
          </div>
        </div>

        {/* Personal Info */}
        <form onSubmit={handleProfile} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User size={16} className="text-primary-500"/>Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Full Name</label>
              <input className="input-field" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Email</label>
              <input className="input-field opacity-60" value={user?.email} disabled />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Phone</label>
              <input className="input-field" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+91 98765 43210" />
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary mt-5 flex items-center gap-2">
            <Save size={16}/>{saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handlePassword} className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)]">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock size={16} className="text-primary-500"/>Change Password</h3>
          <div className="space-y-4">
            {[
              { label: 'Current Password', key: 'currentPassword' },
              { label: 'New Password', key: 'newPassword' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">{f.label}</label>
                <div className="relative">
                  <input type={showPw?'text':'password'} className="input-field pr-10"
                    value={pwForm[f.key]} onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))} />
                  <button type="button" onClick={()=>setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary-500">
                    {showPw?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={savingPw} className="btn-primary mt-5 flex items-center gap-2">
            <Lock size={16}/>{savingPw ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
