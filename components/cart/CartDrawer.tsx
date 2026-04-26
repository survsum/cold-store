'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const total = useCartStore(s => s.getTotalPrice());
  const shipping = total >= 999 ? 0 : 99;
  const grandTotal = total + shipping;

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div key="cd-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer */}
          <motion.div key="cd-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[71] flex flex-col h-[100dvh] shadow-2xl"
            style={{
              width: 'min(420px, 100vw)',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 flex-shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
                <h2 className="text-[17px] font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  Bag
                </h2>
                {items.length > 0 && (
                  <span className="w-5 h-5 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
                    style={{ background: 'var(--accent)' }}>
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={closeCart}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}>
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 scrollbar-none">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'var(--bg-secondary)' }}>
                    <ShoppingBag size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Your bag is empty.</p>
                    <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Sign in to see if you have any saved items.</p>
                  </div>
                  <button onClick={closeCart}
                    className="mt-4 px-8 py-3 rounded-full text-[14px] font-bold text-white transition-transform hover:scale-105"
                    style={{ background: 'var(--accent)' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map(item => (
                    <motion.div key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      className="flex gap-4 p-4 rounded-2xl"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      {/* Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: 'var(--bg-primary)' }}>
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.name}</p>
                          <p className="text-[15px] font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        {/* Qty controls & Remove */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-3">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all border border-transparent"
                              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                              <Minus size={12} />
                            </button>
                            <span className="text-[14px] font-semibold w-4 text-center" style={{ color: 'var(--text-primary)' }}>
                              {item.quantity}
                            </span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all border border-transparent"
                              style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                              <Plus size={12} />
                            </button>
                          </div>
                          <button onClick={() => removeItem(item.id)}
                            className="text-[13px] font-semibold transition-colors"
                            style={{ color: 'var(--accent)' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout Section (Always visible) */}
            {items.length > 0 && (
              <div className="flex-shrink-0 px-6 py-5 bg-bg-card" style={{ borderTop: '1px solid var(--border)' }}>
                {/* Totals */}
                <div className="space-y-2 mb-5">
                  <div className="flex justify-between text-[14px]">
                    <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-[14px]">
                    <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
                    <span style={{ color: shipping === 0 ? 'var(--text-primary)' : 'var(--text-primary)', fontWeight: 500 }}>
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <span className="text-[18px] font-semibold" style={{ color: 'var(--text-primary)' }}>Total</span>
                    <span className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
                <Link href="/checkout" onClick={closeCart}>
                  <button className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-[16px] font-semibold text-white transition-transform hover:scale-[1.02]"
                    style={{ background: 'var(--accent)' }}>
                    Check Out
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
