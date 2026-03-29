/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';

// Lazy load pages for better performance on low networks
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Shop = React.lazy(() => import('./pages/Shop').then(module => ({ default: module.Shop })));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails').then(module => ({ default: module.ProductDetails })));
const Cart = React.lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Preorder = React.lazy(() => import('./pages/Preorder').then(module => ({ default: module.Preorder })));
const Login = React.lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = React.lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Orders = React.lazy(() => import('./pages/Orders').then(module => ({ default: module.Orders })));
const Admin = React.lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b8860b]"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
              <Route path="shop" element={<Suspense fallback={<PageLoader />}><Shop /></Suspense>} />
              <Route path="product/:slug" element={<Suspense fallback={<PageLoader />}><ProductDetails /></Suspense>} />
              <Route path="cart" element={<Suspense fallback={<PageLoader />}><Cart /></Suspense>} />
              <Route path="checkout" element={<Suspense fallback={<PageLoader />}><Checkout /></Suspense>} />
              <Route path="preorder/:slug" element={<Suspense fallback={<PageLoader />}><Preorder /></Suspense>} />
              <Route path="login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />
              <Route path="register" element={<Suspense fallback={<PageLoader />}><Register /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
              <Route path="admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

