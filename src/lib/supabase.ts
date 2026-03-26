import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'customer' | 'admin';
  created_at: string;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  image_url: string | null;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  payment_method: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product | null;
};
