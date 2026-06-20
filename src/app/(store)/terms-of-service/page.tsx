import { Scale, FileText, AlertCircle, HelpCircle } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using The Diecast Corner Nepal.'
}

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-white tracking-wide mb-8 text-center uppercase">Terms of Service</h1>
      
      <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
        <section className="bg-surface-card p-8 rounded-2xl border border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-brand-gold" />
            <h2 className="text-xl font-bold text-white m-0 uppercase tracking-tight">Agreement to Terms</h2>
          </div>
          <p>
            By accessing or using The Diecast Corner Nepal website, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-red" /> 1. Use of Service
          </h2>
          <p>You must be at least 13 years old to use this site. You are responsible for maintaining the confidentiality of your account and password.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-brand-red" /> 2. Pricing and Availability
          </h2>
          <p>All prices are in Nepalese Rupees (NPR). We reserve the right to change prices and availability without notice. In the event of a pricing error, we reserve the right to cancel any orders placed at the incorrect price.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-red" /> 3. Intellectual Property
          </h2>
          <p>All content on this site, including logos, images, and text, is the property of The Diecast Corner Nepal and is protected by copyright laws. You may not use our content without explicit permission.</p>
        </section>

        <section className="bg-surface-elevated p-6 rounded-xl border border-surface-border text-sm italic">
          Last Updated: June 1, 2026. For legal inquiries, please contact <span className="text-brand-gold">thediecastcornernepal@gmail.com</span>.
        </section>
      </div>
    </div>
  )
}
