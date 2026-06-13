import { supabase } from '../lib/supabase';
import { poultryProducts } from '../data/poultryProducts';

const fallbackUniverseProducts = [
  { 
    id: 'norwegian_salmon_fillet',
    name: 'Norwegian Salmon Fillet', 
    category: 'Seafood', 
    price: 4300, 
    image: '/images/ocean_selection.png',
    description: 'Fresh Norwegian salmon fillet, rich in Omega-3, ideal for pan-searing or baking.',
    stock: 25,
    tags: ['Fresh', 'Seafood'],
    weight_variants: ['500g', '1kg'],
    origin: 'Norway',
    freshness_score: 99,
    process_date: 'Today',
    delivery_eta: 'Same Day'
  },
  { 
    id: 'wagyu_lamb_rack',
    name: 'Wagyu-Style Lamb Rack', 
    category: 'Meat', 
    price: 7400, 
    image: '/images/butchers_reserve.png',
    description: 'Exceptionally tender, grass-fed Wagyu-style lamb rack sourced from New Zealand.',
    stock: 12,
    tags: ['Gourmet Cuts', 'Meat'],
    weight_variants: ['750g', '1.5kg'],
    origin: 'New Zealand',
    freshness_score: 97,
    process_date: 'Today',
    delivery_eta: 'Next Day'
  },
  { 
    id: 'king_prawns_xl',
    name: 'King Prawns XL', 
    category: 'Seafood', 
    price: 3500, 
    image: '/images/ocean_selection.png',
    description: 'Extra-large prawns harvested from the Arabian Gulf. Sweet, firm, and juicy.',
    stock: 40,
    tags: ['Fresh', 'Seafood'],
    weight_variants: ['500g', '1kg'],
    origin: 'Arabian Gulf',
    freshness_score: 98,
    process_date: 'Today',
    delivery_eta: 'Same Day'
  },
  { 
    id: 'organic_chicken_breast_universe',
    name: 'Organic Chicken Breast', 
    category: 'Poultry', 
    price: 2000, 
    image: '/images/poultry/premium-boneless-chicken-breast-fillet.png',
    description: 'All-natural, hormone-free chicken breast portions. Lean protein-rich cuts.',
    stock: 50,
    tags: ['Boneless', 'Poultry'],
    weight_variants: ['500g', '1kg'],
    origin: 'Local Farms',
    freshness_score: 99,
    process_date: 'Today',
    delivery_eta: 'Same Day'
  },
  { 
    id: 'ribeye_steak_premium',
    name: 'Ribeye Steak Premium', 
    category: 'Meat', 
    price: 5650, 
    image: '/images/butchers_reserve.png',
    description: 'Premium Australian ribeye cut with exquisite marbling for intense, buttery flavor.',
    stock: 15,
    tags: ['Gourmet Cuts', 'Meat'],
    weight_variants: ['400g', '800g'],
    origin: 'Australia',
    freshness_score: 96,
    process_date: 'Yesterday',
    delivery_eta: 'Next Day'
  },
  { 
    id: 'wild_sea_bass',
    name: 'Wild Sea Bass', 
    category: 'Seafood', 
    price: 3800, 
    image: '/images/ocean_selection.png',
    description: 'Line-caught wild sea bass from the clean Mediterranean waters. Flaky, light meat.',
    stock: 20,
    tags: ['Fresh', 'Seafood'],
    weight_variants: ['600g', '1.2kg'],
    origin: 'Mediterranean',
    freshness_score: 98,
    process_date: 'Today',
    delivery_eta: 'Same Day'
  }
];

// Helper to format raw db rows to frontend UI schema
const mapDbProductToFrontend = (prod) => ({
  id: prod.id,
  name: prod.name,
  category: prod.category,
  heroImage: prod.image,
  image: prod.image,
  description: prod.description || '',
  basePrice: Number(prod.price),
  price: Number(prod.price),
  stock: prod.stock,
  tags: prod.tags || [],
  weightVariants: prod.weight_variants || ['500g', '1kg'],
  origin: prod.origin || 'Imported Sourcing',
  freshnessScore: prod.freshness_score || 98,
  processDate: prod.process_date || 'Today',
  delivery: prod.delivery_eta || 'Same Day',
  eta: prod.delivery_eta || 'Same Day',
  packaging: prod.packaging || 'Gold-Embossed Thermal Vacuum Shield',
  availability: prod.availability || 'In Stock',
  nutrition: prod.nutritional_info || { protein: '0g', fat: '0g', energy: '0 kcal', carbs: '0g' },
  preparation: prod.preparation || '',
  gallery: prod.gallery || []
});

export const productsService = {
  // Fetch all products
  getAllProducts: async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category');

      if (error || !data || data.length === 0) {
        // Fallback to static lists
        return [
          ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
          ...fallbackUniverseProducts
        ];
      }
      return data.map(mapDbProductToFrontend);
    } catch (e) {
      console.warn('Supabase products fetch failed, using fallbacks.', e);
      return [
        ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
        ...fallbackUniverseProducts
      ];
    }
  },

  // Get products by category
  getProductsByCategory: async (category) => {
    try {
      let query = supabase.from('products').select('*');
      if (category.toLowerCase() === 'poultry') {
        query = query.in('category', ['Chicken', 'Duck', 'Turkey', 'Poultry']);
      } else {
        query = query.eq('category', category);
      }
      const { data, error } = await query.order('name');

      if (error || !data || data.length === 0) {
        // Fallback filtering
        const all = [
          ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
          ...fallbackUniverseProducts
        ];
        if (category.toLowerCase() === 'poultry') {
          return all.filter(p => ['chicken', 'duck', 'turkey', 'poultry'].includes(p.category.toLowerCase()));
        }
        return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
      }
      return data.map(mapDbProductToFrontend);
    } catch (e) {
      const all = [
        ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
        ...fallbackUniverseProducts
      ];
      if (category.toLowerCase() === 'poultry') {
        return all.filter(p => ['chicken', 'duck', 'turkey', 'poultry'].includes(p.category.toLowerCase()));
      }
      return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        const all = [
          ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
          ...fallbackUniverseProducts
        ];
        return all.find(p => p.id === id) || null;
      }
      return mapDbProductToFrontend(data);
    } catch (e) {
      const all = [
        ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
        ...fallbackUniverseProducts
      ];
      return all.find(p => p.id === id) || null;
    }
  },

  // Update product record
  updateProduct: async (id, updateData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data && data.length > 0 ? mapDbProductToFrontend(data[0]) : null;
    } catch (e) {
      console.error(`Failed to update product ${id}:`, e);
      throw e;
    }
  }
};
