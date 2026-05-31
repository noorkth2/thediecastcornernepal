import Link from 'next/link'
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FailurePageProps {
  searchParams: Promise<{ orderId?: string; error?: string; status?: string }>
}

export default async function OrderFailurePage(props: FailurePageProps) {
  const searchParams = await props.searchParams
  const { orderId, error, status } = searchParams

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
      </div>

      <h1 className="font-display text-4xl text-white tracking-wide mb-4">
        PAYMENT FAILED
      </h1>
      
      <p className="text-text-muted mb-8 leading-relaxed">
        Something went wrong while processing your payment. 
        {error && <span className="block mt-2 font-mono text-red-400 text-sm">Error: {error}</span>}
        {status && <span className="block mt-1 font-mono text-red-400 text-sm">Status: {status}</span>}
      </p>

      <div className="bg-surface-elevated rounded-2xl border border-surface-border p-6 mb-8 text-left">
        <h2 className="text-white font-bold mb-3 flex items-center gap-2">
          What happened?
        </h2>
        <ul className="text-sm text-text-muted space-y-2 list-disc list-inside">
          <li>The transaction was cancelled by the user.</li>
          <li>Insufficient funds in your digital wallet.</li>
          <li>Connection timeout with the payment gateway.</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button asChild variant="primary" className="w-full sm:w-auto bg-brand-red hover:bg-brand-red-light border-none">
          <Link href="/cart">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <a href="https://wa.me/9779800000000" target="_blank" rel="noreferrer">
            <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
          </a>
        </Button>
      </div>

      {orderId && (
        <p className="mt-8 text-xs text-text-faint">
          Reference Order ID: #{orderId}
        </p>
      )}
    </div>
  )
}
