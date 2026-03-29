import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, Product, Order } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { mockProducts } from '../lib/mockData';

export function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  
  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPage, setOrderPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const ordersPerPage = 10;

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }

    if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAdmin, navigate, activeTab, orderStatusFilter, orderPage]);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setProducts(mockProducts);
        setLoadingProducts(false);
        return;
      }
      
      const fetchPromise = supabase.from('products').select('*').order('created_at', { ascending: false });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(mockProducts);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      if (!import.meta.env.VITE_SUPABASE_URL) {
        setOrders([]);
        setTotalOrders(0);
        setLoadingOrders(false);
        return;
      }
      let query = supabase.from('orders').select('*', { count: 'exact' });
      
      if (orderStatusFilter !== 'all') {
        query = query.eq('status', orderStatusFilter);
      }
      
      const from = (orderPage - 1) * ordersPerPage;
      const to = from + ordersPerPage - 1;
      
      const fetchPromise = query.order('created_at', { ascending: false }).range(from, to);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network timeout')), 3000)
      );
      
      const { data, count, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      
      setOrders(data || []);
      if (count !== null) setTotalOrders(count);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentProduct.id) {
        await supabase.from('products').update(currentProduct).eq('id', currentProduct.id);
      } else {
        // Generate slug from title if not provided
        const slug = currentProduct.slug || currentProduct.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await supabase.from('products').insert([{ ...currentProduct, slug }]);
      }
      setIsEditingProduct(false);
      setCurrentProduct({});
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      // First delete order items due to foreign key constraints
      await supabase.from('order_items').delete().eq('order_id', id);
      // Then delete the order
      await supabase.from('orders').delete().eq('id', id);
      fetchOrders();
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    fetchOrders();
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-serif font-bold text-[#3e2723] mb-8">Admin Dashboard</h1>

      <div className="mb-8 border-b border-[#b8860b]/20">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-[#b8860b] text-[#b8860b]'
                : 'border-transparent text-[#8d6e63] hover:text-[#3e2723] hover:border-[#b8860b]/50'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Manage Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${
              activeTab === 'orders'
                ? 'border-[#b8860b] text-[#b8860b]'
                : 'border-transparent text-[#8d6e63] hover:text-[#3e2723] hover:border-[#b8860b]/50'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Manage Orders
          </button>
        </nav>
      </div>

      {activeTab === 'products' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Products</h2>
            <button
              onClick={() => {
                setCurrentProduct({});
                setIsEditingProduct(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>

          {isEditingProduct && (
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-[#b8860b]/20">
              <h3 className="text-lg font-serif font-bold text-[#3e2723] mb-4">{currentProduct.id ? 'Edit Product' : 'New Product'}</h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-[#3e2723]">Title</label>
                    <input
                      type="text"
                      required
                      value={currentProduct.title || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, title: e.target.value })}
                      className="mt-1 block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#b8860b] focus:border-[#b8860b] sm:text-sm bg-[#fdfbf7]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3e2723]">Slug</label>
                    <input
                      type="text"
                      value={currentProduct.slug || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, slug: e.target.value })}
                      className="mt-1 block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#b8860b] focus:border-[#b8860b] sm:text-sm bg-[#fdfbf7]"
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3e2723]">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={currentProduct.price || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#b8860b] focus:border-[#b8860b] sm:text-sm bg-[#fdfbf7]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#3e2723]">Image URL</label>
                    <input
                      type="url"
                      value={currentProduct.image_url || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, image_url: e.target.value })}
                      className="mt-1 block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#b8860b] focus:border-[#b8860b] sm:text-sm bg-[#fdfbf7]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#3e2723]">Description</label>
                    <textarea
                      rows={3}
                      value={currentProduct.description || ''}
                      onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                      className="mt-1 block w-full border border-[#b8860b]/20 rounded-xl shadow-sm py-2.5 px-3 focus:ring-[#b8860b] focus:border-[#b8860b] sm:text-sm bg-[#fdfbf7]"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="px-4 py-2 border border-[#b8860b]/30 rounded-xl shadow-sm text-sm font-medium text-[#3e2723] bg-white hover:bg-[#fdfbf7] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#b8860b] hover:bg-[#a0740a] transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-[#b8860b]/10">
            <table className="min-w-full divide-y divide-[#b8860b]/10">
              <thead className="bg-[#fdfbf7]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#b8860b]/10">
                {loadingProducts ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-[#8d6e63]">Loading products...</td></tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#fdfbf7]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img className="h-12 w-12 rounded-xl object-cover border border-[#b8860b]/20" src={product.image_url || 'https://via.placeholder.com/48'} alt="" referrerPolicy="no-referrer" loading="lazy" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-[#3e2723]">{product.title}</div>
                          <div className="text-sm text-[#8d6e63]">{product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#b8860b]">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setCurrentProduct(product);
                          setIsEditingProduct(true);
                        }}
                        className="text-[#b8860b] hover:text-[#a0740a] mr-4 transition-colors"
                      >
                        <Edit className="h-5 w-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-5 w-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-serif font-bold text-[#3e2723]">Orders Management</h2>
            <div className="flex items-center space-x-4 bg-white p-2 rounded-xl border border-[#b8860b]/20 shadow-sm w-full sm:w-auto">
              <label htmlFor="status-filter" className="text-sm font-bold text-[#8d6e63] whitespace-nowrap pl-2">Filter:</label>
              <select
                id="status-filter"
                value={orderStatusFilter}
                onChange={(e) => {
                  setOrderStatusFilter(e.target.value);
                  setOrderPage(1);
                }}
                className="block w-full pl-3 pr-10 py-2 text-sm border-none focus:ring-0 bg-transparent text-[#3e2723] font-medium cursor-pointer"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="bg-white shadow-sm rounded-2xl overflow-hidden border border-[#b8860b]/10">
            <table className="min-w-full divide-y divide-[#b8860b]/10">
              <thead className="bg-[#fdfbf7]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Update Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#8d6e63] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#b8860b]/10">
                {loadingOrders ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-[#8d6e63]">Loading orders...</td></tr>
                ) : orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#fdfbf7]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#8d6e63]">{order.id.slice(0, 8)}...</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#3e2723]">{order.name}</div>
                      <div className="text-sm text-[#8d6e63]">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#b8860b]">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="mt-1 block w-full pl-3 pr-8 py-2 text-sm border border-[#b8860b]/20 focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent rounded-xl bg-[#fdfbf7] text-[#3e2723]"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-500 hover:text-red-700 transition-colors p-2 hover:bg-red-50 rounded-lg"
                        title="Delete Order"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loadingOrders && totalOrders > 0 && (
            <div className="bg-white px-6 py-4 flex items-center justify-between border border-[#b8860b]/10 mt-6 rounded-2xl shadow-sm">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-[#8d6e63]">
                    Showing <span className="font-bold text-[#3e2723]">{(orderPage - 1) * ordersPerPage + 1}</span> to <span className="font-bold text-[#3e2723]">{Math.min(orderPage * ordersPerPage, totalOrders)}</span> of{' '}
                    <span className="font-bold text-[#3e2723]">{totalOrders}</span> orders
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px overflow-hidden border border-[#b8860b]/20" aria-label="Pagination">
                    <button
                      onClick={() => setOrderPage(p => Math.max(1, p - 1))}
                      disabled={orderPage === 1}
                      className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-[#3e2723] hover:bg-[#fdfbf7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-[#b8860b]/20"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setOrderPage(p => p + 1)}
                      disabled={orderPage * ordersPerPage >= totalOrders}
                      className="relative inline-flex items-center px-4 py-2 bg-white text-sm font-medium text-[#3e2723] hover:bg-[#fdfbf7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
