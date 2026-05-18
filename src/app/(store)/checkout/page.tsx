'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Loader2, ShieldCheck, MapPin, Package, CreditCard } from 'lucide-react'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { formatPrice } from '@/lib/utils'
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING, NEPAL_CITIES, PAYMENT_METHODS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, totalItems, clearCart } = useCartStore()
  const { addToast } = useUIStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [paymentSettings, setPaymentSettings] = useState<Record<string, boolean>>({
    cod: true,
    khalti: false,
    esewa: false,
  })

  const total = totalPrice()
  const count = totalItems()
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
  const grand = total + shipping

  useEffect(() => {
    setIsMounted(true)
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items.length, router])

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        name: '',
        phone: '',
        address: '',
        city: 'Kathmandu',
        landmark: '',
      },
      paymentMethod: 'cod',
      notes: '',
      items: [],
    },
  })

  // Synchronize form items with cart items
  useEffect(() => {
    if (items.length > 0) {
      form.setValue(
        'items',
        items.map((i) => ({
          product_id: i.product.id,
          product_title: i.product.title,
          product_image: i.product.image || '',
          product_brand: i.product.brand || null,
          quantity: i.quantity,
          unit_price: i.product.price,
        }))
      )
    }
  }, [items, form])

  // Fetch active payment settings from site_settings
  useEffect(() => {
    const supabase = createClient()
    async function loadPaymentSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['payment_cod_enabled', 'payment_khalti_enabled', 'payment_esewa_enabled'])
      
      if (data && data.length > 0) {
        const settings: Record<string, boolean> = {
          cod: true,
          khalti: false,
          esewa: false,
        }
        data.forEach((row) => {
          if (row.key === 'payment_cod_enabled') settings.cod = row.value === 'true'
          if (row.key === 'payment_khalti_enabled') settings.khalti = row.value === 'true'
          if (row.key === 'payment_esewa_enabled') settings.esewa = row.value === 'true'
        })
        setPaymentSettings(settings)

        // If the current payment method is disabled, auto-switch to the first enabled one
        const currentMethod = form.getValues('paymentMethod')
        if (!settings[currentMethod as keyof typeof settings]) {
          const firstEnabled = Object.keys(settings).find((k) => settings[k])
          if (firstEnabled) {
            form.setValue('paymentMethod', firstEnabled as any)
          }
        }
      }
    }
    loadPaymentSettings()
  }, [form])

  const onSubmit = async (data: CheckoutInput) => {
    try {
      setIsSubmitting(true)
      
      // Create Order
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      const resData = await res.json()
      
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to place order')
      }
      
      const { order } = resData
      
      // Handle Payment Redirects
      if (data.paymentMethod === 'khalti') {
        const khaltiRes = await fetch('/api/payment/khalti/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            amount: grand,
            orderCode: order.order_code,
          }),
        })
        const khaltiData = await khaltiRes.json()
        if (!khaltiRes.ok) throw new Error(khaltiData.error || 'Khalti error')
        
        clearCart()
        window.location.href = khaltiData.payment_url
        return
      }
      
      // Default / COD / eSewa (unimplemented) goes directly to success
      clearCart()
      router.push(`/order/success/${order.id}`)
      
    } catch (error: any) {
      addToast({ message: error.message || 'Something went wrong', type: 'error' })
      setIsSubmitting(false)
    }
  }

  const dynamicPaymentMethods = PAYMENT_METHODS.map((method) => {
    const isEnabled = paymentSettings[method.id as keyof typeof paymentSettings] ?? false
    return {
      ...method,
      disabled: !isEnabled,
      label: isEnabled ? method.label.replace(' (Coming Soon)', '') : method.label,
    }
  })

  if (!isMounted || items.length === 0) return null

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/cart" className="inline-flex items-center gap-2 text-text-muted hover:text-white mb-6 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </Link>
      
      <h1 className="font-display text-4xl text-white tracking-wide mb-8">SECURE CHECKOUT</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-6">
          {/* Shipping Address */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6 shadow-lg shadow-black/20">
            <h2 className="flex items-center gap-2 font-display text-xl text-white tracking-wide mb-5">
              <MapPin className="w-5 h-5 text-brand-red" /> Shipping Address
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-text-muted">Full Name <span className="text-brand-red">*</span></label>
                <input
                  {...form.register('shippingAddress.name')}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="e.g. John Doe"
                />
                {form.formState.errors.shippingAddress?.name && (
                  <p className="text-brand-red text-xs">{form.formState.errors.shippingAddress.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-muted">Phone Number <span className="text-brand-red">*</span></label>
                <input
                  {...form.register('shippingAddress.phone')}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="e.g. 9800000000"
                />
                {form.formState.errors.shippingAddress?.phone && (
                  <p className="text-brand-red text-xs">{form.formState.errors.shippingAddress.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-muted">City <span className="text-brand-red">*</span></label>
                <select
                  {...form.register('shippingAddress.city')}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors appearance-none"
                >
                  {NEPAL_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {form.formState.errors.shippingAddress?.city && (
                  <p className="text-brand-red text-xs">{form.formState.errors.shippingAddress.city.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-text-muted">Street Address <span className="text-brand-red">*</span></label>
                <input
                  {...form.register('shippingAddress.address')}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="e.g. Baneshwor, House No 123"
                />
                {form.formState.errors.shippingAddress?.address && (
                  <p className="text-brand-red text-xs">{form.formState.errors.shippingAddress.address.message}</p>
                )}
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-text-muted">Nearest Landmark (Optional)</label>
                <input
                  {...form.register('shippingAddress.landmark')}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-red transition-colors"
                  placeholder="e.g. Near Nabil Bank"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6 shadow-lg shadow-black/20">
            <h2 className="flex items-center gap-2 font-display text-xl text-white tracking-wide mb-5">
              <CreditCard className="w-5 h-5 text-brand-red" /> Payment Method
            </h2>
            <div className="space-y-3">
              {dynamicPaymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    method.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${
                    form.watch('paymentMethod') === method.id
                      ? 'border-brand-red bg-brand-red/5'
                      : 'border-surface-border bg-surface-elevated hover:bg-surface-border'
                  }`}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="radio"
                      value={method.id}
                      {...form.register('paymentMethod')}
                      disabled={method.disabled}
                      className="w-4 h-4 text-brand-red bg-surface-card border-surface-border focus:ring-brand-red focus:ring-offset-surface-card disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-text-primary">{method.label}</span>
                      {method.logo && (
                        <div className="bg-white px-2 py-1 rounded flex items-center justify-center min-w-[50px] h-[28px]">
                          <Image 
                            src={method.logo} 
                            alt={method.label} 
                            width={60} 
                            height={24} 
                            className={`w-auto object-contain ${method.id === 'khalti' ? 'h-3.5' : 'h-4'}`} 
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mt-1">{method.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {form.formState.errors.paymentMethod && (
              <p className="text-brand-red text-xs mt-2">{form.formState.errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-surface-card rounded-xl border border-surface-border p-6 shadow-lg shadow-black/20">
            <h2 className="font-display text-xl text-white tracking-wide mb-4">Order Notes (Optional)</h2>
            <textarea
              {...form.register('notes')}
              rows={3}
              className="w-full bg-surface-elevated border border-surface-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-red transition-colors"
              placeholder="Any special instructions for delivery..."
            />
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-surface-card rounded-xl border border-surface-border overflow-hidden shadow-lg shadow-black/20">
            <div className="p-6 border-b border-surface-border">
              <h2 className="flex items-center gap-2 font-display text-xl text-white tracking-wide">
                <Package className="w-5 h-5 text-brand-red" /> Order Summary
              </h2>
            </div>
            
            {/* Items List */}
            <div className="p-6 border-b border-surface-border max-h-[300px] overflow-y-auto space-y-4 scrollbar-hide">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-[#1a1a1a] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                    <Image src={product.image || '/placeholder-car.jpg'} alt={product.title} width={64} height={64} className="object-contain p-1 w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-tight">{product.title}</h3>
                    <p className="text-xs text-text-faint mt-1">Qty: {quantity}</p>
                  </div>
                  <div className="text-sm font-semibold text-brand-gold flex-shrink-0">
                    {formatPrice(product.price * quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="p-6 space-y-3 bg-surface-elevated">
              <div className="flex justify-between text-sm text-text-muted">
                <span>Subtotal ({count} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-text-muted">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-400 font-medium">FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-surface-border">
                <span>Total</span>
                <span className="text-brand-gold">{formatPrice(grand)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-6 py-4 rounded-xl bg-brand-red hover:bg-brand-red-light text-white font-bold text-lg transition-colors shadow-lg shadow-brand-red/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Processing...</>
                ) : (
                  `Pay ${formatPrice(grand)}`
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-text-faint font-medium">
                <ShieldCheck className="w-4 h-4 text-green-400" />
                Secure Checkout & Payment Encryption
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
