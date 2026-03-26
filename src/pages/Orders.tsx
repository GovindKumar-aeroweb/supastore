import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase, Order, OrderItem } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchOrders() {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        const loadedOrders = ordersData || [];
        setOrders(loadedOrders);

        if (loadedOrders.length > 0) {
          const orderIds = loadedOrders.map((order) => order.id);
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, quantity, price, product:products(*)')
            .in('order_id', orderIds);

          if (itemsError) throw itemsError;

          const grouped = (itemsData || []).reduce((acc: Record<string, OrderItem[]>, item: any) => {
            if (!acc[item.order_id]) acc[item.order_id] = [];
            acc[item.order_id].push(item);
            return acc;
          }, {});

          setOrderItems(grouped);
        } else {
          setOrderItems({});
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return <div className="text-center py-12">Loading your orders...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <h1 className="text-3xl font-extrabold text-gray-900">My Orders</h1>
        <button onClick={() => navigate('/shop')} className="text-indigo-600 hover:text-indigo-700">Continue Shopping</button>
      </div>

      {location.state?.message && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 text-green-700 text-sm">
          {location.state.message}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">You have no orders yet</h2>
          <p className="text-gray-500 mb-6">Once you checkout, your orders will show up here.</p>
          <button onClick={() => navigate('/shop')} className="inline-flex items-center px-6 py-3 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium text-gray-900 break-all">{order.id}</p>
                  <p className="text-sm text-gray-500 mt-2">Placed on {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="inline-flex mt-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1 uppercase">
                    {order.status}
                  </span>
                  <p className="mt-3 text-lg font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {(orderItems[order.id] || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                    <img
                      src={item.product?.image_url || 'https://via.placeholder.com/96'}
                      alt={item.product?.title || 'Product'}
                      className="w-20 h-20 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product?.title || 'Product removed'}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
