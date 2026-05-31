import { Truck, Clock, ShieldCheck, MapPin } from 'lucide-react'

export const metadata = {
  title: 'Shipping & Return Policy',
  description: 'Learn about delivery times and our return process.'
}

export default function ShippingReturnPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-white tracking-wide mb-8 text-center uppercase">Shipping & Returns</h1>
      
      <div className="prose prose-invert max-w-none space-y-10 text-text-muted leading-relaxed">
        {/* Shipping Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-surface-border pb-2 uppercase tracking-tight">
            <Truck className="w-6 h-6 text-brand-gold" /> Shipping Policy
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border">
              <div className="flex items-center gap-2 mb-3 text-white font-bold">
                <Clock className="w-4 h-4 text-brand-red" /> Delivery Timelines
              </div>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Kathmandu Valley: 1–2 business days.</li>
                <li>Major Cities (Pokhara, Butwal, etc.): 2–4 business days.</li>
                <li>Remote Areas: 4–7 business days.</li>
              </ul>
            </div>
            
            <div className="bg-surface-card p-6 rounded-2xl border border-surface-border">
              <div className="flex items-center gap-2 mb-3 text-white font-bold">
                <MapPin className="w-4 h-4 text-brand-red" /> Shipping Rates
              </div>
              <ul className="text-sm space-y-2 list-disc list-inside">
                <li>Standard Shipping: Rs. 150 flat rate.</li>
                <li>Orders over Rs. 5,000: <span className="text-green-400 font-bold uppercase">Free Shipping</span>.</li>
              </ul>
            </div>
          </div>
          
          <p className="text-sm italic">
            * We currently only ship within Nepal. All orders are packed with extra bubble wrap to ensure your collectibles arrive in mint condition.
          </p>
        </div>

        {/* Returns Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3 border-b border-surface-border pb-2 uppercase tracking-tight">
            <ShieldCheck className="w-6 h-6 text-brand-gold" /> Return & Refund Policy
          </h2>
          
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">1. Condition of Returns</h3>
            <p>
              To be eligible for a return, your item must be in the same condition that you received it, <strong>unopened</strong>, and in its original packaging. Returns for "change of mind" are generally not accepted for collectible items.
            </p>

            <h3 className="text-lg font-bold text-text-primary">2. Damaged or Wrong Items</h3>
            <p>
              If you receive a damaged model or the wrong item, please contact us within <strong>24 hours</strong> of delivery with photos of the package. We will arrange a replacement or full refund including shipping costs.
            </p>

            <h3 className="text-lg font-bold text-text-primary">3. Refund Process</h3>
            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed via your original payment method (Khalti/eSewa/Bank Transfer) within 3-5 business days.
            </p>
          </div>
        </div>

        <section className="bg-surface-elevated p-6 rounded-xl border border-surface-border text-sm text-center">
          Questions about your order? Reach us on WhatsApp at <span className="text-brand-gold">+977-9800000000</span>.
        </section>
      </div>
    </div>
  )
}
