# SupaStore Localhost Ready

A Vite + React + Supabase e-commerce starter with:
- customer auth
- product listing
- cart + checkout
- order history
- admin dashboard for products and order status
- row-level security friendly schema

## What was fixed
- replaced hardcoded admin emails with `profiles.role`
- added proper `schema.sql` with RLS policies
- fixed checkout to always insert `user_id = auth.uid()`
- fixed orders page to read only the logged-in user's orders
- added active/inactive and stock fields to products
- removed the broken AI Studio README leftovers
- added a 404 page

## Run on localhost
1. Install Node.js 20+.
2. In the project folder run:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`.
4. Put your Supabase project values in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. In Supabase, open SQL Editor and run `schema.sql`.
6. Start the app:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:3000`

## Make an admin user
1. Register normally in the app.
2. In Supabase SQL Editor run:
   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'your-admin@example.com';
   ```
3. Log out and log back in.
4. The shield icon / `/admin` route will work.

## Important tables
- `profiles`
- `products`
- `orders`
- `order_items`

## Notes
- Product images currently use image URLs. That keeps local setup simple.
- The admin dashboard expects the logged-in user to have `profiles.role = 'admin'`.
- Public users only see active products.
- Customers only see and create their own orders.

## Suggested next upgrades
- Supabase Storage uploads for product images
- category filters and search
- payment gateway integration
- invoice PDF export
- better stock deduction on checkout
