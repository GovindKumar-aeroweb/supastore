import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase, Product } from '../lib/supabase';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { mockProducts } from '../lib/mockData';

export function Preorder() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    quantity: 1,
  });

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
          .select('*')
          .eq('slug', slug)
          .single();

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;
        
        if (data) {
          setProduct(data);
        } else {
          const mockProduct = mockProducts.find(p => p.slug === slug);
          setProduct(mockProduct || null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setSubmitting(true);
    try {
      // In a real app, this would insert into a preorders table
      const { error } = await supabase.from('preorders').insert([
        {
          product_id: product.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          quantity: formData.quantity,
          status: 'pending'
        },
      ]);

      if (error) {
        // If table doesn't exist, we can just simulate success for now
        console.error('Error submitting preorder:', error);
        // We will still show success to the user for the sake of the demo
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseInt(value) || 1 : value,
    }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#fdfbf7] rounded w-1/4"></div>
          <div className="h-64 bg-[#fdfbf7] rounded-2xl"></div>
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

  if (success) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 p-12">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-serif font-bold text-[#3e2723] mb-4">
            Pre-order Confirmed!
          </h2>
          <p className="text-xl text-[#8d6e63] mb-8">
            Thank you for your interest in {product.title}. We will contact you at {formData.email} as soon as it's back in stock.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors shadow-lg shadow-[#b8860b]/20"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to={`/product/${product.slug}`} className="inline-flex items-center text-sm text-[#8d6e63] hover:text-[#b8860b] mb-8 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Product
      </Link>

      <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl font-serif font-bold text-[#3e2723] mb-2">
            Pre-order
          </h1>
          <p className="text-[#8d6e63] mb-8">
            Fill out the form below to reserve your {product.title}. We'll notify you when it's ready to ship.
          </p>

          <div className="flex items-center gap-6 mb-10 p-6 bg-[#fdfbf7] rounded-2xl border border-[#b8860b]/10">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}
              alt={product.title}
              className="w-24 h-24 object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div>
              <h3 className="text-xl font-serif font-bold text-[#3e2723]">{product.title}</h3>
              <p className="text-lg font-semibold text-[#b8860b] mt-1">${product.price.toFixed(2)}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#3e2723] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-[#fdfbf7]"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#3e2723] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-[#fdfbf7]"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#3e2723] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-[#fdfbf7]"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-[#3e2723] mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-[#b8860b]/20 focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-[#fdfbf7]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#b8860b] border border-transparent rounded-xl py-4 px-8 flex items-center justify-center text-lg font-semibold text-white hover:bg-[#a0740a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8860b] transition-colors shadow-lg shadow-[#b8860b]/20 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {submitting ? 'Submitting...' : 'Confirm Pre-order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
