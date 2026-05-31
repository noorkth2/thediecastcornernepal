import { Shield, Lock, Eye, FileText } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy',
  description: 'How we handle your data at The Diecast Corner Nepal.'
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-display text-4xl text-white tracking-wide mb-8 text-center uppercase">Privacy Policy</h1>
      
      <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
        <section className="bg-surface-card p-8 rounded-2xl border border-surface-border">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-brand-gold" />
            <h2 className="text-xl font-bold text-white m-0 uppercase tracking-tight">Introduction</h2>
          </div>
          <p>
            At The Diecast Corner Nepal, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information when you visit our website and make a purchase.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-red" /> 1. Information We Collect
          </h2>
          <p>We collect information you provide directly to us when you:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Create an account or update your profile.</li>
            <li>Make a purchase (Name, Email, Phone, Shipping Address).</li>
            <li>Sign up for our waitlist or newsletter.</li>
            <li>Contact our support team.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-red" /> 2. How We Use Your Data
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Process and fulfill your orders.</li>
            <li>Send order confirmations and shipping updates.</li>
            <li>Notify you when items on your waitlist are back in stock.</li>
            <li>Improve our store and customer service.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-red" /> 3. Payment Security
          </h2>
          <p>
            Your payment information is processed securely through our partners (Khalti, eSewa). We do not store your full credit card or wallet credentials on our servers.
          </p>
        </section>

        <section className="bg-surface-elevated p-6 rounded-xl border border-surface-border text-sm italic">
          Last Updated: May 31, 2026. For any questions regarding your privacy, please contact us at <span className="text-brand-gold">thediecastcornernepal@gmail.com</span>.
        </section>
      </div>
    </div>
  )
}
