import React, { useEffect, useState } from 'react';
import { supabase, Review } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { StarRating } from './StarRating';
import { Star } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    async function fetchReviewsAndEligibility() {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setLoading(false);
        return;
      }

      try {
        // Fetch reviews
        const fetchPromise = supabase
          .from('reviews')
          .select(`
            *,
            user:user_id (
              email
            )
          `)
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );

        const { data: reviewsData, error: reviewsError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // Check eligibility if user is logged in
        if (user) {
          // Has the user already reviewed?
          const hasReviewed = reviewsData?.some(r => r.user_id === user.id);
          
          if (!hasReviewed) {
            // Check if user has a delivered order with this product
            const { data: orderData, error: orderError } = await supabase
              .from('order_items')
              .select(`
                order_id,
                orders!inner(status, user_id)
              `)
              .eq('product_id', productId)
              .eq('orders.user_id', user.id)
              .eq('orders.status', 'delivered')
              .limit(1);

            if (!orderError && orderData && orderData.length > 0) {
              setCanReview(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewsAndEligibility();
  }, [productId, user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !canReview) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            product_id: productId,
            user_id: user.id,
            rating,
            comment: comment.trim() || null,
          }
        ])
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .single();

      if (error) throw error;

      if (data) {
        setReviews([data, ...reviews]);
        setCanReview(false);
        setComment('');
        setRating(5);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="animate-pulse h-32 bg-[#fdfbf7] rounded-2xl mt-12"></div>;
  }

  return (
    <div className="mt-16 border-t border-[#b8860b]/10 pt-12">
      <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-8">Customer Reviews</h2>
      
      <div className="flex items-center gap-4 mb-12 bg-[#fdfbf7] p-6 rounded-2xl border border-[#b8860b]/10">
        <div className="text-5xl font-bold text-[#b8860b]">
          {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
        </div>
        <div>
          <StarRating rating={averageRating} size={24} />
          <p className="text-[#8d6e63] mt-1">Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
        </div>
      </div>

      {canReview && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#b8860b]/20 mb-12">
          <h3 className="text-xl font-serif font-bold text-[#3e2723] mb-6">Write a Review</h3>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3e2723] mb-2">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= (hoverRating || rating)
                          ? 'fill-[#b8860b] text-[#b8860b]'
                          : 'fill-transparent text-[#b8860b]/30'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-[#3e2723] mb-2">
                Review (Optional)
              </label>
              <textarea
                id="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] outline-none transition-all resize-none"
                placeholder="Share your experience with this product..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-[#b8860b] text-white font-semibold rounded-xl hover:bg-[#a0740a] transition-colors disabled:opacity-50 shadow-md shadow-[#b8860b]/20"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl border border-[#b8860b]/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fdfbf7] flex items-center justify-center text-[#b8860b] font-bold border border-[#b8860b]/20">
                    {review.user?.email?.[0].toUpperCase() || 'A'}
                  </div>
                  <div>
                    <p className="font-medium text-[#3e2723]">
                      {review.user?.email ? review.user.email.split('@')[0] : 'Anonymous'}
                    </p>
                    <p className="text-xs text-[#8d6e63]">
                      {new Date(review.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-[#8d6e63] leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-[#8d6e63] italic text-center py-8 bg-[#fdfbf7] rounded-2xl border border-[#b8860b]/10">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
}
