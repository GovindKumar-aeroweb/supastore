import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export function Cart() {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-[#b8860b]/10">
          <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-4">Your cart is empty</h2>
          <p className="text-[#8d6e63] mb-8 text-lg">Looks like you haven't added any honey to your cart yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg shadow-[#b8860b]/20 text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 overflow-hidden">
        <div className="px-4 py-8 sm:px-12 sm:py-12">
          <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-10">Shopping Cart</h1>
          
          <div className="flow-root">
            <ul className="-my-6 divide-y divide-[#b8860b]/10">
              {items.map((item) => (
                <li key={item.id} className="py-8 flex">
                  <div className="flex-shrink-0 w-32 h-32 border border-[#b8860b]/20 rounded-2xl overflow-hidden bg-[#fdfbf7]">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                      alt={item.title}
                      className="w-full h-full object-center object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>

                  <div className="ml-6 flex-1 flex flex-col justify-center">
                    <div>
                      <div className="flex justify-between text-xl font-serif font-bold text-[#3e2723]">
                        <h3>
                          <Link to={`/product/${item.slug}`} className="hover:text-[#b8860b] transition-colors">{item.title}</Link>
                        </h3>
                        <p className="ml-4 text-[#b8860b]">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm mt-6">
                      <div className="flex items-center border border-[#b8860b]/20 rounded-xl bg-[#fdfbf7]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-3 text-[#8d6e63] hover:text-[#3e2723] transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-4 font-semibold text-[#3e2723] text-base">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-3 text-[#8d6e63] hover:text-[#3e2723] transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="font-medium text-red-500 hover:text-red-700 flex items-center transition-colors bg-red-50 px-3 py-2 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#b8860b]/10 px-4 py-8 sm:px-12 bg-[#fdfbf7]">
          <div className="flex justify-between text-2xl font-serif font-bold text-[#3e2723] mb-2">
            <p>Subtotal</p>
            <p className="text-[#b8860b]">${total.toFixed(2)}</p>
          </div>
          <p className="mt-2 text-base text-[#8d6e63] mb-8">
            Shipping and taxes calculated at checkout.
          </p>
          <div className="mt-8">
            <Link
              to="/checkout"
              className="flex items-center justify-center px-8 py-4 border border-transparent rounded-xl shadow-lg shadow-[#b8860b]/20 text-lg font-semibold text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors"
            >
              Proceed to Checkout
              <ArrowRight className="ml-3 h-5 w-5" />
            </Link>
          </div>
          <div className="mt-6 flex justify-center text-sm text-center text-[#8d6e63]">
            <p>
              or{' '}
              <Link to="/shop" className="text-[#b8860b] font-semibold hover:text-[#a0740a] transition-colors">
                Continue Shopping<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
