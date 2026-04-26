'use client';
import { motion } from 'framer-motion';

const sections = [
  { title:'1. Acceptance of Terms', content:'By accessing and using Cold Dog, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our website.' },
  { title:'2. Products & Pricing', content:'We reserve the right to modify prices and product availability at any time. All prices are in Indian Rupees (INR) and include applicable taxes. Prices displayed at checkout are final.' },
  { title:'3. Orders & Payment', content:'Orders are confirmed only after successful payment. We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Razorpay. Orders cannot be cancelled once dispatched.' },
  { title:'4. Shipping & Delivery', content:'Delivery timelines are estimates and not guarantees. We are not liable for delays caused by courier services, natural disasters, or other unforeseen circumstances. Please see our Shipping Policy for full details.' },
  { title:'5. Returns & Refunds', content:'We offer a 30-day return policy for defective or damaged items. Items must be returned in original packaging. Refunds are processed within 5–7 business days after we receive the returned item.' },
  { title:'6. Privacy Policy', content:'We collect personal information (name, email, address) solely to process your orders. We do not sell your data to third parties. Payment information is processed securely by Razorpay and not stored on our servers.' },
  { title:'7. Intellectual Property', content:'All content on this website, including logos, text, and images, is the property of Cold Dog and may not be reproduced without written permission.' },
  { title:'8. Limitation of Liability', content:'Cold Dog is not liable for indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the purchase price of the product.' },
  { title:'9. Governing Law', content:'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.' },
  { title:'10. Contact Us', content:'For any questions about these Terms, email us at legal@colddog.in or contact us through our Contact page.' },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-24" style={{ paddingTop:'80px' }}>
      <div className="px-4 sm:px-6 py-12 max-w-3xl mx-auto">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="mb-10">
          <p className="text-[11px] font-bold tracking-[0.28em] uppercase mb-4" style={{ color:'var(--accent)' }}>— Legal</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', fontWeight:800, letterSpacing:'-0.03em', color:'var(--shop-text)' }}>
            Terms & Conditions
          </h1>
          <p className="mt-4 text-[13px]" style={{ color:'var(--shop-muted)' }}>
            Last updated: January 2025
          </p>
        </motion.div>

        <div className="space-y-6">
          {sections.map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{duration:0.5,delay:i*0.04}}
              className="p-6 rounded-2xl" style={{ background:'var(--shop-card-bg)', border:'1px solid var(--shop-card-border)' }}>
              <h2 className="text-[15px] font-bold mb-3" style={{ color:'var(--shop-text)', fontFamily:'var(--font-display)' }}>{s.title}</h2>
              <p className="text-[13px] leading-relaxed" style={{ color:'var(--shop-sub)' }}>{s.content}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
