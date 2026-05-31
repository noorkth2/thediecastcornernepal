'use client'

import { useState } from 'react'
import { Star, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { Review } from '@/lib/types'
import { submitReviewAction } from '@/app/(store)/product/actions'

interface ProductReviewsProps {
  productId: number
  initialReviews: Review[]
  userId?: string
}

export function ProductReviews({ productId, initialReviews, userId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasReviewed = reviews.some(r => r.user_id === userId)
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      await submitReviewAction(productId, rating, comment)
      // Optimistic update or just wait for revalidation? 
      // Since it's a small component, I'll just refresh the local state for immediate feedback
      const newReview: Review = {
        id: Math.random().toString(), // temporary
        product_id: productId,
        user_id: userId,
        rating,
        comment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setReviews([newReview, ...reviews])
      setComment('')
      setRating(5)
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-16 border-t border-surface-border pt-10">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Summary */}
        <div className="lg:w-1/3">
          <h2 className="text-2xl font-display text-white mb-4">CUSTOMER REVIEWS</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="text-5xl font-bold text-brand-gold">{averageRating}</div>
            <div>
              <div className="flex text-brand-gold mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${Number(averageRating) >= s ? 'fill-current' : 'text-surface-border'}`} />
                ))}
              </div>
              <p className="text-text-muted text-sm">{reviews.length} reviews</p>
            </div>
          </div>

          {userId && !hasReviewed && (
            <form onSubmit={handleSubmit} className="bg-surface-card rounded-xl border border-surface-border p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm text-text-muted mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={`transition-colors ${rating >= s ? 'text-brand-gold' : 'text-surface-border'}`}
                    >
                      <Star className={`w-8 h-8 ${rating >= s ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm text-text-muted mb-2">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-surface-elevated border border-surface-border rounded-lg p-3 text-text-primary text-sm focus:border-brand-red outline-none min-h-[100px]"
                  placeholder="What do you think about this model?"
                  required
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs mb-4">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                Submit Review
              </Button>
            </form>
          )}

          {!userId && (
            <div className="bg-surface-card rounded-xl border border-surface-border p-6 text-center">
              <p className="text-text-muted text-sm mb-4">Please log in to share your thoughts.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/login'}>
                Log In
              </Button>
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 space-y-6">
          {reviews.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-surface-border rounded-2xl">
              <MessageSquare className="w-12 h-12 text-surface-border mb-4" />
              <p className="text-text-muted">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-surface-card rounded-xl border border-surface-border p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex text-brand-gold mb-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${review.rating >= s ? 'fill-current' : 'text-surface-border'}`} />
                      ))}
                    </div>
                    <p className="font-semibold text-text-primary">
                      {review.profile?.full_name || 'Anonymous Collector'}
                    </p>
                  </div>
                  <span className="text-xs text-text-faint">{formatDate(review.created_at)}</span>
                </div>
                <p className="text-text-muted text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
