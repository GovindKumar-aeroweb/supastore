import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

export function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Shop All Products</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 h-80">
              <div className="bg-gray-200 h-48 rounded-md mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
            >
              <Link to={`/product/${product.slug}`} className="block relative h-48">
                <img
                  src={product.image_url || 'https://via.placeholder.com/400'}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </Link>
              <div className="p-4 flex flex-col flex-grow gap-2">
                <Link to={`/product/${product.slug}`}>
                  <h3 className="text-lg font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">
                    {product.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                <p className="text-xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock_quantity < 1}
                  className="mt-auto w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No active products found.</p>
        </div>
      )}
    </div>
  );
}
