'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/hooks/useAuthStore';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Edit3, Check, X, Camera, Package, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, openModal, setUser, logout } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm]       = useState({ name: '', phone: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) openModal();
    else setForm({ name: user.name || '', phone: '' });
  }, [user, openModal]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ paddingTop: '80px' }}>
        <User size={40} className="mb-4" style={{ color: 'var(--shop-muted)' }}/>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--shop-text)' }}>
          Sign in to view your profile
        </h2>
        <p className="text-[13px]" style={{ color: 'var(--shop-muted)' }}>Your profile will appear here after signing in.</p>
      </div>
    );
  }

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), phone: form.phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser({ ...user, name: form.name.trim() });
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally { setSaving(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB for avatar'); return; }

    setAvatarUploading(true);
    try {
      // Upload to Cloudinary via our upload API (we'll pass a flag)
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'avatars');

      const res = await fetch('/api/auth/user/upload-avatar', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser({ ...user, avatar: data.url });
      toast.success('Avatar updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload avatar');
    } finally { setAvatarUploading(false); }
  };

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success('Account deleted.');
      window.location.href = '/';
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
      setDeleting(false);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all";
  const inpS = { background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)' };

  return (
    <div className="min-h-screen pb-24 px-4 sm:px-6 max-w-2xl mx-auto" style={{ paddingTop: '90px' }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>

        <div className="flex items-center justify-between mb-8">
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:800, letterSpacing:'-0.03em', color:'var(--shop-text)' }}>
            My Profile
          </h1>
          {!editing ? (
            <button onClick={()=>setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold transition-all"
              style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-secondary)' }}>
              <Edit3 size={13}/> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={()=>setEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-all"
                style={{ border:'1px solid var(--border)', color:'var(--text-muted)' }}>
                <X size={13}/> Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-white transition-all disabled:opacity-50"
                style={{ background:'var(--accent)' }}>
                {saving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Check size={13}/>}
                Save
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8 p-8 rounded-3xl"
          style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <div className="relative mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name||''} className="w-24 h-24 rounded-full object-cover ring-4" style={{ ringColor:'var(--border)' }}/>
            ) : (
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                style={{ background:'linear-gradient(135deg,var(--accent),#1456b0)' }}>
                {initials}
              </div>
            )}
            {/* Avatar upload button */}
            <button onClick={()=>fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-all"
              style={{ background:'var(--accent)' }}
              disabled={avatarUploading}>
              {avatarUploading
                ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <Camera size={13}/>
              }
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange}/>
          </div>
          <h2 className="text-xl font-bold" style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>
            {user.name || user.email.split('@')[0]}
          </h2>
          <p className="text-[13px] mt-1" style={{ color:'var(--text-muted)' }}>{user.email}</p>
          <span className="mt-2 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
            style={{ background:'var(--accent-light)', color:'var(--accent)' }}>
            {user.provider}
          </span>
        </div>

        {/* Editable fields */}
        <div className="space-y-4 mb-6">
          <div className="p-5 rounded-2xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color:'var(--text-muted)' }}>
              Full Name
            </label>
            {editing ? (
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                placeholder="Your full name" className={inp} style={inpS}
                onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
            ) : (
              <div className="flex items-center gap-2.5">
                <User size={15} style={{ color:'var(--text-muted)' }}/>
                <p className="text-[14px]" style={{ color:'var(--text-primary)' }}>{user.name || '—'}</p>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color:'var(--text-muted)' }}>
              Email Address
            </label>
            <div className="flex items-center gap-2.5">
              <Mail size={15} style={{ color:'var(--text-muted)' }}/>
              <p className="text-[14px]" style={{ color:'var(--text-primary)' }}>{user.email}</p>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ background:'var(--success-light)', color:'var(--success)' }}>Verified</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
            <label className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color:'var(--text-muted)' }}>
              Phone Number
            </label>
            {editing ? (
              <input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}
                placeholder="+91 98765 43210" type="tel" className={inp} style={inpS}
                onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
            ) : (
              <div className="flex items-center gap-2.5">
                <Phone size={15} style={{ color:'var(--text-muted)' }}/>
                <p className="text-[14px]" style={{ color:'var(--text-primary)' }}>{form.phone || '—'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/my-orders" className="flex-1">
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold transition-all"
              style={{ border:'1px solid var(--border)', color:'var(--text-secondary)', background:'var(--bg-card)' }}>
              <Package size={15}/> My Orders
            </button>
          </Link>
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold transition-all text-white"
            style={{ background:'rgba(230,48,48,0.9)' }}>
            <LogOut size={15}/> Sign Out
          </button>
        </div>

        {/* Delete Account */}
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-[12px] font-semibold transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
              <Trash2 size={13} /> Delete my account
            </button>
          ) : (
            <div className="p-5 rounded-2xl" style={{ background: 'var(--accent-light)', border: '1px solid rgba(230,48,48,0.25)' }}>
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}/>
                <div>
                  <p className="text-[14px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Delete your account?</p>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    This permanently deletes your account and personal data. Your order history will be anonymised.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleting}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold text-white disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}>
                  {deleting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Trash2 size={12}/>}
                  Yes, delete permanently
                </button>
                <button onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-full text-[12px] font-bold"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
