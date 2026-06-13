const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Mock supabase client
const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8');
let envUrl = '';
let envKey = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) envUrl = trimmed.split('=')[1].trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) envKey = trimmed.split('=')[1].trim();
}

const supabase = createClient(envUrl, envKey);

// Replicate productsService.getProductsByCategory logic
// Generate temp_poultry_mock
let poultryContent = fs.readFileSync(
  path.join(__dirname, '../src/data/poultryProducts.js'),
  'utf8'
);
poultryContent = poultryContent.replace('export const poultryProducts =', 'module.exports =');
fs.writeFileSync(path.join(__dirname, './temp_poultry_mock.js'), poultryContent);

const poultryProducts = require('./temp_poultry_mock.js');

const fallbackUniverseProducts = [
  { id: 'norwegian_salmon_fillet', category: 'Seafood', name: 'Norwegian Salmon Fillet' },
  { id: 'wagyu_lamb_rack', category: 'Meat', name: 'Wagyu-Style Lamb Rack' },
  { id: 'king_prawns_xl', category: 'Seafood', name: 'King Prawns XL' },
  { id: 'organic_chicken_breast_universe', category: 'Poultry', name: 'Organic Chicken Breast' },
  { id: 'ribeye_steak_premium', category: 'Meat', name: 'Ribeye Steak Premium' },
  { id: 'wild_sea_bass', category: 'Seafood', name: 'Wild Sea Bass' }
];

const mapDbProductToFrontend = (prod) => ({
  id: prod.id,
  name: prod.name,
  category: prod.category,
  image: prod.image,
  tags: prod.tags || []
});

async function getProductsByCategory(category) {
  try {
    let query = supabase.from('products').select('*');
    if (category.toLowerCase() === 'poultry') {
      query = query.in('category', ['Chicken', 'Duck', 'Turkey', 'Poultry']);
    } else {
      query = query.eq('category', category);
    }
    const { data, error } = await query.order('name');

    if (error || !data || data.length === 0) {
      console.log('Query failed or returned 0, using fallback. Error:', error);
      const all = [
        ...poultryProducts.map(p => ({ ...p, price: p.basePrice })),
        ...fallbackUniverseProducts
      ];
      if (category.toLowerCase() === 'poultry') {
        return all.filter(p => ['chicken', 'duck', 'turkey', 'poultry'].includes(p.category.toLowerCase()));
      }
      return all.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }
    console.log('Query succeeded, records found:', data.length);
    return data.map(mapDbProductToFrontend);
  } catch (e) {
    console.error('Exception:', e);
  }
}

getProductsByCategory('Poultry').then(res => {
  console.log('Mapped products count:', res.length);
  fs.unlinkSync(path.join(__dirname, './temp_poultry_mock.js'));
});
