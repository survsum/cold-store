'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import Reveal from '@/components/cinematic/Reveal';

const TESTIMONIALS = [
  {
    name: 'Sarah J.',
    role: 'Verified Buyer',
    text: 'Cold Dog has completely changed how I shop. The curated selection is incredible and the quality is exactly as promised.',
    rating: 5,
  },
  {
    name: 'Michael T.',
    role: 'Tech Enthusiast',
    text: 'Lightning fast shipping and the packaging was premium. This feels like shopping at an Apple store but for lifestyle products.',
    rating: 5,
  },
  {
    name: 'Elena R.',
    role: 'Interior Designer',
    text: 'I recommend their home accessories to all my clients. Minimal, functional, and deeply beautiful design.',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-32 px-6 bg-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay"
        style={{ background: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }} />
        
      <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-32">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div className="flex justify-center gap-1.5 mb-8">
              {[...Array(t.rating)].map((_, j) => (
                <Star key={j} size={18} fill="var(--warning)" className="text-warning" />
              ))}
            </div>
            
            <p className="text-[clamp(1.5rem,4vw,2.5rem)] leading-tight font-medium mb-10"
               style={{ fontFamily: 'var(--font-display)', color: 'var(--hero-text)', letterSpacing: '-0.02em' }}>
              "{t.text}"
            </p>
            
            <div className="flex flex-col items-center gap-2">
              <div className="text-[15px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
                {t.name}
              </div>
              <div className="text-[13px] font-medium" style={{ color: 'var(--hero-sub)' }}>
                {t.role}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
