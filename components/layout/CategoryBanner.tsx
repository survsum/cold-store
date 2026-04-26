'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  { name:'Electronics', tagline:'Cutting-edge tech', image:'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=900&q=85', num:'01' },
  { name:'Home',        tagline:'Live beautifully',  image:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85', num:'02' },
  { name:'Accessories', tagline:'Finish every look', image:'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&q=85', num:'03' },
];

export default function CategoryBanner() {
  return (
    <section className="py-16 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.7, ease:[0.22,1,0.36,1] }}>
            <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color:'var(--accent)' }}>— Categories</p>
            <h2 className="leading-none"
              style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.8rem,5.5vw,5rem)', fontWeight:800, letterSpacing:'-0.04em', color:'var(--shop-text)' }}>
              Shop by<br/>
              <span className="italic" style={{ color:'var(--shop-muted)' }}>Category</span>
            </h2>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 h-[450px] sm:h-[500px] md:h-[600px]">
          {categories.map((cat, i) => {
            const isFeatured = i === 0;
            return (
              <motion.div key={cat.name}
                initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.65, delay:i*0.1, ease:[0.22,1,0.36,1] }}
                className={`${isFeatured ? 'md:row-span-2' : ''} h-full`}
              >
                <Link href={`/products?category=${cat.name}`} className="block h-full">
                  <div className="group relative rounded-[2rem] overflow-hidden cursor-pointer h-full"
                    style={{ border:'1px solid var(--shop-card-border)' }}>
                    
                    {/* Background Image */}
                    <img src={cat.image} alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />

                    {/* Icy Cinematic Gradient Overlay */}
                    <div className="absolute inset-0 transition-opacity duration-500 group-hover:opacity-90"
                      style={{ 
                        background: isFeatured 
                          ? 'linear-gradient(to top, rgba(6,16,30,0.9) 0%, rgba(6,16,30,0.4) 40%, rgba(255,255,255,0.05) 100%)' 
                          : 'linear-gradient(to right, rgba(6,16,30,0.8) 0%, rgba(6,16,30,0.3) 50%, transparent 100%)'
                      }} 
                    />

                    {/* Accent Overlay Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none mix-blend-screen"
                      style={{ background: 'radial-gradient(circle at center, var(--accent) 0%, transparent 70%)' }} />

                    <div className="absolute top-6 left-8">
                      <span className="text-[11px] font-bold tracking-[0.2em] text-white/50">{cat.num}</span>
                    </div>

                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0"
                      style={{ background:'rgba(255,255,255,0.1)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.2)' }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='white';}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.1)';}}>
                      <ArrowUpRight size={16} className="text-white group-hover:text-black transition-colors duration-200" />
                    </div>

                    <div className={`absolute left-5 right-5 sm:left-8 sm:right-8 ${isFeatured ? 'bottom-8 sm:bottom-10' : 'bottom-6 sm:bottom-8 top-auto md:top-1/2 md:-translate-y-1/2 md:bottom-auto'}`}>
                      <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase text-white/60 mb-2 sm:mb-3">{cat.tagline}</p>
                      <h3 className="text-white leading-none mb-3 sm:mb-5"
                        style={{ fontFamily:'var(--font-display)', fontSize: isFeatured ? 'clamp(2.2rem, 5vw, 4rem)' : 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight:800, letterSpacing:'-0.03em' }}>
                        {cat.name}
                      </h3>
                      
                      {/* Hover reveal line */}
                      <div className="flex items-center gap-3 text-[13px] font-bold text-white/60 group-hover:text-white transition-colors duration-300 overflow-hidden">
                        <span className="translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">Explore Collection</span>
                        <div className="flex-1 h-px bg-white/20 group-hover:bg-white/50 transition-colors duration-500 scale-x-0 group-hover:scale-x-100 origin-left" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
