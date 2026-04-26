'use client';

import { motion } from 'framer-motion';
import Reveal from '@/components/cinematic/Reveal';

export default function Newsletter() {
  return (
    <section className="py-40 px-6 relative overflow-hidden bg-bg-primary">
      {/* Immersive glowing background */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at 50% 100%, var(--accent-light) 0%, transparent 60%)', filter: 'blur(60px)' }} 
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--bg-primary) 0%, transparent 100%)' }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <Reveal delay={0.1}>
          <h2 className="text-[clamp(2.5rem,6vw,5rem)] font-extrabold font-display tracking-tight mb-8 leading-none"
              style={{ color: 'var(--hero-text)' }}>
            Join the <span style={{ color: 'var(--accent)' }}>Cold Dog</span> Club
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-[17px] mb-12 max-w-xl mx-auto font-medium" style={{ color: 'var(--hero-sub)' }}>
            Get exclusive access to hot deals, premium product drops, and insider discounts before anyone else.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <form className="flex flex-col sm:flex-row items-center gap-4 justify-center max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <div className="relative w-full sm:w-auto flex-1 group">
              <div className="absolute inset-0 rounded-full transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                   style={{ boxShadow: '0 0 0 2px var(--accent-light)' }} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full px-6 py-4 rounded-full outline-none transition-all duration-300 text-[15px]"
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--shop-card-border)',
                  color: 'var(--hero-text)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                }}
                required
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="button-glow w-full sm:w-auto px-8 py-4 rounded-full font-bold tracking-wide transition-all"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              Subscribe
            </motion.button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
