import { Shield, Truck, Star, Headphones, CreditCard, Package } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: '100% Authentic',
    description: 'Every diecast model is genuine — no fakes, no replicas.',
    color: 'text-brand-red',
    bg: 'bg-brand-red/10 border-brand-red/20',
  },
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    description: 'We deliver across Nepal. Free shipping over Rs. 2,000.',
    color: 'text-brand-orange',
    bg: 'bg-brand-orange/10 border-brand-orange/20',
  },
  {
    icon: Star,
    title: 'Curated Selection',
    description: 'Hand-picked MiniGT, Tomica, Greenlight, and rare collectibles.',
    color: 'text-brand-gold',
    bg: 'bg-brand-gold/10 border-brand-gold/20',
  },
  {
    icon: Headphones,
    title: 'Expert Support',
    description: 'Passionate collectors helping collectors. DM us anytime.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
  },
  {
    icon: CreditCard,
    title: 'Secure Payments',
    description: 'Khalti, eSewa, and Cash on Delivery accepted safely.',
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
  },
  {
    icon: Package,
    title: 'Safe Packaging',
    description: 'Double-bubble wrapped so your models arrive perfect.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20',
  },
]

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-surface-card border-y border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-px w-8 bg-brand-red" />
            <span className="text-brand-red text-xs font-semibold tracking-widest uppercase">
              Why Us
            </span>
            <div className="h-px w-8 bg-brand-red" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-white tracking-wide">
            THE DIECAST CORNER DIFFERENCE
          </h2>
          <p className="text-text-muted text-base mt-3 max-w-xl mx-auto">
            We&apos;re collectors ourselves. We know what you want and how to
            deliver it.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="bg-surface-base rounded-xl p-6 border border-surface-border hover:border-surface-elevated transition-colors group"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-4 ${bg} group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <h3 className="font-semibold text-text-primary mb-1.5">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
