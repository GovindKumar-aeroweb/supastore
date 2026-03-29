import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    state: '',
    district: '',
    pincode: '',
    payment_method: 'COD',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setError('');

    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        // Simulate order placement if Supabase is not configured
        setTimeout(() => {
          clearCart();
          navigate('/orders', { state: { message: 'Order placed successfully! (Mock Mode)' } });
        }, 1000);
        return;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: user?.id || null, // Allow guest checkout if not logged in, or require login. Let's allow guest for now, but save user_id if available.
            status: 'pending',
            total,
            ...formData,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      clearCart();
      navigate('/orders', { state: { message: 'Order placed successfully!' } });
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#b8860b]/10">
          <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-4">Please log in to checkout</h2>
          <p className="text-[#8d6e63] mt-2 text-lg">You need an account to place an order.</p>
          <button onClick={() => navigate('/login')} className="mt-8 inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg shadow-[#b8860b]/20 text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#b8860b]/10">
          <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-4">Your cart is empty</h2>
          <p className="text-[#8d6e63] mt-2 text-lg">Add some honey before proceeding to checkout.</p>
          <button onClick={() => navigate('/shop')} className="mt-8 inline-flex items-center px-8 py-4 border border-[#b8860b]/30 text-lg font-semibold rounded-xl text-[#3e2723] bg-[#fdfbf7] hover:bg-[#b8860b] hover:text-white transition-colors">
            Go to Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-10 text-center">Checkout</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 overflow-hidden">
        <div className="p-6 sm:p-10">
          {error && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-y-8 gap-x-6 sm:grid-cols-2">
              <div className="sm:col-span-2 border-b border-[#b8860b]/10 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Contact Information</h2>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-[#3e2723] mb-2">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#3e2723] mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#3e2723] mb-2">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div className="sm:col-span-2 border-b border-[#b8860b]/10 pb-4 mt-4">
                <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Shipping Address</h2>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="address" className="block text-sm font-semibold text-[#3e2723] mb-2">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  required
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all resize-none"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-[#3e2723] mb-2">State</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div>
                <label htmlFor="district" className="block text-sm font-semibold text-[#3e2723] mb-2">District</label>
                <input
                  type="text"
                  id="district"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-semibold text-[#3e2723] mb-2">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  required
                  value={formData.pincode}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all"
                />
              </div>

              <div className="sm:col-span-2 border-b border-[#b8860b]/10 pb-4 mt-4">
                <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Payment Method</h2>
              </div>

              <div className="sm:col-span-2">
                <select
                  id="payment_method"
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent bg-[#fdfbf7] text-[#3e2723] transition-all appearance-none"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[#b8860b]/10">
              <div className="flex justify-between items-center mb-8 bg-[#fdfbf7] p-6 rounded-2xl border border-[#b8860b]/10">
                <p className="text-xl font-serif font-bold text-[#3e2723]">Total to pay</p>
                <p className="text-3xl font-bold text-[#b8860b]">${total.toFixed(2)}</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-8 border border-transparent rounded-xl shadow-lg shadow-[#b8860b]/20 text-lg font-semibold text-white bg-[#b8860b] hover:bg-[#a0740a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8860b] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
