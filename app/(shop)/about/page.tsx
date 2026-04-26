'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Heart, Zap, Shield, Truck, Star, ArrowRight } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const stats = [
  { val: '500+', label: 'Products' },
  { val: '12k+', label: 'Happy Customers' },
  { val: '4.9★', label: 'Average Rating' },
  { val: '₹0',   label: 'Hidden Fees' },
];

const values = [
  { icon: Zap,    title: 'Relentless Value',    desc: 'We hunt down the best deals every single day so you never overpay for premium products.' },
  { icon: Shield, title: 'Quality Guaranteed',  desc: 'Every product is vetted before it hits our shelves. If it is not good enough for us, it is not good enough for you.' },
  { icon: Truck,  title: 'Fast & Reliable',     desc: 'Free shipping on orders over ₹999. Tracked delivery across India with top courier partners.' },
  { icon: Heart,  title: 'Customer First',      desc: 'Real support, real people. 30-day hassle-free returns, no questions asked.' },
];

const team = [
  { name: 'Arjun Mehta',    role: 'Founder & CEO',        avatar: 'AM', color: 'var(--accent)' },
  { name: 'Priya Sharma',   role: 'Head of Products',     avatar: 'PS', color: '#1456b0' },
  { name: 'Rahul Kapoor',   role: 'Customer Experience',  avatar: 'RK', color: '#16a34a' },
  { name: 'Sneha Nair',     role: 'Logistics & Ops',      avatar: 'SN', color: '#7c3aed' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pb-24" style={{ paddingTop: '80px' }}>

      {/* Hero */}
      <section className="px-6 py-20 max-w-5xl mx-auto text-center">
        <motion.div {...fadeUp(0)}>
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-5" style={{ color: 'var(--accent)' }}>
            — Our Story
          </p>
        </motion.div>
        <motion.h1 {...fadeUp(0.1)}
          className="mb-6 leading-none"
          style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem,8vw,6.5rem)', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--shop-text)' }}>
          We find the cold deals.<br />
          <span style={{ color: 'var(--accent)', fontStyle: 'italic' }}>You keep the money.</span>
        </motion.h1>
        <motion.p {...fadeUp(0.2)}
          className="max-w-2xl mx-auto text-[16px] leading-relaxed"
          style={{ color: 'var(--shop-sub)' }}>
          Cold Dog started with a simple idea — premium products should not cost a fortune.
          We built a store where quality meets affordability, and every deal is hand-picked
          by people who actually care about what they sell.
        </motion.p>
      </section>

      {/* Stats */}
      <section className="px-6 py-12" style={{ borderTop: '1px solid var(--shop-border)', borderBottom: '1px solid var(--shop-border)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} {...fadeUp(i * 0.07)} className="text-center">
              <div className="text-[2.5rem] font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)' }}>{s.val}</div>
              <div className="text-[12px] font-semibold tracking-widest uppercase" style={{ color: 'var(--shop-muted)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story section */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color: 'var(--accent)' }}>— How We Started</p>
            <h2 className="mb-5" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--shop-text)' }}>
              Born from frustration<br/>
              <span style={{ color: 'var(--shop-muted)', fontStyle: 'italic' }}>with overpriced basics</span>
            </h2>
            <p className="text-[15px] leading-relaxed mb-4" style={{ color: 'var(--shop-sub)' }}>
              In 2024, our founder Arjun was tired of paying premium prices for products that
              were available elsewhere at half the cost. So he started Cold Dog — a curated
              dropshipping store built on the belief that great products should be accessible to everyone.
            </p>
            <p className="text-[15px] leading-relaxed" style={{ color: 'var(--shop-sub)' }}>
              Today, we serve thousands of customers across India, offering electronics, home goods,
              and accessories — all at prices that make sense. Every product on our site has been
              tested, reviewed, and approved by our team.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className="grid grid-cols-2 gap-3">
            {[
              'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
              'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&q=80',
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
              'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
            ].map((src, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden"
                style={{ border: '1px solid var(--shop-card-border)' }}>
                <img src={src} alt="" className="w-full h-full object-cover"/>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--shop-border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)} className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--accent)' }}>— What We Stand For</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--shop-text)' }}>
              Our values
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((v, i) => (
              <motion.div key={v.title} {...fadeUp(i * 0.08)}
                className="p-6 rounded-2xl" style={{ background: 'var(--shop-card-bg)', border: '1px solid var(--shop-card-border)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(230,48,48,0.1)', border: '1px solid rgba(230,48,48,0.2)' }}>
                  <v.icon size={20} style={{ color: 'var(--accent)' }}/>
                </div>
                <h3 className="text-[15px] font-bold mb-2" style={{ color: 'var(--shop-text)', fontFamily: 'var(--font-display)' }}>{v.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--shop-sub)' }}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="px-6 py-16" style={{ borderTop: '1px solid var(--shop-border)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp(0)} className="mb-12">
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-3" style={{ color: 'var(--accent)' }}>— The People</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--shop-text)' }}>
              Meet our team
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {team.map((t, i) => (
              <motion.div key={t.name} {...fadeUp(i * 0.08)} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white mx-auto mb-3"
                  style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}99)` }}>
                  {t.avatar}
                </div>
                <p className="text-[14px] font-bold" style={{ color: 'var(--shop-text)' }}>{t.name}</p>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--shop-muted)' }}>{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20" style={{ borderTop: '1px solid var(--shop-border)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp(0)}>
            <Star size={32} className="mx-auto mb-6" style={{ color: 'var(--accent)' }}/>
            <h2 className="mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--shop-text)' }}>
              Ready to shop?
            </h2>
            <p className="mb-8 text-[15px]" style={{ color: 'var(--shop-sub)' }}>
              Join thousands of happy customers who save money every day with Cold Dog.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/products">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-[15px] font-bold text-white"
                  style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(230,48,48,0.3)' }}>
                  Shop Now <ArrowRight size={16}/>
                </motion.div>
              </Link>
              <Link href="/contact">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[15px] font-semibold"
                  style={{ border: '1px solid var(--shop-border)', color: 'var(--shop-sub)' }}>
                  Contact Us
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
