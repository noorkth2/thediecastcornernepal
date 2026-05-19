'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X, Calendar, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import type { Product } from '@/lib/types'
import type { ProductVariant } from '@/lib/types/variant'
import type { PreorderConfig } from '@/lib/types/preorder'
import { formatPrice, getPrimaryImage } from '@/lib/utils'
import { useCartStore } from '@/store/cartStore'
import { useUIStore } from '@/store/uiStore'
import { CountdownTimer } from '../ui/CountdownTimer'

interface PreorderModalProps {
  product: Product
  selectedVariant?: ProductVariant | null
  config: PreorderConfig
  isOpen: boolean
  onClose: () => void
  activePrice: number
}

export function PreorderModal({ product, selectedVariant, config, isOpen, onClose, activePrice }: PreorderModalProps) {
  const { addItem, openCart } = useCartStore()
  const { addToast } = useUIStore()

  const primaryImage = getPrimaryImage(product.images, product.image_url)
  const depositRequired = config.deposit_amount !== null

  const handleConfirmPreorder = () => {
    addItem({
      id: product.id,
      title: `${product.title} (Pre-Order)`,
      slug: product.slug,
      price: config.deposit_amount ?? activePrice,
      image: primaryImage,
      brand: product.brand,
      stock_qty: 100, // Preorders bypass normal stock
      variant_id: selectedVariant?.id,
      variant_label: selectedVariant?.label,
    })
    addToast({ message: 'Pre-order added to cart!', type: 'success' })
    onClose()
    openCart()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg bg-surface-card border border-surface-border rounded-2xl shadow-2xl z-50 animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-surface-elevated text-text-muted hover:text-white hover:bg-brand-red transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <Dialog.Title className="text-xl font-display text-brand-gold tracking-wide mb-6">
              Reserve Your Item
            </Dialog.Title>

            <div className="flex gap-4 mb-6 pb-6 border-b border-surface-border">
              <div className="relative w-24 h-24 bg-surface-base rounded-lg flex-shrink-0 flex items-center justify-center">
                <Image
                  src={primaryImage}
                  alt={product.title}
                  fill
                  className="object-contain p-2"
                  sizes="96px"
                />
              </div>
              <div>
                <h3 className="font-semibold text-white line-clamp-2">{product.title}</h3>
                {selectedVariant && (
                  <p className="text-sm text-brand-red font-medium mt-1">{selectedVariant.label}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-text-muted text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>ETA: {new Date(config.estimated_arrival).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {config.closes_at && (
              <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 rounded-xl flex flex-col items-center">
                <span className="text-brand-red font-semibold text-sm mb-2 uppercase tracking-widest">
                  Reservations Close In
                </span>
                <CountdownTimer targetDate={config.closes_at} />
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Total Price</span>
                <span className="text-white font-semibold">{formatPrice(activePrice)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Required Deposit Today</span>
                <span className="text-brand-gold font-bold text-lg">
                  {formatPrice(config.deposit_amount ?? activePrice)}
                </span>
              </div>
              {depositRequired && (
                <p className="text-xs text-text-faint text-right">
                  Remaining {formatPrice(activePrice - config.deposit_amount!)} due upon arrival
                </p>
              )}
            </div>

            <button
              onClick={handleConfirmPreorder}
              className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-lg shadow-brand-red/20"
            >
              Pay Deposit <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-center text-xs text-text-muted mt-4">
              Pre-order deposits are non-refundable. <a href="#" className="underline hover:text-white">Learn more</a>
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
