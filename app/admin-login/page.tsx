'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Lock, Shield } from 'lucide-react';

type Step = 'credentials' | '2fa';

export default function AdminLoginPage() {
  const [step,     setStep]     = useState<Step>('credentials');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [totp,     setTotp]     = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Login failed'); return; }

      if (data.requires2FA) {
        setStep('2fa');
      } else {
        window.location.href = '/admin/dashboard';
      }
    } catch {
      setError('Network error. Please try again.');
    } finally { setLoading(false); }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totp.length !== 6) { setError('Enter the 6-digit code'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('/api/admin/2fa/verify', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: totp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Invalid code'); return; }
      window.location.href = '/admin/dashboard';
    } catch {
      setError('Network error. Please try again.');
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl text-sm outline-none transition-all";
  const inpS = { background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)' };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background:'var(--bg-primary)' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
        className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 shadow-lg ring-2 ring-[var(--border)]">
            <img src="/cold-dog-logo.png" alt="Cold Dog" className="w-full h-full object-cover"/>
          </div>
          <h1 className="text-xl font-bold tracking-widest" style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>COLD DOG</h1>
          <p className="text-sm mt-1" style={{ color:'var(--text-muted)' }}>Admin Panel</p>
        </div>

        <div className="p-7 rounded-3xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Credentials ── */}
            {step === 'credentials' && (
              <motion.div key="creds" initial={{ opacity:0,x:-10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-10 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'var(--accent)' }}>
                    <Lock size={15} className="text-white"/>
                  </div>
                  <div>
                    <h2 className="font-bold text-[14px]" style={{ color:'var(--text-primary)' }}>Sign In</h2>
                    <p className="text-[11px]" style={{ color:'var(--text-muted)' }}>Admin access only</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background:'var(--accent-light)', border:'1px solid rgba(230,48,48,0.2)', color:'var(--accent)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--text-muted)' }}>Email</label>
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                      placeholder="your@email.com" required autoComplete="email"
                      className={inp} style={inpS}
                      onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                      onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--text-muted)' }}>Password</label>
                    <div className="relative">
                      <input type={showPw?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)}
                        required autoComplete="current-password"
                        className={`${inp} pr-11`} style={inpS}
                        onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                        onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                      <button type="button" onClick={()=>setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--text-muted)' }}>
                        {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>
                  <motion.button type="submit" disabled={loading} whileTap={{ scale:0.97 }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{ background:'var(--accent)' }}>
                    {loading
                      ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Signing in…</>
                      : 'Sign In'
                    }
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── Step 2: 2FA ── */}
            {step === '2fa' && (
              <motion.div key="2fa" initial={{ opacity:0,x:10 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:10 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'var(--cold-blue-light)' }}>
                    <Shield size={16} style={{ color:'var(--cold-blue)' }}/>
                  </div>
                  <div>
                    <h2 className="font-bold text-[14px]" style={{ color:'var(--text-primary)' }}>Two-Factor Auth</h2>
                    <p className="text-[11px]" style={{ color:'var(--text-muted)' }}>Enter code from your authenticator</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background:'var(--accent-light)', border:'1px solid rgba(230,48,48,0.2)', color:'var(--accent)' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handle2FA} className="space-y-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider block mb-3 text-center" style={{ color:'var(--text-muted)' }}>
                      6-digit authenticator code
                    </label>
                    <input value={totp} onChange={e=>setTotp(e.target.value.replace(/\D/g,'').slice(0,6))}
                      placeholder="000000" maxLength={6} inputMode="numeric" autoFocus
                      className="w-full px-4 py-4 rounded-xl text-center text-2xl font-mono font-bold outline-none"
                      style={{ ...inpS, letterSpacing:'0.25em' }}
                      onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                      onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                  </div>
                  <motion.button type="submit" disabled={loading||totp.length!==6} whileTap={{ scale:0.97 }}
                    className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background:'var(--accent)' }}>
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : 'Verify'}
                  </motion.button>
                  <button type="button" onClick={()=>{setStep('credentials');setError('');}}
                    className="w-full text-center text-[12px] py-2" style={{ color:'var(--text-muted)' }}>
                    ← Back to login
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
