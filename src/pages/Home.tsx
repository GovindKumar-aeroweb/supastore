import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { mockProducts } from '../lib/mockData';
import { StarRating } from '../components/StarRating';

export function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fast fallback if no Supabase URL is configured
        if (!import.meta.env.VITE_SUPABASE_URL) {
          setFeaturedProducts(mockProducts.slice(0, 4));
          setLoading(false);
          return;
        }

        const fetchPromise = supabase
          .from('products')
          .select('*, reviews(rating)')
          .limit(4);
          
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;
        
        if (data && data.length > 0) {
          setFeaturedProducts(data);
        } else {
          setFeaturedProducts(mockProducts.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setFeaturedProducts(mockProducts.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="relative w-full h-screen min-h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Honey background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            fetchPriority="high"
          />
          {/* Subtle overlay to ensure text readability */}
          <div className="absolute inset-0 bg-[#fdfbf7]/30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7]/40 via-transparent to-[#fdfbf7]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mt-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-[#3e2723] leading-[1.1] mb-6 drop-shadow-sm">
            Pure, Raw Honey<br />Straight from the Hive
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-[#3e2723] font-serif italic max-w-2xl mx-auto mb-10 drop-shadow-sm">
            Indulge in the sweet taste of nature's golden elixir — crafted with care, harvested with purity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="px-8 py-4 rounded-xl bg-[#b8860b] text-white font-semibold text-lg hover:bg-[#a0740a] transition-colors shadow-lg shadow-[#b8860b]/20"
            >
              Shop Now
            </Link>
            <Link
              to="/about"
              className="px-8 py-4 rounded-xl bg-[#fdfbf7] text-[#3e2723] font-semibold text-lg hover:bg-white transition-colors shadow-lg"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Features Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-[#fdfbf7]/90 backdrop-blur-sm border-t border-[#b8860b]/20 py-4">
          <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-medium text-[#3e2723]">
            <div className="flex items-center gap-2">
              <span>🍯</span> 100% Pure Organic Honey
            </div>
            <div className="flex items-center gap-2">
              <span>🌸</span> Harvested from Wild Blossoms
            </div>
            <div className="flex items-center gap-2">
              <span>🐝</span> Eco-Friendly Beekeeping
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif font-bold text-[#3e2723] mb-4">
            Our Golden Selection
          </h2>
          <p className="text-[#8d6e63] max-w-2xl mx-auto">
            Discover our range of premium, sustainably sourced honey products.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl p-4 h-96 shadow-sm border border-[#b8860b]/10">
                <div className="bg-[#fdfbf7] h-56 rounded-xl mb-4"></div>
                <div className="h-6 bg-[#fdfbf7] rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-[#fdfbf7] rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-[#b8860b]/10 overflow-hidden flex flex-col transition-all hover:shadow-md hover:-translate-y-1 group"
              >
                <Link to={`/product/${product.slug}`} className="block relative h-64 overflow-hidden bg-[#fdfbf7]">
                  <img
                    src={product.image_url || 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </Link>
                <div className="p-6 flex flex-col flex-grow">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-xl font-serif font-bold text-[#3e2723] hover:text-[#b8860b] line-clamp-2 mb-2 transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  
                  {product.reviews && product.reviews.length > 0 && (
                    <div className="mb-2">
                      <StarRating 
                        rating={product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length} 
                        count={product.reviews.length} 
                      />
                    </div>
                  )}

                  <p className="text-2xl font-semibold text-[#b8860b] mb-6">
                    ${product.price.toFixed(2)}
                  </p>
                  {product.in_stock === false ? (
                    <button
                      onClick={() => navigate(`/preorder/${product.slug}`)}
                      className="mt-auto w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium text-[#3e2723] bg-[#fdfbf7] border border-[#b8860b]/30 hover:bg-[#b8860b] hover:text-white hover:border-[#b8860b] transition-all"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Pre-order
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="mt-auto w-full flex items-center justify-center px-4 py-3 rounded-xl font-medium text-[#3e2723] bg-[#fdfbf7] border border-[#b8860b]/30 hover:bg-[#b8860b] hover:text-white hover:border-[#b8860b] transition-all"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-[#b8860b]/10">
            <p className="text-[#8d6e63] text-lg">Our bees are currently gathering more nectar. Please check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
