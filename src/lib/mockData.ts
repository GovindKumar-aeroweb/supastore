export const mockProducts = [
  {
    id: '1',
    title: 'Pure Raw Wildflower Honey',
    slug: 'pure-raw-wildflower-honey',
    description: 'Our signature raw wildflower honey, harvested from pristine meadows. Unfiltered and unpasteurized to preserve all natural enzymes and pollen.',
    price: 18.99,
    image_url: 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date().toISOString(),
    in_stock: true,
    category: 'Raw Honey'
  },
  {
    id: '2',
    title: 'Organic Clover Honey',
    slug: 'organic-clover-honey',
    description: 'Light, sweet, and classic. This organic clover honey is perfect for sweetening tea, baking, or drizzling over morning toast.',
    price: 16.50,
    image_url: 'https://images.unsplash.com/photo-1587049352851-8d4e89134e5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    in_stock: true,
    category: 'Raw Honey'
  },
  {
    id: '3',
    title: 'Lavender Infused Honey',
    slug: 'lavender-infused-honey',
    description: 'Delicate raw honey infused with organic culinary lavender. A soothing addition to evening tea or drizzled over vanilla bean ice cream.',
    price: 22.00,
    image_url: 'https://images.unsplash.com/photo-1558961793-11232810f279?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    in_stock: true,
    category: 'Infused Honey'
  },
  {
    id: '4',
    title: 'Fresh Honeycomb Square',
    slug: 'fresh-honeycomb-square',
    description: '100% edible, raw honeycomb straight from the hive. The purest form of honey you can experience, perfect for charcuterie boards.',
    price: 28.50,
    image_url: 'https://images.unsplash.com/photo-1620063228965-037105021c32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    in_stock: true,
    category: 'Comb'
  },
  {
    id: '5',
    title: 'Hot Honey (Chili Infused)',
    slug: 'hot-honey',
    description: 'Sweet heat! Our raw honey infused with spicy chili flakes. Incredible on pizza, fried chicken, or roasted vegetables.',
    price: 19.99,
    image_url: 'https://images.unsplash.com/photo-1587049352847-4d4b126a51ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    in_stock: false,
    category: 'Infused Honey'
  },
  {
    id: '6',
    title: 'Artisan Honey Gift Set',
    slug: 'artisan-honey-gift-set',
    description: 'A beautiful trio of our most popular honeys: Wildflower, Clover, and Lavender infused. The perfect gift for any honey lover.',
    price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1587049352851-8d4e89134e5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    in_stock: true,
    category: 'Gift Set'
  },
  {
    id: '7',
    title: 'Buckwheat Dark Honey',
    slug: 'buckwheat-dark-honey',
    description: 'Rich, robust, and dark. Buckwheat honey has a molasses-like flavor and is packed with antioxidants.',
    price: 21.00,
    image_url: 'https://images.unsplash.com/photo-1558961793-11232810f279?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    in_stock: true,
    category: 'Raw Honey'
  },
  {
    id: '8',
    title: 'Orange Blossom Honey',
    slug: 'orange-blossom-honey',
    description: 'Light and citrusy, harvested from orange groves. A bright, sunny flavor that pairs perfectly with yogurt and fresh fruit.',
    price: 19.50,
    image_url: 'https://images.unsplash.com/photo-1620063228965-037105021c32?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    in_stock: true,
    category: 'Raw Honey'
  }
];
