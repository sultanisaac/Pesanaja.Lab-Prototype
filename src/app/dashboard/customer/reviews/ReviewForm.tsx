'use client'

import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { submitReview } from './actions'
import { cn } from '@/lib/utils'

export function ReviewForm({ bookingId, businessId }: { bookingId: string, businessId: string }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a star rating')
      return
    }

    const words = comment.trim().split(/\s+/)
    if (comment.trim() && words.length > 150) {
      setError('Review must be 150 words or less.')
      return
    }

    setLoading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('booking_id', bookingId)
    formData.append('business_id', businessId)
    formData.append('rating', rating.toString())
    formData.append('comment', comment)

    const result = await submitReview(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4 border-t border-border pt-4">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
          {error}
        </div>
      )}
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none"
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors',
                  (hoverRating || rating) >= star ? 'fill-warning text-warning' : 'fill-muted text-muted'
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 flex justify-between">
          <span>Review Comment (Optional)</span>
          <span className={cn("text-xs", comment.trim().split(/\s+/).length > 150 ? "text-destructive" : "text-muted-foreground")}>
            {comment.trim() ? comment.trim().split(/\s+/).length : 0} / 150 words
          </span>
        </label>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your experience?"
          className="w-full p-3 text-sm rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit Review
      </button>
    </form>
  )
}
