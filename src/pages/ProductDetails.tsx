import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../context/CartContext';

export function ProductDetails() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .eq('is_active', true)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          setError('Product not found.');
          return;
        }
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Unable to load product details.');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (loading) {
    return <div className="text-center py-12">Loading product...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-12 text-red-600">{error || 'Product not found.'}</div>;
  }

  return (
    <div>
      <Link to="/shop" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Shop
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2">
          <img
            src={product.image_url || 'https://via.placeholder.com/800'}
            alt={product.title}
            className="w-full h-full object-cover min-h-[400px]"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-8 md:w-1/2 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{product.title}</h1>
          <p className="mt-4 text-3xl text-gray-900 font-semibold">${product.price.toFixed(2)}</p>
          <p className="mt-2 text-sm text-gray-500">Stock available: {product.stock_quantity}</p>
          <div className="mt-6">
            <p className="text-base text-gray-700 whitespace-pre-line">{product.description}</p>
          </div>
          <div className="mt-10">
            <button
              onClick={() => addToCart(product)}
              disabled={product.stock_quantity < 1}
              className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.stock_quantity < 1 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
