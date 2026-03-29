import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Filter } from 'lucide-react';
import { mockProducts } from '../lib/mockData';
import { StarRating } from '../components/StarRating';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [availability, setAvailability] = useState<'all' | 'in-stock' | 'pre-order'>('all');

  const productTypes = ['all', 'Raw Honey', 'Infused Honey', 'Comb', 'Gift Set'];
  const priceRanges = [
    { id: 'all', label: 'All Prices' },
    { id: 'under-20', label: 'Under $20', min: 0, max: 20 },
    { id: '20-50', label: '$20 - $50', min: 20, max: 50 },
    { id: 'over-50', label: 'Over $50', min: 50, max: 10000 },
  ];

  useEffect(() => {
    setPage(1);
  }, [searchQuery, priceRange, selectedType, availability]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const from = (page - 1) * productsPerPage;
        const to = from + productsPerPage - 1;
        
        // Fast fallback if no Supabase URL is configured
        if (!import.meta.env.VITE_SUPABASE_URL) {
          let filteredMocks = [...mockProducts];
          
          if (searchQuery) {
            filteredMocks = filteredMocks.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
          }
          if (selectedType !== 'all') {
            const typeQuery = selectedType === 'Gift Set' ? 'Gift' : selectedType;
            filteredMocks = filteredMocks.filter(p => p.title.toLowerCase().includes(typeQuery.toLowerCase()));
          }
          if (availability === 'in-stock') {
            filteredMocks = filteredMocks.filter(p => p.in_stock === true);
          } else if (availability === 'pre-order') {
            filteredMocks = filteredMocks.filter(p => p.in_stock === false);
          }
          if (priceRange !== 'all') {
            const range = priceRanges.find(r => r.id === priceRange);
            if (range) {
              filteredMocks = filteredMocks.filter(p => p.price >= range.min && p.price <= range.max);
            }
          }
          
          setTotalProducts(filteredMocks.length);
          setProducts(filteredMocks.slice(from, to + 1));
          setLoading(false);
          return;
        }

        let query = supabase
          .from('products')
          .select('*, reviews(rating)', { count: 'exact' })
          .order('created_at', { ascending: false });
          
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        if (selectedType !== 'all') {
          // Filter by title to simulate product type filtering
          query = query.ilike('title', `%${selectedType === 'Gift Set' ? 'Gift' : selectedType}%`);
        }

        if (availability === 'in-stock') {
          query = query.eq('in_stock', true);
        } else if (availability === 'pre-order') {
          query = query.eq('in_stock', false);
        }

        if (priceRange !== 'all') {
          const range = priceRanges.find(r => r.id === priceRange);
          if (range) {
            query = query.gte('price', range.min).lte('price', range.max);
          }
        }
        
        // Add a 3-second timeout for low network conditions
        const fetchPromise = query.range(from, to);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );
        
        let { data, count, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        // If the reviews table doesn't exist yet, retry without fetching reviews
        if (error && error.message && error.message.includes('reviews')) {
          let retryQuery = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });
            
          if (searchQuery) retryQuery = retryQuery.ilike('title', `%${searchQuery}%`);
          if (selectedType !== 'all') retryQuery = retryQuery.ilike('title', `%${selectedType === 'Gift Set' ? 'Gift' : selectedType}%`);
          if (availability === 'in-stock') retryQuery = retryQuery.eq('in_stock', true);
          else if (availability === 'pre-order') retryQuery = retryQuery.eq('in_stock', false);
          if (priceRange !== 'all') {
            const range = priceRanges.find(r => r.id === priceRange);
            if (range) retryQuery = retryQuery.gte('price', range.min).lte('price', range.max);
          }
          
          const retryResult = await Promise.race([retryQuery.range(from, to), timeoutPromise]) as any;
          data = retryResult.data;
          count = retryResult.count;
          error = retryResult.error;
        }
          
        if (error) throw error;
        
        // Use the data from Supabase, even if it's empty (user might have deleted all products)
        setProducts(data || []);
        if (count !== null) setTotalProducts(count);
      } catch (error) {
        console.error('Error fetching products:', error);
        
        // Fallback on error
        let filteredMocks = [...mockProducts];
        if (searchQuery) {
          filteredMocks = filteredMocks.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        setTotalProducts(filteredMocks.length);
        setProducts(filteredMocks.slice((page - 1) * productsPerPage, (page - 1) * productsPerPage + productsPerPage));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, searchQuery, priceRange, selectedType, availability]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-4">
          {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop All Products'}
        </h1>
        <p className="text-[#8d6e63] max-w-2xl mx-auto">
          {searchQuery 
            ? `Found ${totalProducts} product${totalProducts === 1 ? '' : 's'} matching your search.`
            : 'Explore our complete collection of premium, sustainably sourced honey.'}
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 bg-white border border-[#b8860b]/20 rounded-xl text-[#3e2723] hover:bg-[#fdfbf7] transition-colors"
        >
          <Filter className="h-5 w-5 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        <div className="text-sm text-[#8d6e63]">
          Showing <span className="font-medium text-[#3e2723]">{totalProducts}</span> results
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#b8860b]/10 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 fade-in duration-200">
          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-[#3e2723] mb-2">Price Range</label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] outline-none transition-all"
            >
              {priceRanges.map(range => (
                <option key={range.id} value={range.id}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-sm font-medium text-[#3e2723] mb-2">Product Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] outline-none transition-all"
            >
              {productTypes.map(type => (
                <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
              ))}
            </select>
          </div>

          {/* Availability Filter */}
          <div>
            <label className="block text-sm font-medium text-[#3e2723] mb-2">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] outline-none transition-all"
            >
              <option value="all">All Availability</option>
              <option value="in-stock">In Stock</option>
              <option value="pre-order">Pre-order</option>
            </select>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl p-4 h-96 shadow-sm border border-[#b8860b]/10">
              <div className="bg-[#fdfbf7] h-56 rounded-xl mb-4"></div>
              <div className="h-6 bg-[#fdfbf7] rounded w-3/4 mb-3"></div>
              <div className="h-5 bg-[#fdfbf7] rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
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
          <p className="text-[#8d6e63] text-lg">No products found.</p>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalProducts > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-[#b8860b]/10 sm:px-6 mt-12 rounded-2xl shadow-sm">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[#8d6e63]">
                Showing <span className="font-medium text-[#3e2723]">{(page - 1) * productsPerPage + 1}</span> to <span className="font-medium text-[#3e2723]">{Math.min(page * productsPerPage, totalProducts)}</span> of{' '}
                <span className="font-medium text-[#3e2723]">{totalProducts}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 rounded-l-xl border border-[#b8860b]/20 bg-white text-sm font-medium text-[#3e2723] hover:bg-[#fdfbf7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * productsPerPage >= totalProducts}
                  className="relative inline-flex items-center px-4 py-2 rounded-r-xl border border-[#b8860b]/20 bg-white text-sm font-medium text-[#3e2723] hover:bg-[#fdfbf7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
