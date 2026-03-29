import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Order, OrderItem } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Package, ChevronDown, ChevronUp, User as UserIcon, Mail, Calendar } from 'lucide-react';
import { mockProducts } from '../lib/mockData';

type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export function Profile() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (!import.meta.env.VITE_SUPABASE_URL) {
          // Provide mock orders if Supabase is not configured
          const mockOrder: OrderWithItems = {
            id: 'mock-order-1',
            user_id: user.id,
            status: 'processing',
            total: mockProducts[0].price * 2,
            name: user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: '1234567890',
            address: '123 Mock St',
            state: 'Mock State',
            district: 'Mock District',
            pincode: '12345',
            payment_method: 'cod',
            created_at: new Date().toISOString(),
            order_items: [
              {
                id: 'mock-item-1',
                order_id: 'mock-order-1',
                product_id: mockProducts[0].id,
                quantity: 2,
                price: mockProducts[0].price,
                product: mockProducts[0]
              }
            ]
          };
          setOrders([mockOrder]);
          setLoading(false);
          return;
        }

        const fetchPromise = supabase
          .from('orders')
          .select(`
            *,
            order_items (
              *,
              product:products (*)
            )
          `)
          .or(`user_id.eq.${user.id},email.eq.${user.email}`)
          .order('created_at', { ascending: false });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Network timeout')), 3000)
        );

        const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const toggleOrder = (orderId: string) => {
    setExpandedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  if (!user) {
    return (
      <div className="text-center py-24">
        <h2 className="text-3xl font-serif font-bold text-[#3e2723] mb-4">Please log in to view your profile</h2>
        <Link to="/login" className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-semibold rounded-xl shadow-lg shadow-[#b8860b]/20 text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-10 text-center">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Details Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 p-8 sticky top-24">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 bg-[#fdfbf7] rounded-full flex items-center justify-center border-2 border-[#b8860b]/20 mb-4">
                <UserIcon className="h-10 w-10 text-[#b8860b]" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#3e2723]">
                {user.email?.split('@')[0] || 'User'}
              </h2>
            </div>
            
            <div className="space-y-4 border-t border-[#b8860b]/10 pt-6">
              <div className="flex items-center text-[#8d6e63]">
                <Mail className="h-5 w-5 mr-3 text-[#b8860b]" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center text-[#8d6e63]">
                <Calendar className="h-5 w-5 mr-3 text-[#b8860b]" />
                <span>Joined {new Date(user.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-[#b8860b]/10 p-6 sm:p-8">
            <div className="flex items-center mb-8">
              <Package className="h-6 w-6 text-[#b8860b] mr-3" />
              <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Order History</h2>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-[#fdfbf7] rounded-2xl p-6 h-24 border border-[#b8860b]/10"></div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrders.has(order.id);
                  return (
                    <div key={order.id} className="border border-[#b8860b]/20 rounded-2xl overflow-hidden transition-all duration-200">
                      {/* Order Header (Clickable) */}
                      <button
                        onClick={() => toggleOrder(order.id)}
                        className="w-full px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between bg-[#fdfbf7] hover:bg-[#fdfbf7]/80 transition-colors text-left"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3 sm:mb-0">
                          <div>
                            <p className="text-xs text-[#8d6e63] uppercase tracking-wider font-semibold mb-1">Date</p>
                            <p className="font-medium text-[#3e2723]">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="hidden sm:block w-px h-8 bg-[#b8860b]/20"></div>
                          <div>
                            <p className="text-xs text-[#8d6e63] uppercase tracking-wider font-semibold mb-1">Total</p>
                            <p className="font-medium text-[#b8860b]">${order.total.toFixed(2)}</p>
                          </div>
                          <div className="hidden sm:block w-px h-8 bg-[#b8860b]/20"></div>
                          <div>
                            <p className="text-xs text-[#8d6e63] uppercase tracking-wider font-semibold mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize inline-block
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                                'bg-gray-100 text-gray-800'}`}
                            >
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                          <span className="text-sm font-medium text-[#8d6e63] sm:mr-3">Order #{order.id.slice(0, 8)}</span>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-[#b8860b]" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-[#b8860b]" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Order Details */}
                      {isExpanded && (
                        <div className="px-6 py-4 bg-white border-t border-[#b8860b]/10">
                          <h4 className="text-sm font-bold text-[#3e2723] mb-4">Order Items</h4>
                          <ul className="divide-y divide-[#b8860b]/10">
                            {order.order_items.map((item) => (
                              <li key={item.id} className="py-4 flex items-center">
                                <div className="flex-shrink-0 w-16 h-16 border border-[#b8860b]/20 rounded-xl overflow-hidden bg-[#fdfbf7]">
                                  <img
                                    src={item.product?.image_url || 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                                    alt={item.product?.title || 'Product'}
                                    className="w-full h-full object-center object-cover"
                                    referrerPolicy="no-referrer"
                                    loading="lazy"
                                  />
                                </div>
                                <div className="ml-4 flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-bold text-[#3e2723]">
                                      <Link to={`/product/${item.product?.slug}`} className="hover:text-[#b8860b] transition-colors">
                                        {item.product?.title || 'Unknown Product'}
                                      </Link>
                                    </h4>
                                    <p className="text-sm font-bold text-[#b8860b]">${item.price.toFixed(2)}</p>
                                  </div>
                                  <p className="mt-1 text-sm text-[#8d6e63]">Qty: {item.quantity}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="mt-6 pt-4 border-t border-[#b8860b]/10 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-bold text-[#3e2723] mb-1">Shipping Address</p>
                              <p className="text-[#8d6e63]">{order.name}</p>
                              <p className="text-[#8d6e63]">{order.address}</p>
                              <p className="text-[#8d6e63]">{order.district}, {order.state} {order.pincode}</p>
                            </div>
                            <div>
                              <p className="font-bold text-[#3e2723] mb-1">Payment Method</p>
                              <p className="text-[#8d6e63] uppercase">{order.payment_method}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-[#fdfbf7] rounded-2xl border border-[#b8860b]/10">
                <Package className="mx-auto h-12 w-12 text-[#b8860b]/40 mb-4" />
                <h3 className="text-xl font-serif font-bold text-[#3e2723] mb-2">No orders yet</h3>
                <p className="text-[#8d6e63] mb-6">When you place an order, it will appear here.</p>
                <Link
                  to="/shop"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
