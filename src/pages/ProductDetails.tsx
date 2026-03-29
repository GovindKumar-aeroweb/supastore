import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { mockProducts } from '../lib/mockData';
import { ProductReviews } from '../components/ProductReviews';
import { StarRating } from '../components/StarRating';

export function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      try {
        // Fast fallback if no Supabase URL is configured
        if (!import.meta.env.VITE_SUPABASE_URL) {
          const mockProduct = mockProducts.find(p => p.slug === slug);
          setProduct(mockProduct || null);
          setLoading(false);
          return;
        }

        const fetchPromise = supabase
          .from('products')
          .select('*, reviews(rating)')
          .eq('slug', slug)
          .single();
          
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );

        let { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        // If the reviews table doesn't exist yet, retry without fetching reviews
        if (error && error.message && error.message.includes('reviews')) {
          const retryPromise = supabase.from('products').select('*').eq('slug', slug).single();
          const retryResult = await Promise.race([retryPromise, timeoutPromise]) as any;
          data = retryResult.data;
          error = retryResult.error;
        }

        if (error) throw error;
        
        if (data) {
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        const mockProduct = mockProducts.find(p => p.slug === slug);
        setProduct(mockProduct || null);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse flex flex-col md:flex-row gap-8">
          <div className="bg-[#fdfbf7] h-96 w-full md:w-1/2 rounded-2xl border border-[#b8860b]/10"></div>
          <div className="w-full md:w-1/2 space-y-4 py-8">
            <div className="h-10 bg-[#fdfbf7] rounded-xl w-3/4 border border-[#b8860b]/10"></div>
            <div className="h-8 bg-[#fdfbf7] rounded-xl w-1/4 border border-[#b8860b]/10"></div>
            <div className="h-32 bg-[#fdfbf7] rounded-xl w-full border border-[#b8860b]/10"></div>
            <div className="h-14 bg-[#fdfbf7] rounded-xl w-1/2 border border-[#b8860b]/10"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-3xl font-serif font-bold text-[#3e2723]">Product not found</h2>
        <Link to="/shop" className="text-[#b8860b] hover:text-[#a0740a] mt-4 inline-block font-medium">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/shop" className="inline-flex items-center text-sm text-[#8d6e63] hover:text-[#b8860b] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shop
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 bg-[#fdfbf7]">
          <img
            src={product.image_url || 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
            alt={product.title}
            className="w-full h-full object-cover min-h-[500px]"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
        </div>
        <div className="p-8 md:p-12 lg:p-16 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-[#3e2723] leading-tight">
            {product.title}
          </h1>
          
          {product.reviews && product.reviews.length > 0 && (
            <div className="mt-4">
              <StarRating 
                rating={product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length} 
                count={product.reviews.length} 
              />
            </div>
          )}

          <p className="mt-6 text-3xl font-semibold text-[#b8860b]">
            ${product.price.toFixed(2)}
          </p>
          <div className="mt-8">
            <h3 className="sr-only">Description</h3>
            <p className="text-lg text-[#8d6e63] whitespace-pre-line leading-relaxed">
              {product.description}
            </p>
          </div>
          <div className="mt-12">
            {product.in_stock === false ? (
              <button
                onClick={() => navigate(`/preorder/${product.slug}`)}
                className="w-full bg-[#b8860b] border border-transparent rounded-xl py-4 px-8 flex items-center justify-center text-lg font-semibold text-white hover:bg-[#a0740a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8860b] transition-colors shadow-lg shadow-[#b8860b]/20"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                Pre-order
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="w-full bg-[#b8860b] border border-transparent rounded-xl py-4 px-8 flex items-center justify-center text-lg font-semibold text-white hover:bg-[#a0740a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8860b] transition-colors shadow-lg shadow-[#b8860b]/20"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={product.id} />
    </div>
  );
}
