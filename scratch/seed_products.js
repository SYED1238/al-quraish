const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Dynamic import of ESM poultryProducts data
console.log('Reading poultryProducts.js...');
let poultryContent = fs.readFileSync(
  path.join(__dirname, '../src/data/poultryProducts.js'),
  'utf8'
);
// Convert ESM export to CommonJS
poultryContent = poultryContent.replace('export const poultryProducts =', 'module.exports =');
const tempFile = path.join(__dirname, './temp_poultry.js');
fs.writeFileSync(tempFile, poultryContent);
const poultryProducts = require('./temp_poultry');
fs.unlinkSync(tempFile);

// 2. Fallback universe standard products
const universeProducts = [
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

// 3. Load Environment Variables from .env.local
console.log('Loading environment variables from .env.local...');
let envUrl = '';
let envKey = '';

try {
  const envContent = fs.readFileSync(
    path.join(__dirname, '../.env.local'),
    'utf8'
  );
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      envUrl = trimmed.split('=')[1].trim();
    }
    if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      envKey = trimmed.split('=')[1].trim();
    }
  }
} catch (e) {
  console.error('Failed to read .env.local file. Make sure it exists.', e);
  process.exit(1);
}

if (!envUrl || envUrl.includes('your-project-id') || !envKey || envKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')) {
  console.log('\n⚠️ ERROR: Please fill in your actual NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY inside .env.local before running the seed script.');
  process.exit(1);
}

const supabase = createClient(envUrl, envKey);

// 4. Seeding Logic
const seedDatabase = async () => {
  console.log('Formatting product items...');
  const seededProducts = [];

  // Map 22 Poultry Products
  poultryProducts.forEach(p => {
    seededProducts.push({
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.heroImage,
      description: p.description || 'Premium halal selection cut sourced with integrity and delivered fresh.',
      price: p.basePrice,
      stock: 75,
      tags: p.tags || [],
      weight_variants: p.weightVariants || ['500g', '1kg'],
      origin: p.origin || 'Certified Farms',
      freshness_score: p.freshnessScore || 98,
      process_date: p.processDate || 'Today',
      delivery_eta: p.eta || 'Same Day',
      nutritional_info: p.nutrition || {},
      preparation: p.preparation || '',
      gallery: p.gallery || [],
      packaging: p.packaging || 'Gold-Embossed Thermal Vacuum Shield',
      availability: p.availability || 'In Stock'
    });
  });

  // Map 6 Universe Products
  universeProducts.forEach(p => {
    seededProducts.push({
      id: p.id,
      name: p.name,
      category: p.category,
      image: p.image,
      description: p.description,
      price: p.price,
      stock: p.stock,
      tags: p.tags,
      weight_variants: p.weight_variants,
      origin: p.origin,
      freshness_score: p.freshness_score,
      process_date: p.process_date,
      delivery_eta: p.delivery_eta,
      nutritional_info: {},
      preparation: '',
      gallery: p.gallery || [],
      packaging: p.packaging || 'Signature Airtight Temperature Shield',
      availability: p.availability || 'In Stock'
    });
  });

  console.log(`Seeding ${seededProducts.length} products to database table 'products'...`);
  
  const { error } = await supabase
    .from('products')
    .upsert(seededProducts, { onConflict: 'id' });

  if (error) {
    console.error('Seeding encountered an error:', error);
  } else {
    console.log('🎉 Database products table successfully seeded!');
  }
};

seedDatabase();
