'use client';
import { motion } from 'framer-motion';
import { Truck, Shield, RefreshCcw, Zap } from 'lucide-react';

const props = [
  { icon: Zap,        title: 'Daily Drops',    desc: 'New deals every 24 hours' },
  { icon: Truck,      title: 'Free Shipping',  desc: 'On all orders over ₹999'  },
  { icon: Shield,     title: 'Secure Payments',desc: 'Protected by Razorpay'    },
  { icon: RefreshCcw, title: '30-Day Returns', desc: 'Zero-hassle policy'       },
];

export default function ValueProps() {
  return (
    <section className="py-24 px-6 relative overflow-hidden bg-bg-primary">
      {/* Subtle icy background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse at center, var(--accent) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {props.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="group relative flex flex-col items-start gap-5 p-8 rounded-3xl glass cursor-default overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.03)',
                border: '1px solid var(--shop-card-border)'
              }}
            >
              {/* Hover glow effect inside the card */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 0%, var(--accent-light) 0%, transparent 60%)' }} />

              <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                style={{ background: 'var(--accent-light)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <item.icon size={24} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="text-[17px] font-bold mb-2 tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--hero-text)' }}>
                  {item.title}
                </p>
                <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'var(--hero-sub)' }}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
