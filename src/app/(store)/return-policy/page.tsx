import { RefreshCcw, CheckCircle, XCircle, Clock } from 'lucide-react'

export const metadata = {
  title: 'Return & Refund Policy',
  description: 'Learn about returns, refunds, and exchanges at The Diecast Corner Nepal.'
}

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-white tracking-wide mb-8 text-center uppercase">Return & Refund Policy</h1>
      
      <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
        <section className="bg-surface-card p-8 rounded-2xl border border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCcw className="w-6 h-6 text-brand-gold" />
            <h2 className="text-xl font-bold text-white m-0 uppercase tracking-tight">Our Guarantee</h2>
          </div>
          <p>
            We take pride in the quality of our collectibles. If your item arrives damaged or is not as described, we are here to help.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-red" /> 1. Return Window
          </h2>
          <p>You have <strong>7 days</strong> from the date of delivery to request a return or exchange. After 7 days, we unfortunately cannot offer you a refund or exchange.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-brand-red" /> 2. Eligibility for Returns
          </h2>
          <p>To be eligible for a return, your item must be:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Unopened and in its original sealed packaging.</li>
            <li>In the same condition that you received it.</li>
            <li>Accompanied by the original receipt or proof of purchase.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <XCircle className="w-5 h-5 text-brand-red" /> 3. Non-Returnable Items
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Items that have been opened or had their factory seal broken.</li>
            <li>Sale items or items purchased during a "Clearance" event.</li>
            <li>Pre-order items (unless damaged during shipping).</li>
          </ul>
        </section>

        <section className="bg-surface-elevated p-6 rounded-xl border border-surface-border text-sm italic">
          Last Updated: June 1, 2026. To start a return, please email <span className="text-brand-gold">thediecastcornernepal@gmail.com</span> with your order number and photos of the item.
        </section>
      </div>
    </div>
  )
}
