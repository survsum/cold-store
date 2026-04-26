'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import SnowParticles from '@/components/cinematic/SnowParticles';
import MountainSilhouette from '@/components/cinematic/MountainSilhouette';

const MARQUEE_ITEMS = [
  'Cold Deals', '❄️', 'Hot Prices', '🐾', 'Premium Products', '⚡',
  'Free Shipping', '❄️', 'Cold Deals', '🔥', 'Hot Prices', '🐾',
  'Premium Products', '⚡', 'Free Shipping', '❄️',
];

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yText    = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const opacity  = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const LINES = [
    { text: 'Cold Deals.',  red: false },
    { text: 'Blazing',      red: true,  italic: true },
    { text: 'Hot Prices.',  red: false },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-bg-primary via-bg-primary to-bg-secondary">
      {/* Cinematic Backgrounds */}
      <MountainSilhouette />
      <SnowParticles />
      
      {/* Vignette — subtle, adapts to both modes */}
      <div className="absolute inset-0 z-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(0,0,0,0.18) 100%)' }} />

      <motion.div style={{ y: yText, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-28 pb-12">

        {/* Eyebrow pill */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full"
            style={{
              background: 'var(--pill-bg)',
              border: '1px solid var(--pill-border)',
              backdropFilter: 'blur(12px)',
            }}>
            <Zap size={12} fill="var(--accent)" className="text-[var(--accent)]" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase"
              style={{ color: 'var(--pill-text)' }}>
              Cold Dog · Est. 2024 · Hot Deals Daily
            </span>
          </div>
        </motion.div>

        {/* Cinematic Light Beam (Nolan/Lynch style) */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[150%] max-w-6xl h-[60vh] pointer-events-none -z-10"
          style={{ 
            background: 'conic-gradient(from 180deg at 50% -20%, rgba(255,255,255,0.08) 0deg, transparent 40deg, transparent 320deg, rgba(255,255,255,0.08) 360deg)',
            mixBlendMode: 'overlay',
            opacity: 0.8
          }} />

        {/* Headline backdrop for perfect cinematic contrast (Optimized: No heavy blur) */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[140%] max-w-5xl h-80 pointer-events-none -z-10"
          style={{ background: 'radial-gradient(ellipse at center, var(--bg-primary) 0%, transparent 60%)', opacity: 0.85 }} />

        {/* Big headline */}
        <div className="text-center mb-10 relative">
          {[
            { text: 'COLD DOG.', weight: 800, isSub: false },
            { text: 'Curated for the Cold.', weight: 400, isSub: true },
          ].map((line, i) => (
            <div key={i} className="overflow-hidden pb-3">
              <motion.div
                initial={{ y: '120%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  y: { duration: 1.8, delay: 0.2 + i * 0.2, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 1.8, delay: 0.2 + i * 0.2, ease: 'easeOut' },
                }}
                className={`block cursor-default`}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: line.isSub ? 'clamp(1.2rem, 3.5vw, 2.5rem)' : 'clamp(3.8rem, 12vw, 10rem)',
                  fontWeight: line.weight,
                  letterSpacing: line.isSub ? '0.05em' : '-0.04em',
                  color: line.isSub ? 'var(--accent)' : 'var(--hero-text)',
                  lineHeight: line.isSub ? '1.4' : '0.95',
                }}
              >
                {line.text}
              </motion.div>
            </div>
          ))}
        </div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-14 leading-relaxed"
          style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--hero-sub)' }}
        >
          Premium products, unbeatable prices. Cold Dog sniffs out the best
          deals so you never overpay again.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 1.0 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-sm sm:max-w-none mx-auto mb-16 px-6 sm:px-0"
        >
          <Link href="/products">
            <motion.div
              whileHover={{ scale: 1.03, x: 4 }} whileTap={{ scale: 0.97 }}
              className="button-glow w-full sm:w-auto inline-flex justify-center items-center gap-3 px-8 py-3.5 sm:py-4 rounded-full text-[14px] sm:text-[15px] font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              Shop Hot Deals
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
            </motion.div>
          </Link>

          <Link href="/products?category=Electronics">
            <motion.div
              whileHover={{ scale: 1.02, borderColor: 'var(--accent)', boxShadow: '0 0 15px var(--accent-light)' }} whileTap={{ scale: 0.98 }}
              className="glass w-full sm:w-auto inline-flex justify-center items-center gap-2 px-8 py-3.5 sm:py-4 rounded-full text-[14px] sm:text-[15px] font-semibold transition-all duration-500"
              style={{
                border: '1px solid var(--border-strong)',
                background: 'var(--btn-secondary-bg)',
                color: 'var(--text-primary)',
              }}
            >
              Browse Categories
            </motion.div>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="grid grid-cols-2 md:flex items-center justify-center gap-y-8 md:gap-10 pt-10 px-4 md:px-0"
          style={{ borderTop: '1px solid var(--shop-border)' }}
        >
          {[
            { val: '500+', label: 'Hot Products' },
            { val: '12k+', label: 'Happy Customers' },
            { val: '4.9★', label: 'Rating' },
            { val: '₹0',   label: 'Hidden Fees' },
          ].map(s => (
            <div key={s.label} className="text-center group cursor-default">
              <div className="text-[26px] sm:text-3xl font-bold transition-colors duration-500 drop-shadow-sm text-[#111111] dark:text-[#FFFFFF] group-hover:text-[var(--accent)] dark:group-hover:text-[var(--accent)]"
                style={{ fontFamily: 'var(--font-display)' }}>
                {s.val}
              </div>
              <div className="text-[11px] font-bold tracking-widest uppercase mt-1.5 text-[#444444] dark:text-[rgba(255,255,255,0.72)]">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Marquee ticker (Optimized: No backdrop-filter on large moving area) */}
      <div className="absolute bottom-0 inset-x-0 overflow-hidden py-3"
        style={{ borderTop: '1px solid var(--shop-border)', background: 'var(--marquee-bg)' }}>
        <div className="flex marquee-track whitespace-nowrap select-none">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-8 text-[11px] font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--marquee-text)' }}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
