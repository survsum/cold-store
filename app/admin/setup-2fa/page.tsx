'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Copy, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Setup2FAPage() {
  const [qrCode,    setQrCode]    = useState('');
  const [secret,    setSecret]    = useState('');
  const [token,     setToken]     = useState('');
  const [step,      setStep]      = useState<'show'|'verify'|'done'>('show');
  const [loading,   setLoading]   = useState(false);
  const [fetching,  setFetching]  = useState(true);

  useEffect(() => {
    fetch('/api/admin/2fa/setup')
      .then(r => r.json())
      .then(d => { setQrCode(d.qrCode); setSecret(d.secret); setFetching(false); })
      .catch(() => { toast.error('Failed to load 2FA setup'); setFetching(false); });
  }, []);

  const verify = async () => {
    if (token.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep('done');
      toast.success('2FA enabled! Add ADMIN_TOTP_SECRET to your env vars.');
    } catch (e: any) {
      toast.error(e.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor:'var(--border)', borderTopColor:'var(--accent)' }}/>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 sm:p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:'var(--accent-light)' }}>
            <Shield size={20} style={{ color:'var(--accent)' }}/>
          </div>
          <h1 className="text-xl font-bold" style={{ fontFamily:'var(--font-display)', color:'var(--text-primary)' }}>
            Setup Two-Factor Auth
          </h1>
        </div>
        <p className="text-[13px]" style={{ color:'var(--text-muted)' }}>
          Protect your admin account with an authenticator app.
        </p>
      </div>

      {step === 'show' && (
        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="space-y-6">
          <div className="p-5 rounded-2xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-4" style={{ color:'var(--text-muted)' }}>
              Step 1 — Scan QR code
            </p>
            <p className="text-[13px] mb-4" style={{ color:'var(--text-secondary)' }}>
              Open Google Authenticator, Authy, or any TOTP app and scan this QR code:
            </p>
            {qrCode && (
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 rounded-xl border"
                  style={{ borderColor:'var(--border)' }}/>
              </div>
            )}
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background:'var(--bg-secondary)' }}>
              <code className="text-[11px] flex-1 break-all font-mono" style={{ color:'var(--cold-blue)' }}>{secret}</code>
              <button onClick={() => { navigator.clipboard.writeText(secret); toast.success('Copied!'); }}
                className="flex-shrink-0" style={{ color:'var(--text-muted)' }}>
                <Copy size={14}/>
              </button>
            </div>
            <p className="text-[11px] mt-2" style={{ color:'var(--text-muted)' }}>
              Can't scan? Enter this code manually in your app.
            </p>
          </div>

          <div className="p-4 rounded-2xl" style={{ background:'var(--warning-light)', border:'1px solid rgba(217,119,6,0.2)' }}>
            <div className="flex gap-2">
              <AlertTriangle size={16} style={{ color:'var(--warning)', flexShrink:0, marginTop:2 }}/>
              <p className="text-[12px]" style={{ color:'var(--warning)' }}>
                <strong>Important:</strong> After verifying, you must add <code>ADMIN_TOTP_SECRET=&lt;secret&gt;</code> to your Vercel environment variables and redeploy.
              </p>
            </div>
          </div>

          <button onClick={() => setStep('verify')}
            className="w-full py-3.5 rounded-xl text-[14px] font-bold text-white"
            style={{ background:'var(--accent)' }}>
            I've scanned it — Continue
          </button>
        </motion.div>
      )}

      {step === 'verify' && (
        <motion.div initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} className="space-y-5">
          <div className="p-5 rounded-2xl" style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wider mb-3" style={{ color:'var(--text-muted)' }}>
              Step 2 — Verify code
            </p>
            <p className="text-[13px] mb-4" style={{ color:'var(--text-secondary)' }}>
              Enter the 6-digit code from your authenticator app to confirm setup:
            </p>
            <div className="flex gap-3">
              <input
                value={token}
                onChange={e => setToken(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="000000"
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl text-center text-xl font-mono font-bold outline-none"
                style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)', letterSpacing:'0.2em' }}
                onKeyDown={e => e.key === 'Enter' && verify()}
              />
              <button onClick={verify} disabled={loading || token.length !== 6}
                className="px-6 py-3 rounded-xl text-[13px] font-bold text-white disabled:opacity-40"
                style={{ background:'var(--accent)' }}>
                {loading ? '…' : 'Verify'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {step === 'done' && (
        <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} className="text-center py-10">
          <CheckCircle2 size={56} className="mx-auto mb-4" style={{ color:'var(--success)' }}/>
          <h2 className="text-xl font-bold mb-2" style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>
            2FA Verified!
          </h2>
          <p className="text-[13px] mb-6" style={{ color:'var(--text-muted)' }}>
            Now add this to Vercel Environment Variables and redeploy:
          </p>
          <div className="p-3 rounded-xl text-left mb-6" style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
            <code className="text-[12px] font-mono break-all" style={{ color:'var(--cold-blue)' }}>
              ADMIN_TOTP_SECRET={secret}
            </code>
          </div>
          <a href="/admin/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white"
            style={{ background:'var(--accent)' }}>
            Go to Dashboard
          </a>
        </motion.div>
      )}
    </div>
  );
}
