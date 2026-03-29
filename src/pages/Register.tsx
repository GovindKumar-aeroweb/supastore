import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Hexagon } from 'lucide-react';

export function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      setError('Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      {/* Left side - Image */}
      <div className="hidden lg:block relative w-1/2 overflow-hidden">
        <div className="absolute inset-0 bg-[#b8860b]/20 mix-blend-multiply z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1587049352851-8d4e89134e5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Honey comb"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3e2723]/80 to-transparent z-20"></div>
        <div className="absolute bottom-12 left-12 right-12 z-30 text-white">
          <h2 className="text-4xl font-serif font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-[#fdfbf7]/90">Create an account to start your journey with nature's finest golden nectar.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#fdfbf7]">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#b8860b]/10 rounded-2xl flex items-center justify-center rotate-12">
                <Hexagon className="w-8 h-8 text-[#b8860b] -rotate-12" />
              </div>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#3e2723]">
              Create an account
            </h2>
            <p className="mt-3 text-[#8d6e63]">
              Sign up to start shopping for premium honey.
            </p>
          </div>
          
          <form className="mt-10 space-y-6" onSubmit={handleRegister}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                <p className="text-sm text-green-700">Registration successful! Redirecting to login...</p>
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="email-address" className="block text-sm font-medium text-[#3e2723] mb-2">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-[#b8860b]/20 rounded-xl placeholder-[#8d6e63]/50 text-[#3e2723] focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#3e2723] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-[#b8860b]/20 rounded-xl placeholder-[#8d6e63]/50 text-[#3e2723] focus:outline-none focus:ring-2 focus:ring-[#b8860b] focus:border-transparent transition-all bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || success}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#b8860b] hover:bg-[#a0740a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8860b] disabled:opacity-50 transition-all shadow-lg shadow-[#b8860b]/20"
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            
            <div className="text-sm text-center mt-8">
              <span className="text-[#8d6e63]">Already have an account? </span>
              <Link to="/login" className="font-bold text-[#b8860b] hover:text-[#a0740a] transition-colors">
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
