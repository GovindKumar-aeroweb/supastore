import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Shield, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, signOut, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 pt-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#fdfbf7]/90 backdrop-blur-md rounded-full px-6 py-3 flex justify-between items-center shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
              <span className="text-xl">🍯</span>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-medium leading-none mb-1">Luxury Raw Honey</p>
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-serif font-bold text-[#3e2723] leading-none">Herbal Harmony</span>
              </Link>
              <p className="text-[10px] tracking-wider text-gray-500 font-medium leading-none mt-1">BY GUNARSA AGRO</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-[#3e2723] hover:text-[#b8860b] text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              to="/shop"
              className="text-[#3e2723] hover:text-[#b8860b] text-sm font-medium transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/about"
              className="text-[#3e2723] hover:text-[#b8860b] text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              to="/reviews"
              className="text-[#3e2723] hover:text-[#b8860b] text-sm font-medium transition-colors"
            >
              Reviews
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-48 sm:w-64 pl-4 pr-10 py-2 rounded-full border border-[#b8860b]/30 focus:outline-none focus:ring-2 focus:ring-[#b8860b] text-sm bg-white"
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 text-gray-400 hover:text-[#3e2723]"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
            <Link
              to="/cart"
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#b8860b] rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors"
                    title="Admin Dashboard"
                  >
                    <Shield className="h-5 w-5" />
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors"
                  title="My Profile"
                >
                  <User className="h-5 w-5" />
                </Link>
                <button
                  onClick={signOut}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 text-[#3e2723] hover:text-[#b8860b] transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col font-sans text-[#3e2723]">
      <Navbar />
      <main className="flex-grow w-full">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Herbal Harmony. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
