'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface Product {
  id: string; name: string; price: number;
  image: string; category: string; description: string; stock: number;
}

export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <section className="py-16 md:py-28 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
            className="max-w-2xl"
          >
            <p className="text-[12px] font-bold tracking-[0.3em] uppercase mb-6" style={{ color: 'var(--accent)' }}>
              — The Winter Collection
            </p>
            <h2 className="leading-[1.1]"
              style={{ fontFamily:'var(--font-display)', fontSize:'clamp(3.2rem,6vw,5.5rem)', fontWeight:800, letterSpacing:'-0.03em', color:'var(--shop-text)' }}>
              Featured<br />
              <span className="italic" style={{ color:'var(--shop-muted)', fontWeight:400 }}>Essentials.</span>
            </h2>
          </motion.div>

          <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.3 }}
            className="hidden md:block pb-4">
            <Link href="/products">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="button-glow inline-flex items-center gap-3 px-8 py-4 rounded-full text-[15px] font-semibold text-white transition-all duration-300"
                style={{ background:'var(--accent)' }}
              >
                View Collection
                <ArrowRight size={16} />
              </motion.div>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product, i) => (
            <motion.div key={product.id}
              initial={{ opacity:0, y:32 }} whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-20px' }}
              transition={{ duration:0.6, delay:i*0.09, ease:[0.22,1,0.36,1] }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }}
          className="mt-10 flex justify-center md:hidden">
          <Link href="/products">
            <motion.div whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
              className="flex items-center gap-2 px-7 py-3.5 rounded-full text-[14px] font-semibold transition-colors"
              style={{ border:'1px solid var(--shop-border)', color:'var(--shop-sub)' }}>
              View All <ArrowRight size={14} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
