'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }, transition: { duration: 0.6, delay, ease: [0.22,1,0.36,1] },
});

const info = [
  { icon: Mail,  label: 'Email',   value: 'support@colddog.in',    sub: 'We reply within 24 hours' },
  { icon: Phone, label: 'Phone',   value: '+91 98765 43210',        sub: 'Mon–Sat, 10am–7pm IST'   },
  { icon: MapPin,label: 'Address', value: 'Mumbai, Maharashtra',    sub: 'India 400001'             },
  { icon: Clock, label: 'Hours',   value: 'Mon–Sat 10am–7pm',       sub: 'Closed on Sundays'        },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name:'', email:'', subject:'', message:'' });
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
    toast.success('Message sent! We\'ll get back to you soon.');
  };

  const inp = "w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all";
  const inpStyle = { background:'var(--bg-secondary)', border:'1px solid var(--border)', color:'var(--text-primary)' };

  return (
    <div className="min-h-screen pb-24" style={{ paddingTop: '80px' }}>
      <div className="px-4 sm:px-6 py-12 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-12">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: 'var(--accent)' }}>— Get In Touch</p>
          <h1 className="leading-none" style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,5rem)', fontWeight:800, letterSpacing:'-0.04em', color:'var(--shop-text)' }}>
            We'd love to<br/><span style={{ color:'var(--accent)', fontStyle:'italic' }}>hear from you</span>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact form */}
          <motion.div {...fadeUp(0.1)}>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl"
                style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',damping:12}}>
                  <CheckCircle2 size={56} style={{ color:'var(--success)' }} className="mx-auto mb-4"/>
                </motion.div>
                <h3 className="text-xl font-bold mb-2" style={{ color:'var(--shop-text)', fontFamily:'var(--font-display)' }}>Message Sent!</h3>
                <p className="text-[13px]" style={{ color:'var(--shop-muted)' }}>We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl space-y-4"
                style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--shop-muted)' }}>Name</label>
                    <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
                      placeholder="Your name" required className={inp} style={inpStyle}
                      onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                      onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--shop-muted)' }}>Email</label>
                    <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                      placeholder="your@email.com" required className={inp} style={inpStyle}
                      onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                      onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--shop-muted)' }}>Subject</label>
                  <input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}
                    placeholder="How can we help?" required className={inp} style={inpStyle}
                    onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                    onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color:'var(--shop-muted)' }}>Message</label>
                  <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})}
                    placeholder="Tell us more…" required rows={5}
                    className={`${inp} resize-none`} style={inpStyle}
                    onFocus={e=>(e.target.style.borderColor='var(--cold-blue)')}
                    onBlur={e=>(e.target.style.borderColor='var(--border)')}/>
                </div>
                <motion.button type="submit" disabled={loading} whileTap={{ scale:0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold text-white transition-all disabled:opacity-50"
                  style={{ background:'var(--accent)', boxShadow:'0 4px 20px rgba(230,48,48,0.3)' }}>
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                    : <><Send size={15}/> Send Message</>
                  }
                </motion.button>
              </form>
            )}
          </motion.div>

          {/* Info cards */}
          <motion.div {...fadeUp(0.15)} className="space-y-4">
            {info.map((item, i) => (
              <motion.div key={item.label} {...fadeUp(0.1 + i * 0.07)}
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:'rgba(230,48,48,0.1)', border:'1px solid rgba(230,48,48,0.2)' }}>
                  <item.icon size={18} style={{ color:'var(--accent)' }}/>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color:'var(--shop-muted)' }}>{item.label}</p>
                  <p className="text-[14px] font-bold" style={{ color:'var(--shop-text)' }}>{item.value}</p>
                  <p className="text-[11px] mt-0.5" style={{ color:'var(--shop-muted)' }}>{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
