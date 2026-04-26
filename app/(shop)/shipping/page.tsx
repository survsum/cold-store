'use client';
import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, Package, AlertCircle, CheckCircle2, Phone } from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial:{opacity:0,y:20}, whileInView:{opacity:1,y:0},
  viewport:{once:true}, transition:{duration:0.6,delay,ease:[0.22,1,0.36,1]},
});

const couriers = [
  { name:'Shiprocket', days:'2–4 days',   areas:'Pan India' },
  { name:'Delhivery',  days:'3–5 days',   areas:'Pan India' },
  { name:'BlueDart',   days:'1–3 days',   areas:'Metro cities' },
  { name:'DTDC',       days:'3–6 days',   areas:'Pan India' },
];

const faqs = [
  { q:'When will my order ship?',                    a:'Orders are packed and dispatched within 24 hours of payment confirmation (excluding Sundays and public holidays).' },
  { q:'How do I track my order?',                    a:'You will receive a tracking link via email. You can also visit the Track Order page and enter your order ID.' },
  { q:'Do you ship to all states in India?',         a:'Yes, we ship to all 28 states and 8 union territories across India.' },
  { q:'What if my package is delayed?',              a:'Delays beyond the estimated window are rare. If your package is late, contact us and we will escalate it with the courier immediately.' },
  { q:'Is signature required on delivery?',          a:'Most deliveries do not require a signature. For high-value orders, the courier may request one.' },
];

export default function ShippingPage() {
  return (
    <div className="min-h-screen pb-24" style={{ paddingTop:'80px' }}>
      <div className="px-4 sm:px-6 py-12 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color:'var(--accent)' }}>— Shipping Info</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.5rem,6vw,4.5rem)', fontWeight:800, letterSpacing:'-0.04em', color:'var(--shop-text)', lineHeight:1 }}>
            Shipping<br/><span style={{ color:'var(--accent)', fontStyle:'italic' }}>Policy</span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed max-w-xl" style={{ color:'var(--shop-sub)' }}>
            We ship fast, we ship reliably, and we keep you in the loop every step of the way.
            Here is everything you need to know.
          </p>
        </motion.div>

        {/* Free shipping banner */}
        <motion.div {...fadeUp(0.1)} className="mb-10 p-6 rounded-2xl flex items-center gap-4"
          style={{ background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.25)' }}>
          <CheckCircle2 size={28} style={{ color:'var(--success)', flexShrink:0 }}/>
          <div>
            <p className="font-bold text-[15px]" style={{ color:'var(--success)' }}>Free Shipping on orders over ₹999</p>
            <p className="text-[13px] mt-0.5" style={{ color:'var(--shop-muted)' }}>Standard shipping is ₹99 for orders below ₹999.</p>
          </div>
        </motion.div>

        {/* Delivery times */}
        <motion.div {...fadeUp(0.15)} className="mb-10">
          <h2 className="mb-5" style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--shop-text)' }}>
            Delivery Timelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon:Clock,   label:'Standard Delivery', val:'4–7 business days',  color:'var(--cold-blue)' },
              { icon:Truck,   label:'Express Delivery',  val:'2–3 business days',  color:'var(--accent)'          },
              { icon:MapPin,  label:'Metro Cities',      val:'2–4 business days',  color:'var(--success)'   },
              { icon:Package, label:'Remote Areas',      val:'7–10 business days', color:'var(--warning)'   },
            ].map(item=>(
              <div key={item.label} className="flex items-center gap-4 p-5 rounded-2xl"
                style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${item.color}15` }}>
                  <item.icon size={20} style={{ color:item.color }}/>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color:'var(--shop-muted)' }}>{item.label}</p>
                  <p className="text-[15px] font-bold" style={{ color:'var(--shop-text)' }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Courier partners */}
        <motion.div {...fadeUp(0.2)} className="mb-10">
          <h2 className="mb-5" style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--shop-text)' }}>
            Our Courier Partners
          </h2>
          <div className="overflow-x-auto rounded-2xl" style={{ border:'1px solid var(--shop-card-border)' }}>
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom:'1px solid var(--shop-border)', background:'var(--shop-card-bg)' }}>
                  {['Courier','Est. Delivery','Coverage'].map(h=>(
                    <th key={h} className="py-3 px-5 text-left font-bold uppercase tracking-wider text-[10px]" style={{ color:'var(--shop-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {couriers.map((c,i)=>(
                  <tr key={c.name} style={{ borderBottom:i<couriers.length-1?'1px solid var(--shop-border)':'none' }}>
                    <td className="py-3.5 px-5 font-bold" style={{ color:'var(--shop-text)' }}>{c.name}</td>
                    <td className="py-3.5 px-5" style={{ color:'var(--shop-sub)' }}>{c.days}</td>
                    <td className="py-3.5 px-5" style={{ color:'var(--shop-sub)' }}>{c.areas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Important notes */}
        <motion.div {...fadeUp(0.25)} className="mb-10 p-5 rounded-2xl"
          style={{ background:'var(--warning-light)', border:'1px solid rgba(217,119,6,0.25)' }}>
          <div className="flex items-start gap-3">
            <AlertCircle size={20} style={{ color:'var(--warning)', flexShrink:0, marginTop:2 }}/>
            <div>
              <p className="font-bold text-[14px] mb-2" style={{ color:'var(--warning)' }}>Important Notes</p>
              <ul className="space-y-1.5 text-[13px]" style={{ color:'var(--shop-sub)' }}>
                <li>• Orders placed before 2 PM are dispatched the same day.</li>
                <li>• Delivery timelines are estimates and may vary during peak seasons or festivals.</li>
                <li>• Ensure your address and contact number are correct — incorrect details may delay delivery.</li>
                <li>• We are not responsible for delays caused by courier companies or force majeure events.</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* FAQs */}
        <motion.div {...fadeUp(0.3)}>
          <h2 className="mb-6" style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color:'var(--shop-text)' }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq,i)=>(
              <motion.div key={i} {...fadeUp(0.3+i*0.05)}
                className="p-5 rounded-2xl" style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
                <p className="font-bold text-[14px] mb-2" style={{ color:'var(--shop-text)' }}>{faq.q}</p>
                <p className="text-[13px] leading-relaxed" style={{ color:'var(--shop-sub)' }}>{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div {...fadeUp(0.4)} className="mt-12 p-6 rounded-2xl text-center"
          style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
          <Phone size={24} className="mx-auto mb-3" style={{ color:'var(--accent)' }}/>
          <p className="font-bold text-[15px] mb-1" style={{ color:'var(--shop-text)' }}>Still have questions?</p>
          <p className="text-[13px] mb-4" style={{ color:'var(--shop-muted)' }}>Our support team is here to help you.</p>
          <a href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-bold text-white"
            style={{ background:'var(--accent)' }}>
            Contact Support
          </a>
        </motion.div>
      </div>
    </div>
  );
}
